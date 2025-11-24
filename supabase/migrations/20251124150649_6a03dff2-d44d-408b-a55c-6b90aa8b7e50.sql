-- Update Erosynth Labs profile (brand account)
UPDATE public.profiles
SET 
  display_name = 'Erosynth Labs',
  bio = 'Leading AI-powered creative technology company. Building the future of digital content creation and synthetic media. 🚀',
  avatar_url = 'https://api.dicebear.com/7.x/identicon/svg?seed=erosynthlabs',
  account_type = 'brand',
  website_url = 'https://erosynthlabs.com'
WHERE id = 'c75cfca4-8d6f-479a-bed5-0a7362541998';

-- Update Golden Gleich profile (creator account)
UPDATE public.profiles
SET 
  display_name = 'Golden Gleich',
  bio = 'Digital artist and creator exploring the intersection of AI and creativity. Sharing my journey in content creation. ✨',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=golden',
  account_type = 'creator',
  website_url = 'https://goldengleich.art'
WHERE id = '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6';

-- Update Jahi's profile with better details
UPDATE public.profiles
SET 
  display_name = 'Jahi Bentley',
  bio = 'Platform creator and tech enthusiast. Building the future of AI-powered content creation. Let''s innovate together! 🚀✨',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=jahi',
  account_type = 'creator'
WHERE id = '357de30c-916f-4f54-bc2e-b32a7f7a01f0';