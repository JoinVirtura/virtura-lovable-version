-- Add account_type to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'user' CHECK (account_type IN ('creator', 'brand', 'user'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);

-- Add comment
COMMENT ON COLUMN profiles.account_type IS 'Type of account: creator (monetization), brand (marketplace), or user (regular)';