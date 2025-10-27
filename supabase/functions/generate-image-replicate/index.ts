import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Content-type to Replicate model mapping - CORRECT MODEL IDENTIFIERS
const modelMap: Record<string, string> = {
  'portrait': 'black-forest-labs/flux-schnell',
  'landscape': 'stability-ai/stable-diffusion-xl-base-1.0',
  'object': 'black-forest-labs/flux-1.1-pro',
  'abstract': 'ai-forever/kandinsky-3',
  'scene': 'stability-ai/stable-diffusion-xl-base-1.0',
  'auto': 'black-forest-labs/flux-1.1-pro'
};

// Quality settings for FLUX Schnell (max 4 steps)
const fluxSchnellQualityMap: Record<string, { width: number; height: number; steps: number }> = {
  'HD': { width: 1024, height: 1024, steps: 4 },
  '4K': { width: 1536, height: 1536, steps: 4 },
  '8K': { width: 2048, height: 2048, steps: 4 }
};

// Quality settings for SDXL and other models (can use more steps)
const standardQualityMap: Record<string, { width: number; height: number; steps: number }> = {
  'HD': { width: 1024, height: 1024, steps: 25 },
  '4K': { width: 1536, height: 1536, steps: 30 },
  '8K': { width: 2048, height: 2048, steps: 40 }
};

// Aspect ratio to dimension adjustments
const aspectRatioMap: Record<string, (base: { width: number; height: number }) => { width: number; height: number }> = {
  '1:1': (base) => ({ width: base.width, height: base.height }),
  '16:9': (base) => ({ width: Math.round(base.height * 1.78), height: base.height }),
  '9:16': (base) => ({ width: base.width, height: Math.round(base.width * 1.78) }),
  '4:3': (base) => ({ width: Math.round(base.height * 1.33), height: base.height })
};

// Content-specific prompt enhancement
function enhancePromptByContentType(prompt: string, contentType: string): string {
  const enhancements: Record<string, string> = {
    'portrait': 'SINGLE PERSON ONLY, professional portrait photography of ONE individual, solo subject, individual headshot, NOT a group photo, studio quality lighting, isolated subject',
    'landscape': 'cinematic landscape, wide angle, atmospheric, scenic view',
    'object': 'product photography, studio lighting, isolated subject, clean background',
    'abstract': 'abstract art, creative composition, artistic interpretation',
    'scene': 'environmental shot, storytelling composition, cinematic atmosphere'
  };
  return `${prompt}, ${enhancements[contentType] || enhancements['scene']}`;
}

// Simplified negative prompts (Replicate models handle this better)
function getSimplifiedNegativePrompt(contentType: string): string {
  const baseNegative = "blurry, low quality, distorted, deformed, ugly, bad anatomy";
  const antiGrid = "multiple people, grid layout, collage, split screen, side by side, variations";
  
  if (contentType === 'portrait') {
    return `${antiGrid}, ${baseNegative}, extra limbs, bad proportions, watermark`;
  }
  return `${baseNegative}, watermark, text, logo`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    // Verify user authentication
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const replicate = new Replicate({ auth: REPLICATE_API_KEY });

    const body = await req.json();
    const { prompt, contentType = 'auto', quality = 'HD', aspectRatio = '1:1', style, referenceImage } = body;

    // 🔍 DEBUG: Check what edge function received
    console.log('📥 EDGE FUNCTION: Received request:', {
      hasReferenceImage: !!referenceImage,
      isDataURI: referenceImage?.startsWith('data:'),
      length: referenceImage?.length || 0,
      first100Chars: referenceImage?.substring(0, 100) || 'EMPTY',
      prompt: prompt?.substring(0, 50) + '...',
      contentType,
      quality
    });

    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prompt.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long (max 1000 characters)' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validContentTypes = ['portrait', 'landscape', 'object', 'abstract', 'scene', 'auto'];
    if (!validContentTypes.includes(contentType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid contentType' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validQualities = ['HD', '4K', '8K'];
    if (!validQualities.includes(quality)) {
      return new Response(
        JSON.stringify({ error: 'Invalid quality' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎨 Replicate Image Generation Request:', { contentType, quality, aspectRatio, hasReferenceImage: !!referenceImage });

    // Select appropriate model - use FLUX Redux for image-to-image with identity preservation
    let model;
    if (referenceImage) {
      model = 'black-forest-labs/flux-redux-schnell'; // Use Redux for reference images
      console.log('🖼️ Reference image detected - using FLUX Redux for identity preservation');
    } else {
      model = modelMap[contentType] || modelMap['auto'];
    }
    console.log('📦 Selected model:', model);

    // Select appropriate quality map based on model
    const qualityMap = model.includes('flux-schnell') 
      ? fluxSchnellQualityMap 
      : standardQualityMap;
    
    // Get quality settings
    const qualitySettings = qualityMap[quality] || qualityMap['HD'];
    
    // Adjust dimensions for aspect ratio
    const dimensions = aspectRatioMap[aspectRatio] 
      ? aspectRatioMap[aspectRatio]({ width: qualitySettings.width, height: qualitySettings.height })
      : { width: qualitySettings.width, height: qualitySettings.height };

    console.log('📐 Dimensions:', dimensions);

    // Enhance prompt - for Redux use raw prompt (describes transformation), for text-to-image use enhanced
    let finalPrompt;
    if (referenceImage) {
      // For Redux: prompt describes STYLE transformation, not the subject
      finalPrompt = prompt; // Use raw prompt for maximum control
      console.log('🎨 Redux mode - using raw prompt for transformation');
    } else {
      // For text-to-image: enhance prompt with content type specifics
      finalPrompt = enhancePromptByContentType(prompt, contentType);
    }
    const negativePrompt = getSimplifiedNegativePrompt(contentType);

    console.log('✨ Final prompt:', finalPrompt);
    console.log('🚫 Negative prompt:', negativePrompt);

    // Generate image with Replicate
    console.log('🚀 Starting Replicate generation...');
    console.log('🎯 Generation Config:', {
      model,
      contentType,
      userPrompt: prompt,
      finalPrompt,
      referenceImage: referenceImage ? 'provided' : 'none',
      dimensions,
      steps: model.includes('flux-schnell') || model.includes('flux-redux') ? 4 : qualitySettings.steps
    });
    const startTime = Date.now();

    let output;
    
    // Ensure num_inference_steps doesn't exceed model limits
    const finalSteps = model.includes('flux-schnell') 
      ? Math.min(qualitySettings.steps, 4) 
      : qualitySettings.steps;
    
    try {
      if (model === 'black-forest-labs/flux-redux-schnell') {
        // FLUX Redux for image-to-image with identity preservation
        console.log('🎭 Using FLUX Redux with reference image');
        output = await replicate.run(model, {
          input: {
            redux_image: referenceImage, // The reference photo
            prompt: finalPrompt, // Transformation instructions
            num_outputs: 1,
            output_format: "png",
            output_quality: 100,
            aspect_ratio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1',
            num_inference_steps: 4, // Fast with great quality
            guidance_scale: 2.5 // Redux works better with lower guidance
          }
        });
      } else if (model === 'black-forest-labs/flux-schnell' || model === 'black-forest-labs/flux-1.1-pro') {
        // FLUX models - optimized for maximum quality
        output = await replicate.run(model, {
          input: {
            prompt: finalPrompt,
            num_outputs: 1,
            aspect_ratio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1',
            output_format: "png",
            output_quality: 100, // Maximum quality for all
            num_inference_steps: model === 'black-forest-labs/flux-1.1-pro' ? 50 : 4, // More steps for Pro
            guidance_scale: 3.5 // Add guidance for prompt adherence
          }
        });
      } else if (model === 'stability-ai/stable-diffusion-xl-base-1.0') {
        // SDXL model - CORRECTED MODEL NAME
        output = await replicate.run(model, {
          input: {
            prompt: finalPrompt,
            negative_prompt: negativePrompt,
            width: dimensions.width,
            height: dimensions.height,
            num_outputs: 1,
            num_inference_steps: finalSteps,
            guidance_scale: 7.5
          }
        });
      } else if (model === 'ai-forever/kandinsky-3') {
        // Kandinsky v3 - CORRECTED MODEL NAME
        output = await replicate.run(model, {
          input: {
            prompt: enhancedPrompt,
            num_outputs: 1,
            width: dimensions.width,
            height: dimensions.height
          }
        });
      } else {
        // Other models
        output = await replicate.run(model, {
          input: {
            prompt: enhancedPrompt,
            num_outputs: 1,
            width: dimensions.width,
            height: dimensions.height
          }
        });
      }
    } catch (modelError) {
      console.error(`❌ ${model} failed:`, modelError);
      
      // Retry with FLUX 1.1 Pro as universal fallback
      if (model !== 'black-forest-labs/flux-1.1-pro') {
        console.log('🔄 Retrying with FLUX 1.1 Pro as universal fallback...');
        output = await replicate.run('black-forest-labs/flux-1.1-pro', {
          input: {
            prompt: enhancedPrompt,
            num_outputs: 1,
            aspect_ratio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1',
            output_format: "png",
            output_quality: quality === '8K' ? 100 : quality === '4K' ? 90 : 80,
            num_inference_steps: 28
          }
        });
      } else {
        throw modelError;
      }
    }

    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`;
    console.log('⏱️ Processing time:', processingTime);

    if (!output || (Array.isArray(output) && output.length === 0)) {
      throw new Error('No image generated');
    }

    // Get the image URL (Replicate returns array)
    const imageUrl = Array.isArray(output) ? output[0] : output;
    console.log('🖼️ Generated image URL:', imageUrl);

    // Download and upload to Supabase Storage
    console.log('📥 Downloading image from Replicate...');
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    const fileName = `replicate-${contentType}-${Date.now()}.png`;
    console.log('📤 Uploading to Supabase Storage:', fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('✅ Image uploaded successfully:', publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        image: publicUrl,
        prompt: finalPrompt,
        metadata: {
          contentType,
          style: style || 'photorealistic',
          resolution: dimensions ? `${dimensions.width}x${dimensions.height}` : 'N/A',
          processingTime,
          model,
          quality,
          usedReferenceImage: !!referenceImage
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Replicate generation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
