import type { Business } from '../data/types';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

export interface SearchResult {
  businesses: Business[];
  total: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface SearchParams {
  q?: string;
  category?: string;
  source?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sort_by?: string;
}

export async function searchBusinesses(params: SearchParams = {}): Promise<SearchResult> {
  const url = new URL(`${BASE}/api/search`);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '' && val !== 'all') {
      url.searchParams.set(key, String(val));
    }
  }
  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`Search API error: ${resp.status}`);
  return resp.json();
}

export async function getBusiness(id: string): Promise<Business> {
  const resp = await fetch(`${BASE}/api/businesses/${id}`);
  if (!resp.ok) throw new Error(`Business not found: ${resp.status}`);
  return resp.json();
}

export async function getCategories(): Promise<CategoryCount[]> {
  const resp = await fetch(`${BASE}/api/categories`);
  if (!resp.ok) throw new Error(`Categories API error: ${resp.status}`);
  return resp.json();
}
