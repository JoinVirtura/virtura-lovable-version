-- Update creator_accounts platform fee to 10%
ALTER TABLE creator_accounts 
ALTER COLUMN platform_fee_percentage SET DEFAULT 10.00;

-- Update existing creator accounts to use 10% fee
UPDATE creator_accounts 
SET platform_fee_percentage = 10.00 
WHERE platform_fee_percentage != 10.00;

-- Add comment for documentation
COMMENT ON COLUMN creator_accounts.platform_fee_percentage IS 'Platform fee percentage (default 10%)';