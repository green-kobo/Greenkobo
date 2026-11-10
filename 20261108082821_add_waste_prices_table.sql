/*
# Add per-waste-type prices

1. New Table
- `waste_prices`: append-only history of price per kg for each waste type in each country.
  - `country_code` (NG, GH, SN, CI, TG, BJ, SL)
  - `waste_type` (plastic, aluminium, glass, paper, ewaste)
  - `price_per_kg` (positive number)
  - `created_at` (timestamp)
2. Seed
- Each country gets an initial price for every waste type, derived from its latest plastic price in `price_history` using a fixed multiplier per waste type. Runs only when the table is empty.
3. Security
- Enable RLS.
- Anonymous and signed-in visitors can read prices and add new price rows. Rows cannot be updated or deleted.
*/

CREATE TABLE IF NOT EXISTS waste_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL CHECK (country_code IN ('NG','GH','SN','CI','TG','BJ','SL')),
  waste_type text NOT NULL CHECK (waste_type IN ('plastic','aluminium','glass','paper','ewaste')),
  price_per_kg numeric(10,2) NOT NULL CHECK (price_per_kg > 0 AND price_per_kg <= 100000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS waste_prices_country_type_idx ON waste_prices (country_code, waste_type, created_at DESC);

ALTER TABLE waste_prices ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON waste_prices TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_waste_prices" ON waste_prices;
CREATE POLICY "public_select_waste_prices" ON waste_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_waste_prices" ON waste_prices;
CREATE POLICY "public_insert_waste_prices" ON waste_prices FOR INSERT
  TO anon, authenticated WITH CHECK (true);

INSERT INTO waste_prices (country_code, waste_type, price_per_kg)
SELECT latest.country_code, types.waste_type, round(latest.price_per_kg * types.multiplier, 2)
FROM (
  SELECT DISTINCT ON (country_code) country_code, price_per_kg
  FROM price_history
  ORDER BY country_code, created_at DESC
) AS latest
CROSS JOIN (VALUES ('plastic', 1.0), ('aluminium', 4.0), ('glass', 0.2), ('paper', 0.4), ('ewaste', 2.5))
  AS types(waste_type, multiplier)
WHERE NOT EXISTS (SELECT 1 FROM waste_prices);
