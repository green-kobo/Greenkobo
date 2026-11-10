import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { CountryCode } from '@/lib/countries';
import type { WasteTypeId, WastePrices } from '@/lib/wasteTypes';

export type RecyclingCenter = {
  id: string;
  name: string;
  area: string;
  city: string;
  country_code: CountryCode;
  distance_km: number;
  price_per_kg: number;
  is_open: boolean;
  owner_name: string | null;
  phone: string | null;
  opening_hours: string | null;
  accepts: WasteTypeId[];
  waste_prices: WastePrices;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
};

export type CenterInput = {
  name: string;
  owner_name: string;
  area: string;
  city: string;
  country_code: CountryCode;
  phone: string;
  price_per_kg: number;
  opening_hours: string;
  accepts: WasteTypeId[];
  waste_prices: WastePrices;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type DashboardStats = {
  total_bottles: number;
  total_paid_out: number;
  active_sellers: number;
  new_pickup_requests: number;
};

export type Recycler = {
  id: string;
  display_name: string;
  area: string;
  bottles: number;
  naira_earned: number;
};

export type PickupInput = {
  full_name: string;
  phone: string;
  area: string;
  bags: number;
  pick_date: string;
  country_code: CountryCode;
  waste_types: WasteTypeId[];
};

export type CashoutInput = {
  phone: string;
  method: 'opay' | 'bank';
  account_details: string;
  amount: number;
  country_code: CountryCode;
};

const GENERIC_LOAD_ERROR = 'We could not load this right now. Please try again.';
const GENERIC_SAVE_ERROR = 'We could not save your request. Please check your details and try again.';

export type CountryWastePrices = Partial<Record<CountryCode, WastePrices>>;

export async function fetchLatestWastePrices(): Promise<CountryWastePrices> {
  const { data, error } = await supabase
    .from('waste_prices')
    .select('country_code, waste_type, price_per_kg')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error || !Array.isArray(data)) throw new Error(GENERIC_LOAD_ERROR);

  const prices: CountryWastePrices = {};
  for (const row of data) {
    const code = row.country_code as CountryCode;
    const type = row.waste_type as WasteTypeId;
    const countryPrices = (prices[code] ??= {});
    if (countryPrices[type] === undefined) countryPrices[type] = Number(row.price_per_kg);
  }
  return prices;
}

export async function insertWastePrice(
  country_code: CountryCode,
  waste_type: WasteTypeId,
  price_per_kg: number,
): Promise<void> {
  const { error } = await supabase.from('waste_prices').insert({ country_code, waste_type, price_per_kg });
  if (error) throw new Error(GENERIC_SAVE_ERROR);
}

export async function fetchRecyclingCenters(): Promise<RecyclingCenter[]> {
  const { data, error } = await supabase
    .from('recycling_centers')
    .select(
      'id, name, area, city, country_code, distance_km, price_per_kg, is_open, owner_name, phone, opening_hours, accepts, waste_prices, photo_url, latitude, longitude, rating',
    )
    .order('name', { ascending: true });

  if (error || !Array.isArray(data)) throw new Error(GENERIC_LOAD_ERROR);
  return data.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    area: String(row.area),
    city: String(row.city),
    country_code: row.country_code as CountryCode,
    distance_km: Number(row.distance_km),
    price_per_kg: Number(row.price_per_kg),
    is_open: Boolean(row.is_open),
    owner_name: row.owner_name ?? null,
    phone: row.phone ?? null,
    opening_hours: row.opening_hours ?? null,
    accepts: Array.isArray(row.accepts) ? row.accepts.map((value) => value as WasteTypeId) : [],
    waste_prices: (row.waste_prices ?? {}) as WastePrices,
    photo_url: row.photo_url ?? null,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    rating: row.rating === null ? null : Number(row.rating),
  }));
}

export async function uploadCenterPhoto(file: File): Promise<string> {
  const extension = PHOTO_EXTENSIONS[file.type];
  if (!extension) throw new Error('Please upload a JPG, PNG, or WebP photo.');
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from('center-photos')
    .upload(path, file, { contentType: file.type, cacheControl: '3600' });
  if (error) throw new Error('Could not upload the photo. Please try a smaller image.');
  return supabase.storage.from('center-photos').getPublicUrl(path).data.publicUrl;
}

export async function insertRecyclingCenter(input: CenterInput): Promise<void> {
  const { error } = await supabase.from('recycling_centers').insert({ ...input, is_open: true });
  if (error) throw new Error(GENERIC_SAVE_ERROR);
}

export async function fetchDashboardStats(country: CountryCode, area: string): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc('recycler_dashboard_stats', { p_country: country, p_area: area });
  if (error || !data || typeof data !== 'object') throw new Error(GENERIC_LOAD_ERROR);
  const stats = data as Record<string, unknown>;
  return {
    total_bottles: Number(stats.total_bottles),
    total_paid_out: Number(stats.total_paid_out),
    active_sellers: Number(stats.active_sellers),
    new_pickup_requests: Number(stats.new_pickup_requests),
  };
}

export async function fetchLeaderboard(): Promise<Recycler[]> {
  const { data, error } = await supabase
    .from('recyclers')
    .select('id, display_name, area, bottles, naira_earned')
    .order('naira_earned', { ascending: false })
    .limit(10);

  if (error || !Array.isArray(data)) throw new Error(GENERIC_LOAD_ERROR);
  return data.map((row) => ({
    id: String(row.id),
    display_name: String(row.display_name),
    area: String(row.area),
    bottles: Number(row.bottles),
    naira_earned: Number(row.naira_earned),
  }));
}

const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export type ScanItem = { type: WasteTypeId; count: number; estimated_kg: number };
export type ScanResult = { items: ScanItem[]; notes: string };

const SCAN_ERROR = 'The scan failed. Please try again.';

export async function scanWastePhoto(image: string): Promise<ScanResult> {
  const { data, error } = await supabase.functions.invoke<ScanResult>('scan-waste', { body: { image } });
  if (error) {
    const body = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
    throw new Error(typeof body?.error === 'string' ? body.error : SCAN_ERROR);
  }
  if (!data || !Array.isArray(data.items)) throw new Error(SCAN_ERROR);
  return data;
}

export async function insertPickupRequest(input: PickupInput): Promise<void> {
  const { error } = await supabase.from('pickup_requests').insert(input);
  if (error) throw new Error(GENERIC_SAVE_ERROR);
}

export async function insertCashoutRequest(input: CashoutInput): Promise<void> {
  const { error } = await supabase.from('cashout_requests').insert(input);
  if (error) throw new Error(GENERIC_SAVE_ERROR);
}
