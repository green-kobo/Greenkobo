/*
# Add country to cash-out requests

Plain-English summary: cash-out requests now record which country the amount is in, so a request from Ghana is not mistaken for Naira.

## Modified tables
1. `cashout_requests` - new column `country_code` (defaults to Nigeria for existing rows, which is the only data that exists today).

## Security
- No policy or grant changes. Visitors can still only insert cash-out requests.

## Notes
- Adding a column does not remove or change any existing data.
*/

ALTER TABLE cashout_requests
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'NG';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cashout_requests_country_code_check'
  ) THEN
    ALTER TABLE cashout_requests
      ADD CONSTRAINT cashout_requests_country_code_check
      CHECK (country_code IN ('NG','GH','SN','CI','TG','BJ','SL'));
  END IF;
END $$;
