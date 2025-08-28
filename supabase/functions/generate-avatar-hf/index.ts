import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAvatarRequest {
  prompt: string;
  negativePrompt?: string;
  adherence?: number;
  steps?: number;
  enhance?: boolean;
  selectedPreset?: string | null;
  style?: string;
  gender?: string;
  age?: string;
  hairColor?: string;
  eyeColor?: string;
  setting?: string;
  pose?: string;
  clothing?: string;
  accessories?: string;
  creativity?: number;
  resolution?: string;
  photoMode?: boolean;
  referenceImage?: string; // Base64 encoded image
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking for Hugging Face token...');
    const env = Deno.env.toObject();
    console.log('Available env keys:', Object.keys(env).filter(key => key.includes('HUGGING') || key.includes('HF')));
    
    const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    console.log('HUGGING_FACE_ACCESS_TOKEN found:', !!huggingFaceToken);
    console.log('Token length:', huggingFaceToken?.length || 0);
    
    if (!huggingFaceToken) {
      console.error('Missing Hugging Face token');
      return new Response(JSON.stringify({
        success: false,
        error: 'Hugging Face access token not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const body: GenerateAvatarRequest = await req.json();
    console.log('Generate avatar request:', body);

    // Build enhanced prompt from user selections
    const enhancedPrompt = buildEnhancedPrompt(body);
    console.log('Enhanced prompt:', enhancedPrompt);

    const hf = new HfInference(huggingFaceToken);

    // Compute safe dimensions
    const { width, height } = mapResolutionToSize(body.resolution);
    console.log('Requested resolution:', body.resolution, '-> Using size:', width + 'x' + height);

    let image: Blob;
    try {
      // Use FLUX.1-dev for Photo Mode (higher quality), schnell for speed otherwise
      const model = body.photoMode ? 'black-forest-labs/FLUX.1-dev' : 'black-forest-labs/FLUX.1-schnell';
      console.log(`Generating with ${model}...`);
      
      // Check if we have a reference image for image-to-image generation
      if (body.referenceImage) {
        console.log('Using reference image for img2img generation...');
        // Convert base64 to blob for reference image
        const base64Data = body.referenceImage.split(',')[1];
        const binaryData = atob(base64Data);
        const uint8Array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }
        const referenceBlob = new Blob([uint8Array], { type: 'image/png' });
        
        image = await hf.imageToImage({
          inputs: referenceBlob,
          model,
          parameters: { 
            prompt: enhancedPrompt,
            negative_prompt: body.negativePrompt,
            width, 
            height,
            strength: 0.8, // How much to change the reference image
            guidance_scale: body.adherence || 7,
            num_inference_steps: body.steps || 28
          },
        });
      } else {
        image = await hf.textToImage({
          inputs: enhancedPrompt,
          model,
          parameters: { width, height },
        });
      }
    } catch (e) {
      const msg = (e as Error)?.message || String(e);
      console.error('HF generation error (primary):', msg);

      // Try progressive fallbacks for any HF error
      try {
        console.log('Falling back to stabilityai/sdxl-turbo at', Math.min(512, width) + 'x' + Math.min(512, height), '...');
        image = await hf.textToImage({
          inputs: enhancedPrompt,
          model: 'stabilityai/sdxl-turbo',
          parameters: { width: Math.min(512, width), height: Math.min(512, height) },
        });
      } catch (e2) {
        const msg2 = (e2 as Error)?.message || String(e2);
        console.error('HF generation error (fallback 1):', msg2);
        try {
          console.log('Falling back to stabilityai/stable-diffusion-2-1 at 512x512...');
          image = await hf.textToImage({
            inputs: enhancedPrompt,
            model: 'stabilityai/stable-diffusion-2-1',
            parameters: { width: 512, height: 512 },
          });
        } catch (e3) {
          const msg3 = (e3 as Error)?.message || String(e3);
          console.error('HF generation error (fallback 2):', msg3);

          // Final fallback: OpenAI gpt-image-1 if available
          const openaiKey = Deno.env.get('OPENAI_API_KEY');
          if (!openaiKey) throw e3;
          console.log('Falling back to OpenAI gpt-image-1...');
          const openaiSize = mapToOpenAISize(width, height);
          const oaRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-image-1',
              prompt: enhancedPrompt,
              size: openaiSize,
              n: 1,
            }),
          });
          if (!oaRes.ok) {
            const errTxt = await oaRes.text();
            throw new Error(`OpenAI images error ${oaRes.status}: ${errTxt}`);
          }
          const oaJson = await oaRes.json();
          const datum = oaJson?.data?.[0];
          const base64 = datum?.b64_json;
          if (!base64) throw new Error('OpenAI returned no image data');

          return new Response(JSON.stringify({
            success: true,
            image: `data:image/png;base64,${base64}`,
            prompt: enhancedPrompt,
            provider: 'openai',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }
    }

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    return new Response(JSON.stringify({ 
      success: true,
      image: `data:image/png;base64,${base64}`,
      prompt: enhancedPrompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-avatar function:', error);
    const message = (error as Error)?.message || String(error);
    return new Response(JSON.stringify({ 
      success: false,
      error: message
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildEnhancedPrompt(params: GenerateAvatarRequest): string {
  let enhancedPrompt = params.prompt;

  if (params.photoMode) {
    // Ultra-realistic photography prompts for highest quality
    enhancedPrompt = `hyperrealistic professional portrait photograph, ${enhancedPrompt}, ultra-detailed skin texture, natural facial features, professional studio photography, commercial headshot quality, 85mm lens, perfect lighting, photorealistic human face, natural skin tone, realistic hair texture, detailed eyes, professional makeup, sharp focus, high resolution, editorial quality`;
    
    // Add stronger realism constraints
    enhancedPrompt += `, ultra-realistic, lifelike, natural human proportions, realistic lighting, professional photography setup, studio quality, crystal clear details, natural expression, authentic human features`;
    
    // Add negative prompts inline for better results
    enhancedPrompt += `, not cartoon, not anime, not illustration, not CGI, not painting, not 3D render, not artificial, not plastic, not doll-like, realistic human only`;
    
    // Character preset integration
    if (params.selectedPreset) {
      enhancedPrompt = `${params.selectedPreset}, ${enhancedPrompt}`;
    }
  } else {
    // For creative mode, allow more stylistic variation
    if (params.style) {
      enhancedPrompt = `${params.style} style, ${enhancedPrompt}`;
    }
  }

  // Add demographic details if provided (more naturally)
  if (params.gender) enhancedPrompt += `, ${params.gender} person`;
  if (params.age) enhancedPrompt += `, ${params.age} years old`;
  if (params.hairColor) enhancedPrompt += `, natural ${params.hairColor} hair`;
  if (params.eyeColor) enhancedPrompt += `, ${params.eyeColor} eyes`;
  
  // Add environmental details
  if (params.setting) enhancedPrompt += `, ${params.setting} background`;
  if (params.pose) enhancedPrompt += `, ${params.pose}`;
  if (params.clothing) enhancedPrompt += `, wearing ${params.clothing}`;
  if (params.accessories) enhancedPrompt += `, with ${params.accessories}`;

  return enhancedPrompt;
}

function mapResolutionToSize(resolution?: string): { width: number; height: number } {
  // Default safe size to reduce OOM risk while keeping good quality
  const DEFAULT = { width: 512, height: 512 };
  if (!resolution) return DEFAULT;
  const match = (resolution || '').match(/^(\d+)x(\d+)$/i);
  if (!match) return DEFAULT;
  let width = parseInt(match[1], 10);
  let height = parseInt(match[2], 10);

  // Cap to avoid GPU OOM in shared/free environments
  const cap = 768; // prefer <= 768; retry logic will drop to 512 if needed
  if (width > cap || height > cap) {
    const aspect = width / height;
    if (aspect >= 1) {
      width = Math.min(cap, width);
      height = Math.round(width / aspect);
    } else {
      height = Math.min(cap, height);
      width = Math.round(height * aspect);
    }
  }

  // Ensure multiples of 8 for diffusion models
  width = Math.max(256, Math.floor(width / 8) * 8);
  height = Math.max(256, Math.floor(height / 8) * 8);

  return { width, height };
}

function mapToOpenAISize(width: number, height: number): string {
  if (width === height) return '1024x1024';
  return width > height ? '1536x1024' : '1024x1536';
}