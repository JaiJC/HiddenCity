import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { analyzeUpload } from "../lib/api";

export default function DetectionDemo() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const mutation = useMutation({
    mutationFn: analyzeUpload,
  });

  function onFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) {
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    mutation.reset();
  }

  function onAnalyzeClick() {
    if (!file) return;
    mutation.mutate(file);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Detection Demo</h3>
        <p className="text-sm text-slate-600">
          Upload a storefront image to run pipeline/analyze.py and preview predicted business info.
        </p>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
      />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Uploaded storefront preview"
          className="h-52 w-full rounded-xl object-cover"
        />
      )}
      <button
        type="button"
        onClick={onAnalyzeClick}
        disabled={!file || mutation.isPending}
        className="rounded-xl bg-streettrade-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? "Analyzing..." : "Analyze storefront"}
      </button>

      {mutation.isSuccess && (
        <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
          <p>
            <span className="font-semibold">Storefront:</span>{" "}
            {mutation.data.is_storefront ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-semibold">Business name:</span>{" "}
            {mutation.data.business_name || "Unknown"}
          </p>
          <p>
            <span className="font-semibold">Category:</span>{" "}
            {mutation.data.category || "other"}
          </p>
          <p>
            <span className="font-semibold">Confidence:</span>{" "}
            {Math.round((mutation.data.confidence || 0) * 100)}%
          </p>
        </div>
      )}

      {mutation.isError && (
        <p className="text-sm text-red-600">Detection failed. Please try another image.</p>
      )}
    </section>
  );
}
