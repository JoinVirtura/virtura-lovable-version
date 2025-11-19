-- Update default platform fee to 10% for all creators
ALTER TABLE creator_accounts 
ALTER COLUMN platform_fee_percentage SET DEFAULT 10.00;

-- Update existing creators from 20% to 10%
UPDATE creator_accounts 
SET platform_fee_percentage = 10.00 
WHERE platform_fee_percentage = 20.00;