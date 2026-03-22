import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import RadiusSlider from "../components/RadiusSlider";
import DetectionDemo from "../components/DetectionDemo";

const DEFAULT_LOCATION = { lat: 49.2635, lng: -123.0735 };

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(1.5);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationLabel, setLocationLabel] = useState("Commercial Drive, Vancouver");

  function onSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams({
      query,
      lat: String(location.lat),
      lng: String(location.lng),
      radius_km: String(radiusKm),
    });
    navigate(`/results?${params.toString()}`);
  }

  function onUseCurrentLocation() {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLocationLabel("Current location");
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white">
        <p className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide">
          AI discovery engine
        </p>
        <h1 className="mb-3 text-3xl font-bold">Find local businesses Google misses</h1>
        <p className="mb-6 max-w-3xl text-sm text-slate-100">
          StreetTrade proactively discovers storefronts from street-level imagery, classifies
          them with VLMs, and ranks opportunities near you.
        </p>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSearch={onSearch}
          onUseCurrentLocation={onUseCurrentLocation}
        />
        <div className="mt-4">
          <RadiusSlider radiusKm={radiusKm} onChange={setRadiusKm} />
        </div>
        <p className="mt-3 text-xs text-slate-200">
          Searching around: {locationLabel} ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
        </p>
      </section>

      <DetectionDemo />
    </div>
  );
}
