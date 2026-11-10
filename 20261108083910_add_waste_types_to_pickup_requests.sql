/*
# Add waste types to pickup requests

Plain-English summary: pickup requests can now record which kinds of waste the customer wants collected.

1. Modified Tables
- `pickup_requests`: new column `waste_types` (text array, defaults to an empty list). Each value must be one of the five GreenKobo waste types: plastic, aluminium, glass, paper, ewaste.

2. Security
- No policy or grant changes. Existing access on `pickup_requests` is unchanged.

3. Notes
- Existing rows keep an empty list, which is valid.
*/

ALTER TABLE pickup_requests
  ADD COLUMN IF NOT EXISTS waste_types text[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pickup_requests_waste_types_check'
  ) THEN
    ALTER TABLE pickup_requests
      ADD CONSTRAINT pickup_requests_waste_types_check
      CHECK (waste_types <@ ARRAY['plastic', 'aluminium', 'glass', 'paper', 'ewaste']::text[]);
  END IF;
END $$;
