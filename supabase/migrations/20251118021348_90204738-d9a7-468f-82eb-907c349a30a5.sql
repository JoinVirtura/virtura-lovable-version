INSERT INTO marketplace_campaigns (
  brand_id,
  title,
  description,
  budget_cents,
  category,
  status,
  visibility,
  deliverables,
  requirements,
  deadline
) VALUES
  (
    'acd469a0-fbcd-40ab-91e0-1024967c4f7b',
    'Tech Product Launch Video',
    'Create an engaging 60-second product launch video showcasing our new smartphone. Need high-energy editing, motion graphics, and professional voiceover.',
    50000,
    'video',
    'open',
    'public',
    '{"videos": 1, "revisions": 2, "length": "60 seconds"}',
    '{"experience": "2+ years video editing", "portfolio": "required"}',
    NOW() + INTERVAL '30 days'
  ),
  (
    'feba2540-b288-41c8-a962-3d5fa39c28c1',
    'Social Media Content Pack',
    'Create 10 engaging Instagram posts and 5 stories for our fashion brand. Must maintain brand aesthetic and include trending audio.',
    30000,
    'social',
    'open',
    'public',
    '{"posts": 10, "stories": 5, "formats": ["1080x1080", "1080x1920"]}',
    '{"platforms": ["Instagram", "TikTok"], "style": "minimalist"}',
    NOW() + INTERVAL '14 days'
  ),
  (
    'acd469a0-fbcd-40ab-91e0-1024967c4f7b',
    'Animated Explainer Video',
    'Create a 90-second animated explainer video for our SaaS product. Modern, minimalist style with smooth transitions.',
    75000,
    'animation',
    'open',
    'public',
    '{"videos": 1, "revisions": 3, "length": "90 seconds", "style": "2D animation"}',
    '{"software": ["After Effects", "Illustrator"], "portfolio": "required"}',
    NOW() + INTERVAL '45 days'
  );