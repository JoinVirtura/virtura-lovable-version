import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAvatarRequest {
  prompt: string;
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
      image = await hf.textToImage({
        inputs: enhancedPrompt,
        model,
        parameters: { width, height },
      });
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
  // Start with clean, focused prompt - avoid lists and alternatives
  let prompt = (params.prompt && params.prompt.trim().length > 0)
    ? params.prompt.trim().replace(/,?\s*(or|and|either|with|including)[^,]*/g, '').split(',')[0].trim()
    : "Professional headshot portrait";

  // Photo Mode gets priority treatment for maximum realism
  if (params.photoMode) {
    // Replace with studio photography setup
    prompt = `Professional studio headshot of ${prompt.toLowerCase().replace('professional headshot of ', '').replace('professional headshot portrait', 'person')}`;
    
    // Add essential demographics cleanly
    if (params.gender) prompt += `, ${params.gender}`;
    if (params.age) prompt += `, ${params.age}`;
    
    // Single appearance details (no alternatives)
    if (params.hairColor) prompt += `, ${params.hairColor} hair`;
    if (params.eyeColor) prompt += `, ${params.eyeColor} eyes`;
    if (params.clothing) prompt += `, wearing ${params.clothing.split(',')[0].trim()}`;
    
    // Professional photography technical details
    prompt += ", shot with Canon 5D Mark IV, 85mm f/1.4 lens, professional studio lighting, three-point lighting setup, softbox key light, rim lighting, natural skin texture with visible pores and micro-details, subsurface scattering, professional color grading, shallow depth of field, creamy bokeh background, crystal clear sharp focus on eyes, natural makeup, commercial photography quality";
    
    // Strong constraints for consistency
    prompt += ", single person headshot, neutral grey studio background, consistent lighting, one haircut, one outfit, professional portrait photography, editorial quality";
    
    // Powerful negative prompts for realism
    prompt += ", no cartoon, no anime, no illustration, no CGI, no painting, no 3D render, no artificial skin smoothing, no plastic texture, no multiple people, no collage, no split screen, no text overlay, no watermarks, no borders, no frames, no extra limbs, no deformities, no face distortion, no blurry details";
    
  } else {
    // Non-photo mode: more creative freedom
    if (params.style) {
      switch (params.style.toLowerCase()) {
        case 'photorealistic':
          prompt += ", photorealistic portrait, professional photography";
          break;
        case 'artistic':
          prompt += ", artistic portrait, painterly style";
          break;
        case 'anime':
          prompt += ", anime style, manga art";
          break;
        case 'fantasy':
          prompt += ", fantasy art style, magical";
          break;
        default:
          prompt += `, ${params.style} style`;
      }
    }
    
    // Add other parameters for creative mode
    if (params.gender) prompt += `, ${params.gender}`;
    if (params.age) prompt += `, ${params.age}`;
    if (params.hairColor) prompt += `, ${params.hairColor} hair`;
    if (params.eyeColor) prompt += `, ${params.eyeColor} eyes`;
    if (params.clothing) prompt += `, wearing ${params.clothing}`;
    if (params.accessories) prompt += `, with ${params.accessories}`;
    if (params.pose) prompt += `, ${params.pose} pose`;
    if (params.setting) prompt += `, ${params.setting} background`;
    
    prompt += ", high quality, detailed, professional lighting";
  }

  return prompt;
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