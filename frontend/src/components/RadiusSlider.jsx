export default function RadiusSlider({ radiusKm, onChange }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="radius" className="text-sm font-medium text-slate-700">
          Search radius
        </label>
        <span className="text-sm font-semibold">{radiusKm.toFixed(1)} km</span>
      </div>
      <input
        id="radius"
        type="range"
        min={0.5}
        max={10}
        step={0.5}
        value={radiusKm}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-streettrade-accent"
      />
    </div>
  );
}
