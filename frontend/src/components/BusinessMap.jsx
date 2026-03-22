import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

export default function BusinessMap({ businesses, center, radiusKm }) {
  const mapCenter = [center.lat || 49.2635, center.lng || -123.0735];
  const radiusMeters = radiusKm * 1000;

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <MapContainer center={mapCenter} zoom={14} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={mapCenter}
          radius={radiusMeters}
          pathOptions={{ color: "#0ea5e9", fillColor: "#bae6fd", fillOpacity: 0.18 }}
        />
        {businesses.map((business) => (
          <CircleMarker
            key={business.id}
            center={[business.lat, business.lng]}
            radius={8}
            pathOptions={{
              color: business.already_on_google ? "#2563eb" : "#16a34a",
              fillColor: business.already_on_google ? "#2563eb" : "#16a34a",
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{business.name}</p>
                <p className="text-xs text-slate-600">{business.category}</p>
                <p className="text-xs text-slate-500">{business.address}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
