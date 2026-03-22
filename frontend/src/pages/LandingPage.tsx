import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, MapPin, Clock } from 'lucide-react';
import { mockBusinesses, categories } from '../data/mockBusinesses';

// ── Curated collections ─────────────────────────────────────────────────────

const collections = [
  {
    emoji: '☕',
    title: 'Hidden Cafés',
    description: 'Cozy spots Google doesn\u2019t know about',
    category: 'cafe',
    gradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-100',
  },
  {
    emoji: '🍽️',
    title: 'Secret Kitchens',
    description: 'Family-run gems off the radar',
    category: 'restaurant',
    gradient: 'from-red-50 to-pink-50',
    border: 'border-red-100',
  },
  {
    emoji: '🎨',
    title: 'Underground Art',
    description: 'Studios & galleries hidden from search',
    category: 'art',
    gradient: 'from-violet-50 to-purple-50',
    border: 'border-violet-100',
  },
  {
    emoji: '🛍️',
    title: 'Vintage Finds',
    description: 'Thrift stores & hidden retail',
    category: 'retail',
    gradient: 'from-sky-50 to-blue-50',
    border: 'border-sky-100',
  },
];

// ── Live discovery feed items ───────────────────────────────────────────────

const discoveryFeed = [
  { name: 'Artisan Pottery Studio', area: 'Commercial Dr', time: '2 min ago', emoji: '🎨' },
  { name: 'Mama Chen Dumplings', area: 'E Hastings', time: '8 min ago', emoji: '🍽️' },
  { name: 'The Vinyl Basement', area: 'Main St', time: '14 min ago', emoji: '🛍️' },
  { name: 'Bloom & Grind', area: 'Fraser St', time: '22 min ago', emoji: '☕' },
  { name: 'Stitches Tailor Shop', area: 'Kingsway', time: '31 min ago', emoji: '🔧' },
];

// ── Google comparison stats ─────────────────────────────────────────────────

function getComparisonStats() {
  const total = mockBusinesses.length;
  const hidden = mockBusinesses.filter((b) => !b.onGoogle).length;
  const googleOnly = total - hidden;
  return { total, hidden, googleOnly };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [feedIndex, setFeedIndex] = useState(0);
  const stats = getComparisonStats();

  // Rotate live feed
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedIndex((i) => (i + 1) % discoveryFeed.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    navigate(`/search?${params.toString()}`);
  }

  const currentDiscovery = discoveryFeed[feedIndex];

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 pt-24 pb-16 text-center bg-gradient-to-b from-white via-white to-[#faf9f7]">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-600">
          <Sparkles size={14} className="text-primary" />
          <span>AI-Powered Discovery</span>
        </div>

        {/* Heading */}
        <h1 className="max-w-3xl text-5xl leading-[1.08] font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
          See the Unseen
          <br />
          <span className="text-primary">Around You</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-500 sm:text-xl">
          Find places not easily found on Google.
          <br className="hidden sm:block" />
          Discover local secrets!
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-10 w-full max-w-2xl">
          <div className="flex items-center rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 focus-within:shadow-lg focus-within:shadow-gray-200/50 focus-within:border-gray-300">
            <div className="flex flex-1 items-center px-5">
              <Search size={20} className="shrink-0 text-gray-300" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="vintage bookstores near me..."
                className="w-full bg-transparent px-3 py-4.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                aria-label="Search query"
              />
            </div>
            <button
              type="submit"
              className="mr-2 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </form>

        {/* Google Comparison Counter */}
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-400">
          <span>
            Google shows <span className="font-semibold text-gray-600">{stats.googleOnly}</span> businesses
          </span>
          <span className="text-gray-300">·</span>
          <span>
            We found <span className="font-bold text-primary">{stats.total}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-primary font-medium">
            +{stats.hidden} hidden
          </span>
        </div>

        {/* Live Discovery Feed */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-100 bg-white px-5 py-2.5 shadow-sm transition-all duration-500">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-xs font-medium text-green-600">LIVE</span>
          </div>
          <span className="text-sm text-gray-500">
            <span className="text-base mr-1">{currentDiscovery.emoji}</span>
            <span className="font-medium text-gray-700">{currentDiscovery.name}</span>
            {' · '}
            {currentDiscovery.area}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={10} />
            {currentDiscovery.time}
          </span>
        </div>
      </section>

      {/* ── Quick Category Browse ── */}
      <section className="px-4 py-16 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Browse by Category
            </h2>
            <p className="mt-2 text-gray-400">
              Tap to explore what's hidden near you
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories
              .filter((c) => c.value !== 'all')
              .map((cat) => {
                const count = mockBusinesses.filter(
                  (b) => b.category === cat.value && !b.onGoogle,
                ).length;
                return (
                  <Link
                    key={cat.value}
                    to={`/search?type=${cat.value}`}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5"
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                      {cat.label}
                    </span>
                    {count > 0 && (
                      <span className="text-xs text-primary font-medium">
                        +{count} hidden
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* ── Curated Collections ── */}
      <section className="px-4 py-16 bg-[#faf9f7]">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Curated Collections
              </h2>
              <p className="mt-2 text-gray-400">
                Hand-picked discoveries exclusive to Hidden City
              </p>
            </div>
            <Link
              to="/search"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {collections.map((col) => {
              const count = mockBusinesses.filter(
                (b) => b.category === col.category && !b.onGoogle,
              ).length;
              return (
                <Link
                  key={col.title}
                  to={`/search?type=${col.category}`}
                  className={`group relative overflow-hidden rounded-2xl border ${col.border} bg-gradient-to-br ${col.gradient} p-6 transition-all hover:shadow-lg hover:-translate-y-1`}
                >
                  <span className="text-4xl">{col.emoji}</span>
                  <h3 className="mt-3 text-lg font-bold text-gray-900">{col.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{col.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{count} places</span>
                    <ArrowRight size={12} className="text-primary opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Recently Discovered ── */}
      <section className="px-4 py-16 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Recently Discovered
              </h2>
              <p className="mt-2 text-gray-400">
                Fresh finds from our AI scanner
              </p>
            </div>
            <Link
              to="/search"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              See all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBusinesses
              .filter((b) => !b.onGoogle)
              .sort((a, b) => b.confidence - a.confidence)
              .slice(0, 6)
              .map((biz) => {
                const catData = categories.find((c) => c.value === biz.category);
                return (
                  <Link
                    key={biz.id}
                    to={`/business/${biz.id}`}
                    className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md hover:border-gray-200"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-2xl">
                      {catData?.icon || '📍'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                        {biz.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin size={10} />
                        <span className="truncate">{biz.address}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round(biz.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          {Math.round(biz.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="relative px-4 py-24 bg-[#faf9f7]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
            About Hidden City
          </h2>
          <p className="text-lg leading-relaxed text-gray-500">
            Hidden City uses AI to discover businesses that are invisible to traditional
            search — no Google listing, no website, no digital footprint. We find them
            through street-level imagery and social signals.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { value: '10K+', label: 'Businesses Discovered' },
              { value: '94%', label: 'Verification Accuracy' },
              { value: '50+', label: 'Neighborhoods Mapped' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm"
              >
                <p className="text-2xl font-extrabold text-primary">{value}</p>
                <p className="mt-1 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
