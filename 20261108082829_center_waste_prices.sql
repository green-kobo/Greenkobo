/*
# Per-waste-type prices for recycling centers

1. Modified Table
- `recycling_centers.waste_prices` (jsonb): price per kg for each waste type the center buys, for example {"plastic": 150, "aluminium": 600}.
- `recycling_centers.accepts` values now use the waste type ids (plastic, aluminium, glass, paper, ewaste) instead of display names.
2. Data
- Existing centers that accept "Plastic Bottles" are switched to the plastic id, and their plastic price is copied into waste_prices. Centers with no price data are left unchanged.
3. Security
- No policy or grant changes. Existing policies still apply.
*/

ALTER TABLE recycling_centers
  ADD COLUMN IF NOT EXISTS waste_prices jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE recycling_centers
SET accepts = ARRAY['plastic']
WHERE accepts @> ARRAY['Plastic Bottles'];

UPDATE recycling_centers
SET waste_prices = jsonb_build_object('plastic', price_per_kg)
WHERE waste_prices = '{}'::jsonb;
