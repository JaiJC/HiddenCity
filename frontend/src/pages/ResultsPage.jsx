import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import BusinessMap from "../components/BusinessMap";
import ResultCard from "../components/ResultCard";
import {
  fetchDiscoverStatus,
  searchBusinesses,
  triggerDiscover,
} from "../lib/api";

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return r * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function ResultsPage() {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();

  const query = params.get("query") || "";
  const lat = Number(params.get("lat") || 49.2635);
  const lng = Number(params.get("lng") || -123.0735);
  const radiusKm = Number(params.get("radius_km") || 1.5);

  const searchQuery = useQuery({
    queryKey: ["search", query, lat, lng, radiusKm],
    queryFn: () => searchBusinesses({ query, lat, lng, radiusKm }),
  });

  const discoverMutation = useMutation({
    mutationFn: () => triggerDiscover({ lat, lng, radius_km: radiusKm }),
  });

  const statusQuery = useQuery({
    queryKey: ["discover-status", discoverMutation.data?.job_id],
    queryFn: () => fetchDiscoverStatus(discoverMutation.data.job_id),
    enabled: Boolean(discoverMutation.data?.job_id),
    refetchInterval: (queryData) =>
      queryData?.state?.data?.status === "completed" ? false : 1500,
  });

  const businesses = searchQuery.data || [];
  const businessesWithDistance = useMemo(
    () =>
      businesses.map((business) => ({
        business,
        distanceKm: haversineKm(lat, lng, business.lat, business.lng),
      })),
    [businesses, lat, lng]
  );

  const status = statusQuery.data;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Discovery Results</h1>
            <p className="text-sm text-slate-600">
              Query: <span className="font-medium">{query || "all businesses"}</span> within{" "}
              {radiusKm.toFixed(1)} km
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              discoverMutation.mutate(undefined, {
                onSuccess: () => queryClient.invalidateQueries({ queryKey: ["search"] }),
              })
            }
            className="rounded-xl bg-streettrade-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Run discovery in this area
          </button>
        </div>
        {status && (
          <p className="mt-3 text-sm text-slate-600">
            Job status: <span className="font-medium">{status.status}</span> ({status.progress}%)
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_1.45fr]">
        <div className="max-h-[560px] space-y-3 overflow-auto pr-1">
          {searchQuery.isLoading && <p className="text-sm text-slate-600">Loading results...</p>}
          {searchQuery.isError && (
            <p className="text-sm text-red-600">
              Search failed. Make sure the backend is running at VITE_API_URL.
            </p>
          )}
          {businessesWithDistance.map(({ business, distanceKm }) => (
            <ResultCard key={business.id} business={business} distanceKm={distanceKm} />
          ))}
          {!searchQuery.isLoading && businessesWithDistance.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No matches found in radius. Try a broader radius or trigger discovery.
            </p>
          )}
        </div>
        <BusinessMap businesses={businesses} center={{ lat, lng }} radiusKm={radiusKm} />
      </section>
    </div>
  );
}
