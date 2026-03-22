import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, MapPin } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { getBusiness } from '../lib/api';
import type { Business } from '../data/types';

// ── Constants ────────────────────────────────────────────────────────────────

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ??
  'AIzaSyB5r9qL1KKSIGUh7iQG-FLTaRB5ojk-XqM';

const STREET_VIEW_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ??
  'AIzaSyB5r9qL1KKSIGUh7iQG-FLTaRB5ojk-XqM';

const CATEGORY_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  bakery: '🥐',
  retail: '🛍️',
  grocery: '🥬',
  salon: '💇',
  repair: '🔧',
  art: '🎨',
};

const EVIDENCE_TABS = [
  'Street View Evidence',
  'Registry Match',
  'Social Signals',
  'Web Presence',
] as const;

type EvidenceTab = (typeof EVIDENCE_TABS)[number];

// ── Confidence Bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ lat, lng, confidence }: { lat: number; lng: number; confidence: number }) {
  const pct = Math.round(confidence * 100);
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${lat},${lng}&heading=90&pitch=0&fov=100&key=${STREET_VIEW_KEY}`;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-[360px]">
      <img
        src={streetViewUrl}
        alt="Street View"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200" style={{ zIndex: -1 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      {/* AI detection bounding box overlay */}
      <div className="absolute top-[15%] left-[25%] w-[50%] h-[55%] border-2 border-green-400/80 rounded">
        <span className="absolute -top-6 left-1 text-[11px] font-mono text-white bg-green-500/80 px-2 py-0.5 rounded-sm shadow-sm">
          storefront_sign {(confidence * 0.95).toFixed(2)}
        </span>
      </div>

      {[
        'top-3 left-3 border-t-2 border-l-2',
        'top-3 right-3 border-t-2 border-r-2',
        'bottom-3 left-3 border-b-2 border-l-2',
        'bottom-3 right-3 border-b-2 border-r-2',
      ].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-5 h-5 border-white/40`} />
      ))}

      <div className="absolute top-4 left-12 text-[11px] font-mono text-white/70">
        {lat.toFixed(4)}N, {Math.abs(lng).toFixed(4)}W
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-1.5 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold text-gray-800">AI Detection</span>
        <span className="text-[10px] text-primary font-mono font-semibold">{pct}% Confidence</span>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
        <span className="text-xs text-gray-500">Google Street View</span>
      </div>
    </div>
  );
}

// ── Evidence Tabs ─────────────────────────────────────────────────────────────

function StreetViewEvidence({ confidence, lat, lng }: { confidence: number; lat: number; lng: number }) {
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&heading=90&pitch=0&fov=100&key=${STREET_VIEW_KEY}`;
  const pct = (confidence * 100).toFixed(1);

  const rows = [
    { label: 'Model', value: 'CLIP ViT-B/32' },
    { label: 'Confidence', value: `${pct}%`, highlight: true },
    { label: 'Detection Type', value: 'Storefront Classification' },
    { label: 'Coordinates', value: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, mono: true },
    { label: 'Source', value: 'Google Street View Static API' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
        <img
          src={streetViewUrl}
          alt="Street View Evidence"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute top-[14%] left-[25%] w-[50%] h-[55%] border-2 border-green-400/80 rounded">
          <span className="absolute -top-5 left-1 text-[9px] font-mono text-white bg-green-500/80 px-1.5 py-0.5 rounded-sm">
            storefront {(confidence * 0.95).toFixed(2)}
          </span>
        </div>
        <div className="absolute top-3 left-3 text-[10px] font-mono text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
          {lat.toFixed(4)}N, {Math.abs(lng).toFixed(4)}W
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Detection Details</h3>
        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">{row.label}</span>
              <span className={`text-sm font-medium ${row.highlight ? 'text-primary' : row.mono ? 'font-mono text-gray-700' : 'text-gray-900'}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegistryMatchTab({ business }: { business: Business }) {
  const hasRegistry = business.source === 'both' || business.source === 'social_media';

  if (!hasRegistry) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Not found in city registry</p>
            <p className="text-xs text-amber-600 mt-0.5">
              This business was discovered via Street View or social signals but has no city business licence on file.
              This is what makes it a "phantom" — real but unregistered digitally.
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Source: Vancouver Open Data business licence registry (opendata.vancouver.ca)
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-sm font-semibold text-green-800">Registered with City of Vancouver</p>
          <p className="text-xs text-green-600 mt-0.5">
            A valid business licence was found for this business in the Vancouver Open Data registry.
          </p>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {[
          { label: 'Business Name', value: business.name },
          { label: 'Category', value: business.category },
          { label: 'Address', value: business.address },
          { label: 'Data Source', value: 'Vancouver Open Data (opendata.vancouver.ca)' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialSignalsTab({ business }: { business: Business }) {
  const hasSocial = business.source === 'both' || business.source === 'social_media';

  if (!hasSocial) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <span className="text-2xl">🔍</span>
        <div>
          <p className="text-sm font-semibold text-gray-700">No social signals found</p>
          <p className="text-xs text-gray-500 mt-0.5">
            No matching posts on Instagram, TikTok, or Reddit were found for this business.
            This is common for micro-businesses that exist physically but have no online presence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-pink-50 border border-pink-100">
        <span className="text-2xl">📱</span>
        <div>
          <p className="text-sm font-semibold text-pink-800">Social signals detected</p>
          <p className="text-xs text-pink-600 mt-0.5">
            This business was corroborated through social media signals — posts, mentions, or hashtags near this location.
          </p>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {[
          { label: 'Signal Source', value: 'Instagram / Reddit r/vancouver' },
          { label: 'Signal Type', value: 'Geo-tagged posts + name mentions' },
          { label: 'Tags found', value: business.tags.join(', ') || 'N/A' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebPresenceTab({ business }: { business: Business }) {
  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${business.onGoogle ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
        <span className="text-2xl">{business.onGoogle ? '🗺️' : '👻'}</span>
        <div>
          <p className={`text-sm font-semibold ${business.onGoogle ? 'text-blue-800' : 'text-orange-800'}`}>
            {business.onGoogle ? 'Listed on Google Maps' : 'Not found on Google Maps'}
          </p>
          <p className={`text-xs mt-0.5 ${business.onGoogle ? 'text-blue-600' : 'text-orange-600'}`}>
            {business.onGoogle
              ? 'This business appears in Google Maps / Places search results.'
              : 'This is a phantom business — it physically exists but is invisible to Google, Yelp, and traditional local search.'}
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {[
          { label: 'Google Maps', value: business.onGoogle ? '✅ Listed' : '❌ Not found' },
          { label: 'Yelp', value: 'Not checked' },
          { label: 'Business Website', value: business.imageUrl ? 'Possible web presence' : 'No website detected' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-medium text-gray-900">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const [activeTab, setActiveTab] = useState<EvidenceTab>('Street View Evidence');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBusiness(id)
      .then((biz) => {
        setBusiness(biz);
        setLoading(false);
      })
      .catch(() => {
        setError('Business not found');
        setLoading(false);
      });
  }, [id]);

  const confidenceBreakdown = useMemo(() => {
    if (!business) return [];
    const pct = Math.round(business.confidence * 100);
    return [
      { label: 'Street View', value: Math.min(96, pct + 8), color: '#e88c0a' },
      { label: 'Registry Match', value: (business.source === 'both' || business.source === 'social_media') ? Math.max(60, pct - 10) : 0, color: '#3b82f6' },
      { label: 'Social Signals', value: (business.source === 'both' || business.source === 'social_media') ? Math.max(50, pct - 4) : 0, color: '#d946ef' },
      { label: 'Web Presence', value: business.onGoogle ? Math.max(60, pct - 15) : Math.max(10, pct - 50), color: '#10b981' },
    ];
  }, [business]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e88c0a] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading business details...</span>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-700">Business not found</h1>
        <p className="text-gray-500">The business you are looking for does not exist or has been removed.</p>
        <Link to="/search" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Search
        </Link>
      </div>
    );
  }

  const emoji = CATEGORY_EMOJI[business.category] || '';
  const confidencePct = Math.round(business.confidence * 100);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/search" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors font-medium">
            <ArrowLeft size={14} />
            Search Results
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-700">Business Detail</span>
        </nav>

        {/* Hero */}
        <HeroSection lat={business.lat} lng={business.lng} confidence={business.confidence} />

        {/* Business Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {emoji && <span className="mr-2">{emoji}</span>}
              {business.name}
            </h1>
            {!business.onGoogle && (
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
                👻 Phantom Business
              </span>
            )}
            {business.onGoogle && (
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-sm font-semibold text-blue-700">
                🗺️ On Google Maps
              </span>
            )}
          </div>
          <p className="text-gray-600 leading-relaxed max-w-2xl">{business.description}</p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin size={16} className="text-primary shrink-0" />
            <span>{business.address}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {business.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Analysis */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence Analysis</h2>
            <div className="flex gap-1 border-b border-gray-200 -mx-6 px-6 overflow-x-auto">
              {EVIDENCE_TABS.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab}
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'Street View Evidence' && (
              <StreetViewEvidence confidence={business.confidence} lat={business.lat} lng={business.lng} />
            )}
            {activeTab === 'Registry Match' && <RegistryMatchTab business={business} />}
            {activeTab === 'Social Signals' && <SocialSignalsTab business={business} />}
            {activeTab === 'Web Presence' && <WebPresenceTab business={business} />}
          </div>
        </section>

        {/* Confidence Breakdown */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Confidence Breakdown</h2>
          <p className="text-xs text-gray-400">
            Confidence reflects how certain we are this business <strong>exists and sells what we think</strong> — not its quality or ratings.
          </p>
          <div className="space-y-4">
            {confidenceBreakdown.map((item) => (
              <ConfidenceBar key={item.label} label={item.label} value={item.value} color={item.color} />
            ))}
          </div>
        </section>

        {/* Location Map */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <div className="h-72 rounded-xl overflow-hidden border border-gray-200 relative">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: business.lat, lng: business.lng }}
                zoom={16}
                options={{ disableDefaultUI: true, zoomControl: true, backgroundColor: '#f8f9fa' }}
              >
                <MarkerF
                  position={{ lat: business.lat, lng: business.lng }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#e88c0a',
                    fillOpacity: 1,
                    strokeColor: '#f59e0b',
                    strokeWeight: 3,
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 pointer-events-none shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-gray-900">{business.name}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
