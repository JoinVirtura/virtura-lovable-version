import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map style presets to artistic prompts for better style transfer results
const stylePromptMap: Record<string, string> = {
  // Art Styles
  'cyberpunk': 'cyberpunk style, neon colors, futuristic, sci-fi aesthetic, digital art',
  'watercolor': 'watercolor painting style, soft brushstrokes, flowing colors, artistic medium',
  'oil-painting': 'oil painting technique, thick brushstrokes, classical art style, renaissance',
  'anime': 'anime style, Japanese animation, cel-shaded, vibrant colors, manga art',
  'sketch': 'pencil sketch style, hand-drawn, artistic linework, charcoal drawing',
  'pop-art': 'pop art style, bold colors, Andy Warhol inspired, graphic design',
  'impressionist': 'impressionist painting, Monet style, loose brushwork, light effects',
  'abstract': 'abstract art style, geometric shapes, modern art, creative composition',
  'digital-art': 'digital art style, modern illustration, vibrant colors, smooth rendering',
  'fantasy': 'fantasy art style, magical, ethereal, dreamlike, mystical',
  'steampunk': 'steampunk style, Victorian era, brass and copper, mechanical gears, industrial',
  'gothic': 'gothic art style, dark and dramatic, medieval architecture, mysterious',
  'surreal': 'surrealist art, dreamlike, Salvador Dali inspired, impossible geometry',
  'synthwave': 'synthwave style, 1980s neon, retro futuristic, vaporwave aesthetic',
  'pixel-art': 'pixel art style, 8-bit graphics, retro gaming aesthetic, low resolution charm',
  'minimalist': 'minimalist art style, simple composition, clean lines, modern design',
  'art-nouveau': 'art nouveau style, flowing organic lines, decorative, Alphonse Mucha inspired',
  'biomechanical': 'biomechanical art, H.R. Giger inspired, organic and mechanical fusion',
  'botanical': 'botanical illustration style, detailed plant drawings, scientific art',
  'moskvichka': 'Soviet vintage poster style, propaganda art, retro Russian aesthetic',
  'fluff-world': 'cute fluffy art style, soft textures, adorable, kawaii aesthetic',
  'long-exposure': 'long exposure photography, motion blur, light trails, ethereal',
  'photoset': 'professional photo series style, editorial photography, fashion shoot',
  'street-fashion': 'street fashion photography, urban style, candid, trendy',
  'nighttime-dreams': 'dreamy night photography, soft focus, romantic lighting, nocturnal',
  'hok-tech': 'high-tech futuristic style, sleek design, advanced technology aesthetic',
  'abstract-geo': 'abstract geometric art, shapes and patterns, modern composition',
  'fantasy-landscape': 'fantasy landscape art, magical scenery, epic vista, otherworldly',
  'fantasy-creature': 'fantasy creature art, mythical beings, detailed fantasy illustration',
  'fantasy-portraits': 'fantasy portrait art, magical characters, ethereal beauty, mystical',
  'child-animal': 'cute child with animal art style, wholesome, adorable, children book illustration',
  'film-noir': 'film noir style, black and white, high contrast, dramatic shadows',
  'digital-glitch': 'digital glitch art, corrupted data aesthetic, cyberpunk',
  '90s-anime': '1990s anime style, retro Japanese animation, classic cel animation',
  'culinary-art': 'culinary art photography, food styling, gourmet presentation',
  'wildlife': 'wildlife photography, nature documentary style, detailed animal shots',
  'cinematic': 'cinematic photography, dramatic lighting, film quality, professional cinematography',
  'vintage': 'vintage photography, retro aesthetic, film grain, nostalgic',
  'noir': 'film noir style, black and white, dramatic shadows, detective movie aesthetic',
  'portrait': 'professional portrait photography, studio lighting, sharp focus, bokeh',
  '90s-anime-new': '1990s anime style, retro Japanese animation, classic cel animation, vintage',
  'art-nouveau-new': 'art nouveau style, flowing organic lines, decorative, Alphonse Mucha inspired, elegant',
  'child-animal-new': 'cute child with animal art style, wholesome, adorable, children book illustration, playful',
  'cyberpunk-new': 'cyberpunk style, neon colors, futuristic, sci-fi aesthetic, digital art, enhanced',
  'fantasy-creature-new': 'fantasy creature art, mythical beings, detailed fantasy illustration, magical',
  'fantasy-landscape-new': 'fantasy landscape art, magical scenery, epic vista, otherworldly, breathtaking',
  'fantasy-portraits-new': 'fantasy portrait art, magical characters, ethereal beauty, mystical, enchanting',
  'film-noir-new': 'film noir style, black and white, high contrast, dramatic shadows, classic',
  'fluff-world-new': 'cute fluffy art style, soft textures, adorable, kawaii aesthetic, charming',
  'gothic-new': 'gothic art style, dark and dramatic, medieval architecture, mysterious, atmospheric',
  'hok-tech-new': 'high-tech futuristic style, sleek design, advanced technology aesthetic, modern',
  'long-exposure-new': 'long exposure photography, motion blur, light trails, ethereal, artistic',
  'minimalist-new': 'minimalist art style, simple composition, clean lines, modern design, elegant',
  'minimalist-arch': 'minimalist architecture style, clean lines, geometric, modern, simple elegance',
  'moskvichka-new': 'Soviet vintage poster style, propaganda art, retro Russian aesthetic, historical',
  'nighttime-dreams-new': 'dreamy night photography, soft focus, romantic lighting, nocturnal, magical',
  'oil-painting-new': 'oil painting technique, thick brushstrokes, classical art style, renaissance, masterful',
  'photoset-new': 'professional photo series style, editorial photography, fashion shoot, artistic',
  'pop-art-new': 'pop art style, bold colors, Andy Warhol inspired, graphic design, vibrant',
  'steampunk-new': 'steampunk style, Victorian era, brass and copper, mechanical gears, industrial, detailed',
  'street-fashion-new': 'street fashion photography, urban style, candid, trendy, contemporary',
  'surreal-new': 'surrealist art, dreamlike, Salvador Dali inspired, impossible geometry, fantastical',
  'watercolor-new': 'watercolor painting style, soft brushstrokes, flowing colors, artistic medium, delicate',
  'glitch': 'glitch art, digital corruption, databending, pixel sorting, vaporwave',
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
