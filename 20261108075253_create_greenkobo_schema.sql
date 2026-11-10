/*
# Create GreenKobo schema

Plain-English summary: sets up everything the GreenKobo website reads and saves, including live plastic prices per country, recycling centers, the top recyclers leaderboard, and forms for pickup requests, recycling unit registrations, and cash-out requests.

## New tables
1. `price_history` - every price update per country (price per kg in local currency). The newest row per country is the live price.
2. `recycling_centers` - recycling centers shown in the Find Center section (read-only for visitors).
3. `recyclers` - leaderboard entries of top recyclers (read-only for visitors).
4. `pickup_requests` - visitors asking for a pickup of their bottles.
5. `unit_registrations` - people or businesses registering a recycling unit.
6. `cashout_requests` - visitors asking to cash out to Opay or a bank account.

## Security
- RLS is enabled on every table.
- This site has no per-user data, so policies are intentionally public for the tables that are meant to be public.
- Visitors can read prices, centers, and leaderboard rows. Visitors can insert price updates and form submissions only. Visitors cannot read other people's form submissions or edit or delete any rows.
- Length and range checks guard against malformed or oversized input.

## Notes
- Seed data is inserted with fixed ids so the migration can be re-run safely.
*/

CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL CHECK (country_code IN ('NG','GH','SN','CI','TG','BJ','SL')),
  price_per_kg numeric(10,2) NOT NULL CHECK (price_per_kg > 0 AND price_per_kg <= 100000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS price_history_country_created_idx ON price_history (country_code, created_at DESC);

CREATE TABLE IF NOT EXISTS recycling_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  area text NOT NULL,
  city text NOT NULL,
  country_code text NOT NULL CHECK (country_code IN ('NG','GH','SN','CI','TG','BJ','SL')),
  distance_km numeric(5,2) NOT NULL DEFAULT 0,
  price_per_kg numeric(10,2) NOT NULL,
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS recycling_centers_country_idx ON recycling_centers (country_code);

CREATE TABLE IF NOT EXISTS recyclers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  area text NOT NULL,
  bottles integer NOT NULL CHECK (bottles >= 0),
  naira_earned integer NOT NULL CHECK (naira_earned >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
  address text NOT NULL CHECK (char_length(address) BETWEEN 5 AND 300),
  country_code text NOT NULL CHECK (country_code IN ('NG','GH','SN','CI','TG','BJ','SL')),
  bottles_estimate integer NOT NULL CHECK (bottles_estimate BETWEEN 1 AND 100000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unit_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_name text NOT NULL CHECK (char_length(unit_name) BETWEEN 2 AND 120),
  owner_name text NOT NULL CHECK (char_length(owner_name) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
  city text NOT NULL CHECK (char_length(city) BETWEEN 2 AND 100),
  country_code text NOT NULL CHECK (country_code IN ('NG','GH','SN','CI','TG','BJ','SL')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cashout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
  method text NOT NULL CHECK (method IN ('opay','bank')),
  account_details text NOT NULL CHECK (char_length(account_details) BETWEEN 5 AND 120),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashout_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON price_history TO anon, authenticated;
GRANT SELECT ON recycling_centers TO anon, authenticated;
GRANT SELECT ON recyclers TO anon, authenticated;
GRANT INSERT ON pickup_requests TO anon, authenticated;
GRANT INSERT ON unit_registrations TO anon, authenticated;
GRANT INSERT ON cashout_requests TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_price_history" ON price_history;
CREATE POLICY "public_read_price_history" ON price_history FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_price_history" ON price_history;
CREATE POLICY "public_insert_price_history" ON price_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_recycling_centers" ON recycling_centers;
CREATE POLICY "public_read_recycling_centers" ON recycling_centers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_recyclers" ON recyclers;
CREATE POLICY "public_read_recyclers" ON recyclers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_pickup_requests" ON pickup_requests;
CREATE POLICY "public_insert_pickup_requests" ON pickup_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_unit_registrations" ON unit_registrations;
CREATE POLICY "public_insert_unit_registrations" ON unit_registrations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_cashout_requests" ON cashout_requests;
CREATE POLICY "public_insert_cashout_requests" ON cashout_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

INSERT INTO price_history (id, country_code, price_per_kg, created_at) VALUES
  ('11111111-0000-4000-8000-000000000001', 'NG', 150, now()),
  ('11111111-0000-4000-8000-000000000002', 'GH', 1.20, now()),
  ('11111111-0000-4000-8000-000000000003', 'SN', 60, now()),
  ('11111111-0000-4000-8000-000000000004', 'CI', 60, now()),
  ('11111111-0000-4000-8000-000000000005', 'TG', 60, now()),
  ('11111111-0000-4000-8000-000000000006', 'BJ', 60, now()),
  ('11111111-0000-4000-8000-000000000007', 'SL', 2.30, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO recycling_centers (id, name, area, city, country_code, distance_km, price_per_kg, is_open) VALUES
  ('22222222-0000-4000-8000-000000000001', 'Bariga Recycling Center', 'Bariga', 'Lagos', 'NG', 0.5, 150, true),
  ('22222222-0000-4000-8000-000000000002', 'Yaba Green Point', 'Yaba', 'Lagos', 'NG', 1.2, 145, true),
  ('22222222-0000-4000-8000-000000000003', 'Ikeja Recycle Hub', 'Ikeja', 'Lagos', 'NG', 3.0, 140, false),
  ('22222222-0000-4000-8000-000000000004', 'Osu Green Collect', 'Osu', 'Accra', 'GH', 1.8, 1.20, true),
  ('22222222-0000-4000-8000-000000000005', 'Plateau Plastique Hub', 'Plateau', 'Dakar', 'SN', 2.1, 60, true),
  ('22222222-0000-4000-8000-000000000006', 'Cocody Recyclage Plus', 'Cocody', 'Abidjan', 'CI', 1.5, 60, true),
  ('22222222-0000-4000-8000-000000000007', 'Bè Recyclage Center', 'Bè', 'Lomé', 'TG', 2.4, 60, true),
  ('22222222-0000-4000-8000-000000000008', 'Akpakpa Recy Hub', 'Akpakpa', 'Cotonou', 'BJ', 0.9, 60, true),
  ('22222222-0000-4000-8000-000000000009', 'Wilberforce Green Point', 'Wilberforce', 'Freetown', 'SL', 1.1, 2.30, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO recyclers (id, display_name, area, bottles, naira_earned) VALUES
  ('33333333-0000-4000-8000-000000000001', 'Ada', 'Bariga', 340, 5100),
  ('33333333-0000-4000-8000-000000000002', 'Tunde', 'Yaba', 280, 4200),
  ('33333333-0000-4000-8000-000000000003', 'Chiamaka', 'Ikeja', 210, 3150),
  ('33333333-0000-4000-8000-000000000004', 'Emeka', 'Surulere', 185, 2775),
  ('33333333-0000-4000-8000-000000000005', 'Amina', 'Lekki', 160, 2400)
ON CONFLICT (id) DO NOTHING;
