export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  onUseCurrentLocation,
}) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSearch}>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder='Try "barbershop", "thai", "grocery"'
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-streettrade-accent"
      />
      <button
        type="button"
        onClick={onUseCurrentLocation}
        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium hover:bg-slate-100"
      >
        Search near me
      </button>
      <button
        type="submit"
        className="rounded-xl bg-streettrade-ink px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Search
      </button>
    </form>
  );
}
