import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronRight } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { mockBusinesses } from '../data/mockBusinesses';

// ── Constants ────────────────────────────────────────────────────────────────

const GOOGLE_MAPS_API_KEY = 'AIzaSyB5r9qL1KKSIGUh7iQG-FLTaRB5ojk-XqM';

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

function ConfidenceBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
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

function HeroSection({
  lat,
  lng,
  confidence,
}: {
  lat: number;
  lng: number;
  confidence: number;
}) {
  const pct = Math.round(confidence * 100);
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${lat},${lng}&heading=90&pitch=0&fov=100&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-[360px]">
      {/* Street View image */}
      <img
        src={streetViewUrl}
        alt="Street View"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Fallback gradient if image fails */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200" style={{ zIndex: -1 }} />

      {/* Subtle overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      {/* AI detection bounding box overlay */}
      <div className="absolute top-[15%] left-[25%] w-[50%] h-[55%] border-2 border-green-400/80 rounded">
        <span className="absolute -top-6 left-1 text-[11px] font-mono text-white bg-green-500/80 px-2 py-0.5 rounded-sm shadow-sm">
          storefront_sign {(confidence * 0.95).toFixed(2)}
        </span>
      </div>

      {/* Corner scan brackets */}
      {[
        'top-3 left-3 border-t-2 border-l-2',
        'top-3 right-3 border-t-2 border-r-2',
        'bottom-3 left-3 border-b-2 border-l-2',
        'bottom-3 right-3 border-b-2 border-r-2',
      ].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-5 h-5 border-white/40`} />
      ))}

      {/* Coordinates */}
      <div className="absolute top-4 left-12 text-[11px] font-mono text-white/70">
        {lat.toFixed(4)}N, {Math.abs(lng).toFixed(4)}W
      </div>

      {/* AI Detection badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-1.5 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold text-gray-800">
          AI Detection
        </span>
        <span className="text-[10px] text-primary font-mono font-semibold">
          {pct}% Confidence
        </span>
      </div>

      {/* Source badge */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
        <span className="text-xs text-gray-500">Google Street View</span>
      </div>
    </div>
  );
}

// ── Detection Detail Table ──────────────────────────────────────────────────

function DetectionDetails({ confidence }: { confidence: number }) {
  const pct = (confidence * 100).toFixed(1);
  const rows = [
    { label: 'Model', value: 'YOLOv8-Storefront v2.4' },
    { label: 'Confidence', value: `${pct}%`, highlight: true },
    { label: 'Detection Type', value: 'Storefront Signage' },
    { label: 'Bounding Box', value: '[256, 84, 890, 392]', mono: true },
    { label: 'Last Scanned', value: 'Mar 18, 2026' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Detection Details</h3>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2.5"
          >
            <span className="text-sm text-gray-500">{row.label}</span>
            <span
              className={`text-sm font-medium ${
                row.highlight
                  ? 'text-primary'
                  : row.mono
                    ? 'font-mono text-gray-700'
                    : 'text-gray-900'
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Street View Evidence (inside tab) ────────────────────────────────────────

function StreetViewEvidence({
  confidence,
  lat,
  lng,
}: {
  confidence: number;
  lat: number;
  lng: number;
}) {
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&heading=90&pitch=0&fov=100&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Street View with detection overlay */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
        <img
          src={streetViewUrl}
          alt="Street View Evidence"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {/* Detection bounding box */}
        <div className="absolute top-[14%] left-[25%] w-[50%] h-[55%] border-2 border-green-400/80 rounded">
          <span className="absolute -top-5 left-1 text-[9px] font-mono text-white bg-green-500/80 px-1.5 py-0.5 rounded-sm">
            storefront_sign {(confidence * 0.95).toFixed(2)}
          </span>
        </div>
        <div className="absolute top-3 left-3 text-[10px] font-mono text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
          {lat.toFixed(4)}N, {Math.abs(lng).toFixed(4)}W
        </div>
      </div>

      {/* Right: detection details table */}
      <DetectionDetails confidence={confidence} />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const business = useMemo(() => mockBusinesses.find((b) => b.id === id), [id]);
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const [activeTab, setActiveTab] = useState<EvidenceTab>(
    'Street View Evidence',
  );

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-700">
          Business not found
        </h1>
        <p className="text-gray-500">
          The business you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Search
        </Link>
      </div>
    );
  }

  const confidencePct = Math.round(business.confidence * 100);
  const emoji = CATEGORY_EMOJI[business.category] || '';

  // Simulated sub-scores for the confidence breakdown
  const confidenceBreakdown = [
    { label: 'Street View', value: Math.min(96, confidencePct + 8), color: '#e88c0a' },
    { label: 'Registry Match', value: Math.max(45, confidencePct - 10), color: '#3b82f6' },
    { label: 'Social Signals', value: Math.max(50, confidencePct - 4), color: '#d946ef' },
    { label: 'Web Presence', value: Math.max(30, confidencePct - 43), color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Search Results
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-700">Business Detail</span>
        </nav>

        {/* ── Hero ── */}
        <HeroSection
          lat={business.lat}
          lng={business.lng}
          confidence={business.confidence}
        />

        {/* ── Business Header ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {emoji && <span className="mr-2">{emoji}</span>}
              {business.name}
            </h1>
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary">
              Phantom Business
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin size={16} className="text-primary shrink-0" />
            <span>{business.address}</span>
            <span className="text-gray-300 mx-1">&middot;</span>
            <span className="text-gray-400">1.2 mi away</span>
          </div>
        </div>

        {/* ── Evidence Analysis ── */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Evidence Analysis
            </h2>
            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 -mx-6 px-6">
              {EVIDENCE_TABS.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                      isActive
                        ? 'text-primary'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'Street View Evidence' && (
              <StreetViewEvidence
                confidence={business.confidence}
                lat={business.lat}
                lng={business.lng}
              />
            )}
            {activeTab === 'Registry Match' && (
              <div className="text-gray-400 text-sm py-8 text-center">
                Registry match data not yet available for this business.
              </div>
            )}
            {activeTab === 'Social Signals' && (
              <div className="text-gray-400 text-sm py-8 text-center">
                Social signals analysis is pending review.
              </div>
            )}
            {activeTab === 'Web Presence' && (
              <div className="text-gray-400 text-sm py-8 text-center">
                Web presence scan results will appear here.
              </div>
            )}
          </div>
        </section>

        {/* ── Confidence Breakdown ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Confidence Breakdown
          </h2>
          <div className="space-y-4">
            {confidenceBreakdown.map((item) => (
              <ConfidenceBar
                key={item.label}
                label={item.label}
                value={item.value}
                color={item.color}
              />
            ))}
          </div>
        </section>

        {/* ── Location Map ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <div className="h-72 rounded-xl overflow-hidden border border-gray-200 relative">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: business.lat, lng: business.lng }}
                zoom={16}
                options={{
                  styles: [],
                  disableDefaultUI: true,
                  zoomControl: true,
                  backgroundColor: '#f8f9fa',
                }}
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
            {/* Floating label */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 pointer-events-none shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-gray-900">
                {business.name}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
