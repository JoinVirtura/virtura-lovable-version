-- Remove demo brand data (Sample Coffee Shop)
DELETE FROM campaign_content 
WHERE campaign_id IN (
  SELECT id FROM brand_campaigns 
  WHERE brand_id = '6c681928-8623-496a-a975-f3f91f6df3cc'
);

DELETE FROM brand_campaigns 
WHERE brand_id = '6c681928-8623-496a-a975-f3f91f6df3cc';

DELETE FROM brand_assets 
WHERE brand_id = '6c681928-8623-496a-a975-f3f91f6df3cc';

DELETE FROM brand_collections 
WHERE brand_id = '6c681928-8623-496a-a975-f3f91f6df3cc';

DELETE FROM brand_briefs 
WHERE brand_id = '6c681928-8623-496a-a975-f3f91f6df3cc';

DELETE FROM brand_characters 
WHERE brand_id = '6c681928-8623-496a-a975-f3f91f6df3cc';

DELETE FROM publishing_queue 
WHERE brand_id = '6c681928-8623-496a-a975-f3f91f6df3cc';

DELETE FROM brands 
WHERE id = '6c681928-8623-496a-a975-f3f91f6df3cc';