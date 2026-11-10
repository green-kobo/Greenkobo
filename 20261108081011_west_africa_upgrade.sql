/*
# West Africa upgrade: centers, pickups, photos, dashboard stats

Plain-English summary: recycling centers can now be registered by their owners with photos, opening hours, what they buy, and a map location. Pickup requests now capture area, number of bags, and pick date. A dashboard stats function returns simple totals.

## Modified tables
1. `recycling_centers` - new columns: owner_name, phone (used for calls and WhatsApp), opening_hours, accepts (list of materials), photo_url, latitude, longitude, rating. Example centers are renamed and re-priced to match the West Africa demo. Anonymous visitors can now add a center.
2. `pickup_requests` - new columns: area, bags, pick_date. Address and bottle estimate are no longer required because the new form does not ask for them.

## New storage
3. `center-photos` - public image bucket for recycling center photos (max 5 MB; JPG, PNG, or WebP). Anonymous visitors can upload to this bucket only.

## New function
4. `recycler_dashboard_stats(country, area)` - returns counts and totals only (no personal details). Callable by visitors.

## Security
- RLS stays enabled on every table. Visitors can insert centers and pickup requests but cannot read pickup requests.
- Dashboard function is SECURITY DEFINER with a fixed search path and returns aggregates only.
- Photo uploads are limited to the center-photos bucket by type and size.

## Notes
- Every change is additive or a seed update; no rows are deleted and no column types change.
- Seeded centers have no phone number yet, so their Call and WhatsApp buttons stay disabled until owners add one.
*/

ALTER TABLE recycling_centers
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS opening_hours text,
  ADD COLUMN IF NOT EXISTS accepts text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS rating numeric(2,1);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recycling_centers_name_length') THEN
    ALTER TABLE recycling_centers ADD CONSTRAINT recycling_centers_name_length CHECK (char_length(name) BETWEEN 2 AND 120);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recycling_centers_price_positive') THEN
    ALTER TABLE recycling_centers ADD CONSTRAINT recycling_centers_price_positive CHECK (price_per_kg > 0 AND price_per_kg <= 100000);
  END IF;
END $$;

UPDATE recycling_centers SET latitude = 6.538300, longitude = 3.371000, rating = 4.8, name = 'Bariga Recycling Hub', is_open = true, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000001';
UPDATE recycling_centers SET latitude = 6.509500, longitude = 3.371100, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000002';
UPDATE recycling_centers SET latitude = 6.601800, longitude = 3.351500, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000003';
UPDATE recycling_centers SET latitude = 5.556000, longitude = -0.183000, name = 'Accra Green Cycle', price_per_kg = 2.50, rating = 4.9, is_open = true, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000004';
UPDATE recycling_centers SET latitude = 14.692800, longitude = -17.446700, name = 'Dakar Recyclage', price_per_kg = 150, is_open = true, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000005';
UPDATE recycling_centers SET latitude = 5.359900, longitude = -3.986000, name = 'Abidjan EcoPlast', price_per_kg = 140, is_open = true, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000006';
UPDATE recycling_centers SET latitude = 6.125600, longitude = 1.225400, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000007';
UPDATE recycling_centers SET latitude = 6.365400, longitude = 2.418300, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000008';
UPDATE recycling_centers SET latitude = 8.465700, longitude = -13.231700, accepts = ARRAY['Plastic Bottles']
  WHERE id = '22222222-0000-4000-8000-000000000009';

GRANT INSERT ON recycling_centers TO anon, authenticated;

DROP POLICY IF EXISTS "public_insert_recycling_centers" ON recycling_centers;
CREATE POLICY "public_insert_recycling_centers" ON recycling_centers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

ALTER TABLE pickup_requests
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS bags integer CHECK (bags IS NULL OR bags BETWEEN 1 AND 10000),
  ADD COLUMN IF NOT EXISTS pick_date date;
ALTER TABLE pickup_requests ALTER COLUMN address DROP NOT NULL;
ALTER TABLE pickup_requests ALTER COLUMN bottles_estimate DROP NOT NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('center-photos', 'center-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "public_upload_center_photos" ON storage.objects;
CREATE POLICY "public_upload_center_photos" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'center-photos');

CREATE OR REPLACE FUNCTION public.recycler_dashboard_stats(p_country text, p_area text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_bottles', COALESCE((SELECT SUM(bottles) FROM recyclers), 0),
    'total_paid_out', COALESCE((SELECT SUM(naira_earned) FROM recyclers), 0),
    'active_sellers', (SELECT COUNT(*) FROM recyclers WHERE area ILIKE '%' || COALESCE(p_area, '') || '%'),
    'new_pickup_requests', (
      SELECT COUNT(*) FROM pickup_requests
      WHERE country_code = p_country
        AND created_at > now() - interval '7 days'
        AND (COALESCE(p_area, '') = '' OR area ILIKE '%' || p_area || '%')
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.recycler_dashboard_stats(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recycler_dashboard_stats(text, text) TO anon, authenticated;
