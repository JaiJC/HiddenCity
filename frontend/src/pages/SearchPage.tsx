import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import type { SortOption, SourceFilter, DistanceFilter } from '../components/FilterBar';
import BusinessCard from '../components/BusinessCard';
import MapView from '../components/MapView';
import { searchBusinesses } from '../lib/api';
import type { Business, Category } from '../data/types';

const VANCOUVER_CENTER: [number, number] = [49.27, -123.0724];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortOption>('confidence');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [distance, setDistance] = useState<DistanceFilter>('5km');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [mapCenter, setMapCenter] = useState<[number, number]>(VANCOUVER_CENTER);
  const listRef = useRef<HTMLDivElement>(null);

  // All businesses loaded from API
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    searchBusinesses()
      .then((result) => {
        setAllBusinesses(result.businesses);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load businesses';
        setError(msg);
        setLoading(false);
      });
  }, []);

  const distanceKm = useMemo(() => {
    const map: Record<DistanceFilter, number> = { '500m': 0.5, '1km': 1, '2km': 2, '5km': 5 };
    return map[distance];
  }, [distance]);

  const getDistanceKm = useCallback((lat: number, lng: number) => {
    const dLat = (lat - VANCOUVER_CENTER[0]) * 111;
    const dLng = (lng - VANCOUVER_CENTER[1]) * 111 * Math.cos((VANCOUVER_CENTER[0] * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }, []);

  const filtered = useMemo(() => {
    let results = allBusinesses.filter((biz) => {
      if (category !== 'all' && biz.category !== category) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesQuery =
          biz.name.toLowerCase().includes(q) ||
          biz.tags.some((t) => t.toLowerCase().includes(q)) ||
          biz.description.toLowerCase().includes(q) ||
          biz.category.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (sourceFilter !== 'all' && biz.source !== sourceFilter) return false;

      if (getDistanceKm(biz.lat, biz.lng) > distanceKm) return false;

      return true;
    });

    if (sortBy === 'confidence') {
      results = [...results].sort((a, b) => b.confidence - a.confidence);
    } else if (sortBy === 'name') {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }, [allBusinesses, query, category, sortBy, sourceFilter, distanceKm, getDistanceKm]);

  const totalCount = filtered.length;

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const handleSelectBusiness = useCallback(
    (id: string) => {
      navigate(`/business/${id}`);
    },
    [navigate],
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      const biz = allBusinesses.find((b) => b.id === id);
      if (biz) {
        setMapCenter([biz.lat, biz.lng]);
      }
    },
    [allBusinesses],
  );

  useEffect(() => {
    if (selectedId && listRef.current) {
      const card = listRef.current.querySelector(`[data-biz-id="${selectedId}"]`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Search bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <SearchBar
          onSearch={handleSearch}
          onSelectBusiness={handleSelectBusiness}
          initialQuery={initialQuery}
          businesses={allBusinesses}
        />
      </header>

      {/* Filter bar */}
      <FilterBar
        category={category}
        onCategoryChange={setCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sourceFilter={sourceFilter}
        onSourceChange={setSourceFilter}
        distance={distance}
        onDistanceChange={setDistance}
        resultCount={totalCount}
        query={query || undefined}
      />

      {/* Main content: list + map */}
      <div className="flex-1 flex flex-row overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Business list — 45% */}
        <div
          ref={listRef}
          className="w-[45%] shrink-0 overflow-y-auto bg-white border-r border-gray-100 p-4 space-y-3"
        >
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#e88c0a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading businesses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-gray-400">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium text-red-400">Could not load businesses</p>
              <p className="text-xs mt-1 text-gray-400">{error}</p>
              <p className="text-xs mt-2 text-gray-400">Make sure the backend is running on port 8000</p>
            </div>
          ) : (
            <>
              {query && (
                <div className="pb-2">
                  <h2 className="text-sm text-gray-400">
                    <span className="text-gray-900 font-semibold">{totalCount} results</span>
                    {' for '}
                    <span className="text-[#e88c0a] font-medium">'{query}'</span>
                  </h2>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No businesses found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                filtered.map((biz) => (
                  <div key={biz.id} data-biz-id={biz.id}>
                    <BusinessCard
                      business={biz}
                      isSelected={selectedId === biz.id}
                      onClick={() => handleSelect(biz.id)}
                    />
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Map — 55% */}
        <div className="flex-1">
          <MapView
            businesses={filtered}
            selectedId={selectedId}
            onSelect={handleSelect}
            center={mapCenter}
          />
        </div>
      </div>
    </div>
  );
}
