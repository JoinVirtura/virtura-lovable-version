import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map style presets to artistic prompts for better style transfer results
// Using explicit transformation language for better results with FLUX Redux
const stylePromptMap: Record<string, string> = {
  // Art Styles
  'cyberpunk': 'Transform into cyberpunk art with neon colors, futuristic sci-fi aesthetic, digital art style',
  'watercolor': 'Convert to watercolor painting with soft brushstrokes, flowing colors, artistic medium',
  'oil-painting': 'Recreate as oil painting with thick brushstrokes, classical renaissance art style',
  'anime': 'Stylize as anime art, Japanese animation style, cel-shaded with vibrant colors, manga aesthetic',
  'sketch': 'Render as pencil sketch with hand-drawn artistic linework, charcoal drawing style',
  'pop-art': 'Transform into pop art with bold colors, Andy Warhol inspired graphic design',
  'impressionist': 'Paint in impressionist style like Monet with loose brushwork and light effects',
  'abstract': 'Reimagine as abstract art with geometric shapes, modern art composition',
  'digital-art': 'Render as digital art with modern illustration style, vibrant colors, smooth finish',
  'fantasy': 'Transform into fantasy art with magical, ethereal, dreamlike, mystical elements',
  'steampunk': 'Stylize as steampunk with Victorian era brass and copper, mechanical gears, industrial aesthetic',
  'gothic': 'Convert to gothic art style, dark and dramatic with medieval architecture, mysterious atmosphere',
  'surreal': 'Reimagine as surrealist art, dreamlike Salvador Dali inspired with impossible geometry',
  'synthwave': 'Transform into synthwave style with 1980s neon, retro futuristic vaporwave aesthetic',
  'pixel-art': 'Convert to pixel art with 8-bit graphics, retro gaming aesthetic, low resolution charm',
  'minimalist': 'Simplify into minimalist art with clean lines, simple composition, modern design',
  'art-nouveau': 'Transform into art nouveau masterpiece with flowing organic lines, decorative flourishes, Alphonse Mucha inspired elegance',
  'biomechanical': 'Reimagine as biomechanical art, H.R. Giger inspired organic and mechanical fusion',
  'botanical': 'Render as botanical illustration with detailed plant drawings, scientific art style',
  'moskvichka': 'Stylize as Soviet vintage poster with propaganda art, retro Russian aesthetic',
  'fluff-world': 'Transform into cute fluffy art with soft textures, adorable kawaii aesthetic',
  'long-exposure': 'Recreate as long exposure photography with motion blur, light trails, ethereal quality',
  'photoset': 'Style as professional photo series, editorial fashion photography shoot',
  'street-fashion': 'Capture as street fashion photography with urban style, candid trendy look',
  'nighttime-dreams': 'Render as dreamy night photography with soft focus, romantic lighting, nocturnal mood',
  'hok-tech': 'Transform into high-tech futuristic style with sleek design, advanced technology aesthetic',
  'abstract-geo': 'Reimagine as abstract geometric art with shapes and patterns, modern composition',
  'fantasy-landscape': 'Convert to fantasy landscape art with magical scenery, epic vista, otherworldly beauty',
  'fantasy-creature': 'Transform into fantasy creature art with mythical beings, detailed fantasy illustration',
  'fantasy-portraits': 'Stylize as fantasy portrait with magical character, ethereal beauty, mystical elements',
  'child-animal': 'Render as cute child with animal art, wholesome adorable children book illustration',
  'film-noir': 'Convert to film noir with black and white, high contrast, dramatic shadows',
  'digital-glitch': 'Transform into digital glitch art with corrupted data aesthetic, cyberpunk distortion',
  '90s-anime': 'Stylize as 1990s anime with retro Japanese animation, classic cel animation',
  'culinary-art': 'Present as culinary art photography with food styling, gourmet presentation',
  'wildlife': 'Capture as wildlife photography, nature documentary style with detailed animal focus',
  'cinematic': 'Render as cinematic photography with dramatic lighting, film quality production',
  'vintage': 'Transform into vintage photography with retro aesthetic, film grain, nostalgic feel',
  'noir': 'Stylize as film noir with black and white, dramatic shadows, detective movie aesthetic',
  'portrait': 'Enhance as professional portrait with studio lighting, sharp focus, beautiful bokeh',
  '90s-anime-new': 'Transform into enhanced 1990s anime style with retro Japanese animation, classic cel animation, vintage charm',
  'art-nouveau-new': 'Recreate as refined art nouveau masterpiece with flowing organic lines, decorative elegance, Alphonse Mucha inspired beauty',
  'child-animal-new': 'Stylize as enhanced cute child with animal art, wholesome adorable, playful children book illustration',
  'cyberpunk-new': 'Transform into enhanced cyberpunk with bright neon colors, futuristic sci-fi aesthetic, advanced digital art',
  'fantasy-creature-new': 'Reimagine as enhanced fantasy creature with mythical beings, highly detailed magical illustration',
  'fantasy-landscape-new': 'Convert to breathtaking fantasy landscape with magical scenery, epic vista, otherworldly wonder',
  'fantasy-portraits-new': 'Stylize as enchanting fantasy portrait with magical character, ethereal beauty, mystical atmosphere',
  'film-noir-new': 'Transform into classic film noir with black and white, high contrast, dramatic cinematic shadows',
  'fluff-world-new': 'Render as charming fluffy art with soft textures, adorable kawaii aesthetic, cute atmosphere',
  'gothic-new': 'Convert to atmospheric gothic art, dark and dramatic with medieval architecture, mysterious ambiance',
  'hok-tech-new': 'Transform into modern high-tech futuristic style with sleek design, advanced technology aesthetic',
  'long-exposure-new': 'Recreate as artistic long exposure with motion blur, light trails, ethereal dreamy quality',
  'minimalist-new': 'Simplify into elegant minimalist art with simple composition, clean lines, modern refined design',
  'minimalist-arch': 'Transform into minimalist architecture with clean geometric lines, modern simple elegance',
  'moskvichka-new': 'Stylize as historical Soviet vintage poster with propaganda art, retro Russian aesthetic',
  'nighttime-dreams-new': 'Render as magical dreamy night photography with soft focus, romantic lighting, nocturnal atmosphere',
  'oil-painting-new': 'Paint as masterful oil painting with thick brushstrokes, classical renaissance art style, museum quality',
  'photoset-new': 'Style as artistic professional photo series, editorial fashion photography shoot',
  'pop-art-new': 'Transform into vibrant pop art with bold colors, Andy Warhol inspired graphic design',
  'steampunk-new': 'Stylize as detailed steampunk with Victorian era brass and copper, intricate mechanical gears, industrial design',
  'street-fashion-new': 'Capture as contemporary street fashion photography, urban style, candid trendy aesthetic',
  'surreal-new': 'Reimagine as fantastical surrealist art, dreamlike Salvador Dali inspired with impossible geometry',
  'watercolor-new': 'Paint as delicate watercolor with soft brushstrokes, flowing colors, refined artistic medium',
  'glitch': 'Transform into glitch art with digital corruption, databending effects, pixel sorting, vaporwave aesthetic',
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
