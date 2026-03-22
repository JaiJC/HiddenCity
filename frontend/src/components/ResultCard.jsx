export default function ResultCard({ business, distanceKm }) {
  const confidencePercent = Math.round(business.confidence * 100);

  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{business.name}</h3>
          <p className="text-sm text-slate-500">{business.address}</p>
        </div>
        {!business.already_on_google && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            ⭐ Only on StreetTrade
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {business.category}
        </span>
        <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
          {business.source}
        </span>
        <span className="text-xs text-slate-500">{distanceKm.toFixed(2)} km away</span>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Confidence</span>
          <span>{confidencePercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-streettrade-accent"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>
    </article>
  );
}
