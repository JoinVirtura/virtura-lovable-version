import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map style presets to artistic prompts for FLUX Redux style transfer
// Each prompt explicitly directs the transformation with detailed style characteristics
const stylePromptMap: Record<string, string> = {
  // Artistic Styles - Classical & Traditional
  'oil-painting': 'Transform this image into a classical oil painting masterpiece with thick impasto brushstrokes, rich color palette, traditional canvas texture, renaissance-style lighting with dramatic chiaroscuro, museum-quality fine art aesthetic, reminiscent of old masters like Rembrandt and Caravaggio',
  'oil-painting-new': 'Recreate as a contemporary oil painting with bold expressive brushwork, vibrant modern color theory, textured palette knife techniques, gallery-worthy composition, mixing classical oil painting tradition with modern artistic sensibility and dynamic energy',
  'watercolor': 'Convert into a delicate watercolor painting with soft flowing washes, transparent layered colors, paper texture showing through, wet-on-wet bleeding effects, light ethereal quality, traditional watercolor medium aesthetic with gentle brushwork and luminous transparency',
  'watercolor-new': 'Transform into vibrant watercolor art with bold saturated washes, dynamic color bleeding, artistic splatter effects, enhanced pigment intensity, professional watercolor illustration style with both control and spontaneous flow, rich color gradients',
  'impressionist': 'Reimagine as impressionist painting in the style of Monet and Renoir, with visible short brushstrokes, emphasis on light and its changing qualities, bright pure colors applied side-by-side with minimal mixing, outdoor plein air lighting, capturing the essence of a momentary impression',
  'art-nouveau': 'Transform into exquisite art nouveau masterpiece with flowing organic lines inspired by Alphonse Mucha, decorative floral motifs, elegant curved forms, ornamental borders and frames, harmonious color palette with muted pastels and gold accents, belle époque elegance and sophistication',
  'art-nouveau-new': 'Recreate as enhanced art nouveau design with intricate sinuous lines, elaborate botanical decorations, refined organic patterns, stylized natural forms, rich jewel tones with gold leaf details, capturing the decorative arts movement aesthetic with modern refinement and detail',
  
  // Futuristic & Sci-Fi Styles
  'cyberpunk': 'Transform into dark cyberpunk dystopia with bright neon lighting in pink, blue and purple, rain-slicked streets reflecting neon signs, high-tech low-life aesthetic, futuristic urban decay, holographic displays, cybernetic enhancements, Blade Runner and Ghost in the Shell inspired atmosphere',
  'cyberpunk-new': 'Recreate as advanced cyberpunk vision with intense neon colors, futuristic megacity architecture, advanced technology interfaces, digital rain effects, dramatic contrast between shadow and neon light, enhanced sci-fi details, next-generation cyberpunk aesthetic with holographic elements',
  'synthwave': 'Transform into retro synthwave art with vibrant 1980s neon colors, purple and pink gradient sunset, grid perspective lines, palm trees silhouettes, vintage arcade game aesthetic, vaporwave influence, nostalgic futuristic feeling, Miami Vice color palette',
  'biomechanical': 'Reimagine as biomechanical art in H.R. Giger style, organic tissue fused with mechanical components, intricate cable and tube details, skeletal structures merged with machinery, dark surrealist horror aesthetic, airbrushed metallic surfaces, alien-like bio-mechanical integration',
  'hok-tech': 'Convert to high-tech futuristic design with sleek minimalist surfaces, advanced holographic interfaces, clean geometric forms, sophisticated technology aesthetic, professional product design quality, modern sci-fi architecture, precision engineering details',
  'hok-tech-new': 'Transform into next-generation technology art with cutting-edge interface design, quantum computing aesthetics, advanced materials rendering, ultra-modern architectural elements, professional futuristic visualization, sophisticated tech aesthetic with glowing circuit patterns',
  'digital-glitch': 'Transform into digital glitch art with pixel corruption, RGB channel splitting, scan line distortion, databending effects, corrupted data aesthetics, neon color shifts, digital noise patterns, VHS tracking errors, cyberpunk data corruption, glitchy artifacts throughout',
  'glitch': 'Recreate with intense glitch effects including pixel sorting, data moshing, color channel displacement, digital artifacts, corrupted file aesthetics, vaporwave glitch style, broken screen effects, static interference, fragmented digital reality',
  
  // Animation & Cartoon Styles
  '90s-anime': 'Transform into classic 1990s anime style with hand-drawn cel animation aesthetic, bold ink outlines, flat cel-shaded colors, distinctive anime facial features, retro animation quality, vintage Japanese animation charm, Cowboy Bebop and Evangelion era style',
  '90s-anime-new': 'Recreate as enhanced 1990s anime with refined cel animation look, vibrant anime colors, characteristic large expressive eyes, detailed character design, nostalgic retro anime aesthetic with improved modern quality, vintage anime charm with contemporary clarity',
  'pixel-art': 'Convert into pixel art with visible square pixels, limited color palette, 8-bit to 16-bit video game aesthetic, retro gaming style, crisp pixel-perfect edges, dithering patterns for shading, nostalgic arcade and console game art style',
  'child-animal': 'Transform into adorable children's book illustration with cute child and animal characters, soft rounded shapes, gentle pastel colors, wholesome storybook aesthetic, innocent and heartwarming style, professional children's literature illustration quality',
  'child-animal-new': 'Recreate as enhanced children's illustration with charming characters, playful compositions, vibrant kid-friendly colors, delightful whimsical details, contemporary children's book art style with professional polish and engaging storytelling elements',
  'fluff-world': 'Transform into ultra-cute fluffy world with soft textures, pastel color palette, kawaii aesthetic, adorable round shapes, dreamy atmosphere, cotton candy clouds, plush toy quality, heartwarming and cozy feeling',
  'fluff-world-new': 'Recreate as enchanting fluffy dreamscape with enhanced softness, magical pastel gradients, irresistibly cute elements, cloud-like textures, kawaii culture influence, professional cute character design, charming whimsical world building',
  
  // Modern & Contemporary Styles
  'pop-art': 'Transform into bold pop art with bright contrasting colors, Ben-Day dots pattern, comic book style, flat graphic design, Andy Warhol and Roy Lichtenstein inspired, silk screen print aesthetic, mass culture imagery, 1960s pop art movement style',
  'pop-art-new': 'Recreate as vibrant contemporary pop art with enhanced bold colors, graphic design elements, modern screen printing aesthetic, dynamic composition, street art influences, neo-pop art style with urban edge and commercial art references',
  'minimalist': 'Convert into minimalist art with clean simple lines, restricted color palette, negative space emphasis, essential forms only, zen-like simplicity, modern design principles, less is more philosophy, sophisticated restraint and clarity',
  'minimalist-new': 'Transform into refined minimalist design with elegant simplicity, sophisticated color choices, perfect geometric balance, contemporary minimal aesthetic, high-end design quality, subtle sophisticated details, modern artistic restraint',
  'minimalist-arch': 'Recreate as minimalist architecture with clean geometric lines, simple volumes, monochromatic palette, emphasis on space and light, modernist principles, architectural photography quality, contemporary minimal building design aesthetic',
  'street-fashion': 'Transform into urban street fashion photography with contemporary style, candid street photography aesthetic, trendy clothing details, urban environment backdrop, editorial fashion quality, authentic street culture, modern lifestyle photography',
  'street-fashion-new': 'Recreate as cutting-edge street fashion with high-end urban style, contemporary streetwear details, professional fashion photography lighting, dynamic urban compositions, trendsetting aesthetic, modern metropolitan fashion editorial quality',
  'abstract': 'Reimagine as abstract art with geometric and organic shapes, bold color relationships, modern composition, non-representational forms, contemporary abstract expressionism, dynamic visual rhythm, artistic interpretation rather than literal representation',
  'abstract-geo': 'Transform into abstract geometric art with precise shapes and patterns, mathematical compositions, modern color theory, architectural forms abstracted, contemporary geometric abstraction, clean lines and angles, systematic visual structure',
  
  // Vintage & Classic Styles
  'film-noir': 'Transform into classic film noir with dramatic black and white contrast, deep shadows and bright highlights, 1940s cinematography style, venetian blind shadows, mysterious atmospheric lighting, detective movie aesthetic, cinematic chiaroscuro',
  'film-noir-new': 'Recreate as enhanced film noir with intense dramatic lighting, perfect black and white tonal range, classic cinema composition, sophisticated shadow play, vintage Hollywood glamour, timeless noir atmosphere with modern clarity',
  'steampunk': 'Transform into Victorian steampunk with brass and copper machinery, clockwork mechanisms, steam-powered technology, Jules Verne inspired, industrial revolution aesthetics, mechanical gears and cogs, vintage science fiction, brown and sepia tones',
  'steampunk-new': 'Recreate as detailed steampunk design with intricate mechanical components, elaborate Victorian engineering, polished brass fixtures, complex gear systems, enhanced industrial details, refined period aesthetics with fantastical machinery',
  'gothic': 'Convert into gothic art with dark dramatic atmosphere, medieval cathedral architecture, mysterious shadows, rich deep colors, romantic period aesthetic, ornate details, haunting beautiful imagery, Edgar Allan Poe inspired mood',
  'gothic-new': 'Transform into atmospheric gothic masterpiece with enhanced dramatic lighting, elaborate architectural details, deep moody colors, sophisticated dark romanticism, contemporary gothic aesthetic with timeless medieval influences',
  'vintage': 'Transform into vintage photography with aged patina, film grain texture, faded colors, retro processing look, nostalgic 1970s aesthetic, slightly desaturated tones, analog photography quality, timeworn charm',
  'long-exposure': 'Recreate as long exposure photography with smooth motion blur, light trails, ethereal flowing movement, silky water effects, star trail patterns, dreamy atmospheric quality, professional night photography aesthetic',
  'long-exposure-new': 'Transform into artistic long exposure with enhanced light trails, graceful motion blur, luminous streaks, ethereal atmospheric effects, professional fine art photography quality, magical sense of time passage',
  
  // Fantasy & Surreal Styles
  'fantasy-landscape': 'Transform into epic fantasy landscape with magical scenery, otherworldly terrain, dramatic lighting, mystical atmosphere, concept art quality, video game environment aesthetic, breathtaking vistas, fantastical elements integrated naturally',
  'fantasy-landscape-new': 'Recreate as breathtaking fantasy realm with enhanced magical elements, epic scale composition, vibrant otherworldly colors, professional concept art detail, immersive world-building, cinematic fantasy environment quality',
  'fantasy-creature': 'Reimagine with mythical creature elements, detailed fantasy illustration, magical being characteristics, dragon scales or angel wings, professional creature design, high fantasy aesthetic, Dungeons & Dragons inspired art style',
  'fantasy-creature-new': 'Transform into enhanced fantasy creature art with intricate magical details, sophisticated creature anatomy, vibrant fantasy coloring, professional concept art quality, imaginative mythological elements, epic fantasy illustration style',
  'fantasy-portraits': 'Transform into fantasy portrait with magical character elements, ethereal beauty, mystical accessories, fantasy race characteristics, soft magical lighting, enchanted atmosphere, high fantasy character art quality',
  'fantasy-portraits-new': 'Recreate as enchanting fantasy portrait with sophisticated magical details, otherworldly beauty, elaborate fantasy costume elements, professional character design, mystical atmospheric lighting, refined high fantasy aesthetics',
  'surreal': 'Reimagine as surrealist artwork inspired by Salvador Dali and Magritte, dreamlike impossible scenarios, unexpected juxtapositions, symbolic imagery, subconscious exploration, melting forms, floating objects, visual paradoxes, artistic interpretation of dreams',
  'surreal-new': 'Transform into fantastical surrealist masterpiece with enhanced dreamlike qualities, impossible architecture, mind-bending perspectives, rich symbolic elements, sophisticated surrealist techniques, contemporary surrealism with classical influences',
  'nighttime-dreams': 'Convert into dreamy nighttime scene with soft romantic lighting, gentle moonlight, star-filled skies, ethereal nocturnal atmosphere, peaceful dream-like quality, magical evening ambiance, serene nighttime beauty',
  'nighttime-dreams-new': 'Transform into magical nocturnal dreamscape with enhanced romantic lighting, luminous stars and moon, mystical night atmosphere, ethereal dreamy quality, sophisticated evening mood, enchanted nighttime aesthetic',
  
  // Nature & Organic Styles
  'botanical': 'Transform into scientific botanical illustration with detailed accurate plant anatomy, delicate linework, natural history museum quality, vintage naturalist drawing style, precise biological rendering, educational illustration aesthetic, subtle watercolor washes',
  'moskvichka': 'Transform into Soviet propaganda poster style with bold graphic design, limited color palette dominated by red, constructivist composition, vintage Russian aesthetic, 1920s-1960s USSR art style, heroic simplified forms, propaganda art elements',
  'moskvichka-new': 'Recreate as refined Soviet vintage poster with historical propaganda art aesthetic, sophisticated constructivist design, period-accurate color schemes, nostalgic USSR visual culture, retro Russian graphic design excellence',
  
  // Photography Styles
  'photoset': 'Transform into professional photo series with editorial photography quality, fashion shoot aesthetic, consistent lighting across frames, magazine-worthy composition, high-end commercial photography style, polished professional finish',
  'photoset-new': 'Recreate as artistic photo series with sophisticated editorial style, fashion-forward composition, professional studio or location lighting, contemporary photography trends, gallery-quality photographic art',
  'portrait': 'Transform into professional portrait photography with studio lighting setup, sharp focus on subject, beautiful background bokeh, key light and fill light balance, professional photographer quality, flattering light and angles',
  'cinematic': 'Recreate as cinematic film still with movie-quality lighting, dramatic color grading, film camera aesthetics, professional cinematography composition, Hollywood production values, theatrical lighting setup, epic visual storytelling quality',
  'culinary-art': 'Transform into culinary art photography with professional food styling, appetizing presentation, dramatic side lighting, shallow depth of field, restaurant menu quality, gourmet food magazine aesthetic, enticing food photography',
  'wildlife': 'Convert into wildlife documentary photography with nature photography excellence, detailed animal focus, natural habitat environment, National Geographic quality, perfect moment capture, professional nature photographer aesthetic',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      console.error('❌ REPLICATE_API_KEY not configured');
      throw new Error('REPLICATE_API_KEY not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }

    // Verify user
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      console.error('❌ Invalid authentication:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const { sourceImage, stylePreset, strength = 0.75, quality = 'HD' } = await req.json();

    // Input validation
    if (!sourceImage || typeof sourceImage !== 'string') {
      console.error('❌ Invalid sourceImage:', sourceImage);
      return new Response(
        JSON.stringify({ error: 'sourceImage URL is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!stylePreset || typeof stylePreset !== 'string') {
      console.error('❌ Invalid stylePreset:', stylePreset);
      return new Response(
        JSON.stringify({ error: 'stylePreset is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎨 Style Transfer Request:', { 
      userId: user.id,
      stylePreset, 
      strength, 
      quality,
      sourceImageLength: sourceImage.length 
    });
    console.log('🖼️ Source image:', sourceImage.substring(0, 100) + '...');

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });

    // Get style prompt enhancement
    const stylePrompt = stylePromptMap[stylePreset] || `${stylePreset} style, artistic transformation`;
    
    const startTime = Date.now();
    
    // Use FLUX Redux for style transfer - best quality and speed
    console.log('🚀 Using FLUX Redux Schnell for style transfer');
    console.log('📝 Style prompt:', stylePrompt);
    
    const output = await replicate.run(
      "black-forest-labs/flux-redux-schnell",
      {
        input: {
          redux_image: sourceImage,
          prompt: stylePrompt,
          num_outputs: 1,
          output_format: "png",
          output_quality: quality === '4K' ? 95 : quality === '8K' ? 100 : 90,
          aspect_ratio: "1:1",
          num_inference_steps: 4,
          guidance_scale: Math.max(1, Math.min(4, strength * 4)), // Scale 0-1 to 1-4 for better control
        }
      }
    );

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Style transfer completed in ${processingTime}s`);

    // Extract image URL from output
    let imageUrl: string;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      console.error('❌ Unexpected output format:', output);
      throw new Error('Unexpected output format from Replicate');
    }

    console.log('✅ Generated image URL:', imageUrl.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        metadata: {
          processingTime: `${processingTime}s`,
          style: stylePreset,
          quality: quality,
          model: 'flux-redux-schnell'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Style transfer error:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Style transfer failed',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
