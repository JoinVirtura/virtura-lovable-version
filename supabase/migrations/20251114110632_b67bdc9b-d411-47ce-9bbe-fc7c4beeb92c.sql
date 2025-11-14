-- Seed public gallery with 12 diverse showcase images
-- These images represent different content types and styles to inspire visitors
-- Using NULL user_id since these are system-generated showcase images

INSERT INTO public.avatar_library (
  user_id,
  image_url,
  title,
  prompt,
  tags,
  is_video
) VALUES
  -- Portrait: Business Professional
  (
    NULL,
    '/lovable-uploads/avatar-business-executive.jpg',
    'Professional Business Portrait',
    'Professional business executive portrait, confident smile, modern office background, natural lighting, corporate headshot style',
    ARRAY['showcase', 'gallery', 'featured', 'portrait', 'business']::text[],
    false
  ),
  -- Portrait: Creative Artist
  (
    NULL,
    '/lovable-uploads/avatar-creative-artist.jpg',
    'Creative Artist Portrait',
    'Creative artist portrait, artistic expression, colorful studio background, professional photography, inspiring mood',
    ARRAY['showcase', 'gallery', 'featured', 'portrait', 'creative']::text[],
    false
  ),
  -- Portrait: Fashion Model
  (
    NULL,
    '/lovable-uploads/avatar-fashion-model.jpg',
    'Fashion Model Portrait',
    'High fashion model portrait, elegant pose, studio lighting, professional fashion photography, glamorous style',
    ARRAY['showcase', 'gallery', 'featured', 'portrait', 'fashion']::text[],
    false
  ),
  -- Landscape: Mountain Vista
  (
    NULL,
    '/lovable-uploads/trending-fantasy-landscape.jpg',
    'Epic Mountain Landscape',
    'Epic mountain landscape, dramatic peaks, golden hour lighting, misty valleys, professional nature photography, breathtaking vista',
    ARRAY['showcase', 'gallery', 'featured', 'landscape', 'nature']::text[],
    false
  ),
  -- Landscape: Ocean Sunset
  (
    NULL,
    '/lovable-uploads/trending-watercolor-landscape.jpg',
    'Serene Ocean Sunset',
    'Serene ocean sunset, calm waters, warm colors, peaceful atmosphere, professional landscape photography',
    ARRAY['showcase', 'gallery', 'featured', 'landscape', 'ocean']::text[],
    false
  ),
  -- Abstract: Geometric Art
  (
    NULL,
    '/lovable-uploads/trending-abstract-digital.jpg',
    'Abstract Geometric Art',
    'Abstract geometric art, colorful shapes, modern design, digital art, vibrant colors, contemporary style',
    ARRAY['showcase', 'gallery', 'featured', 'abstract', 'digital']::text[],
    false
  ),
  -- Abstract: Surreal Dream
  (
    NULL,
    '/lovable-uploads/trending-surreal-dream.jpg',
    'Surreal Dreamscape',
    'Surreal dreamscape, floating elements, ethereal atmosphere, artistic interpretation, imaginative composition',
    ARRAY['showcase', 'gallery', 'featured', 'abstract', 'surreal']::text[],
    false
  ),
  -- Scene: Cyberpunk City
  (
    NULL,
    '/lovable-uploads/trending-cyberpunk-city.jpg',
    'Cyberpunk Cityscape',
    'Futuristic cyberpunk city, neon lights, rainy streets, dystopian atmosphere, cinematic composition, blade runner style',
    ARRAY['showcase', 'gallery', 'featured', 'scene', 'cyberpunk']::text[],
    false
  ),
  -- Scene: Gothic Architecture
  (
    NULL,
    '/lovable-uploads/trending-gothic-cathedral.jpg',
    'Gothic Cathedral Interior',
    'Gothic cathedral interior, dramatic lighting, ancient architecture, mysterious atmosphere, professional architectural photography',
    ARRAY['showcase', 'gallery', 'featured', 'scene', 'architecture']::text[],
    false
  ),
  -- Creative: Steampunk Machine
  (
    NULL,
    '/lovable-uploads/trending-steampunk-mech.jpg',
    'Steampunk Mechanical Creation',
    'Steampunk mechanical creation, intricate gears, brass and copper materials, Victorian aesthetic, industrial design',
    ARRAY['showcase', 'gallery', 'featured', 'creative', 'steampunk']::text[],
    false
  ),
  -- Creative: Fantasy Creature
  (
    NULL,
    '/lovable-uploads/trending-fantasy-creature.jpg',
    'Mythical Fantasy Creature',
    'Mythical fantasy creature, magical aura, detailed scales and wings, ethereal lighting, concept art style',
    ARRAY['showcase', 'gallery', 'featured', 'creative', 'fantasy']::text[],
    false
  ),
  -- Style: Pop Art Portrait
  (
    NULL,
    '/lovable-uploads/trending-pop-art-portrait.jpg',
    'Pop Art Style Portrait',
    'Pop art style portrait, bold colors, comic book aesthetic, Andy Warhol inspired, vibrant and energetic',
    ARRAY['showcase', 'gallery', 'featured', 'style', 'pop-art']::text[],
    false
  )
ON CONFLICT (id) DO NOTHING;