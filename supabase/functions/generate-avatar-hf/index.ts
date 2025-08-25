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

    // Map resolution to safe size and log
    const { width, height } = mapResolutionToSize(body.resolution);
    console.log('Requested resolution:', body.resolution, '-> Using size:', width + 'x' + height);

    let image: Blob;
    try {
      image = await hf.textToImage({
        inputs: enhancedPrompt,
        model: 'black-forest-labs/FLUX.1-schnell',
        parameters: { width, height }
      });
    } catch (e) {
      const msg = (e as Error)?.message || String(e);
      console.error('HF generation error:', msg);
      if (msg.toLowerCase().includes('out of memory') || msg.toLowerCase().includes('cuda')) {
        console.log('Retrying generation at 512x512 due to OOM...');
        image = await hf.textToImage({
          inputs: enhancedPrompt,
          model: 'black-forest-labs/FLUX.1-schnell',
          parameters: { width: 512, height: 512 }
        });
      } else {
        throw e;
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
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildEnhancedPrompt(params: GenerateAvatarRequest): string {
  let prompt = (params.prompt && params.prompt.trim().length > 0)
    ? params.prompt.trim()
    : "Beautiful avatar portrait";
  
  // Add style context with ultra-realistic focus
  if (params.style) {
    switch (params.style.toLowerCase()) {
      case 'photorealistic':
        prompt += ", award-winning professional headshot photography, hyperrealistic portrait, Canon 5D Mark IV with 85mm f/1.4 lens, Profoto studio lighting, three-point lighting setup with softbox key light and rim lighting, perfect skin texture showing natural pores and micro-details, subsurface scattering, film grain texture, shot on Kodak Portra 400 film stock, shallow depth of field f/1.4, creamy bokeh background, crystal clear eyes with perfect catchlights, natural but flawless makeup, professional retouching, commercial photography quality, ultra-sharp focus on eyes, professional color grading with lifted shadows and warm highlights";
        break;
      case 'realistic':
        prompt += ", photorealistic portrait, professional photo, 50mm lens, natural skin texture, subtle film grain";
        break;
      case 'artistic':
        prompt += ", artistic portrait, painterly style, creative interpretation";
        break;
      case 'anime':
        prompt += ", anime style, manga art, stylized illustration";
        break;
      case 'fantasy':
        prompt += ", fantasy art style, magical, ethereal";
        break;
      default:
        prompt += `, ${params.style} style`;
    }
  }

  // Add demographic details
  if (params.gender) {
    prompt += `, ${params.gender}`;
  }
  
  if (params.age) {
    prompt += `, ${params.age}`;
  }

  // Add appearance details
  if (params.hairColor) {
    prompt += `, ${params.hairColor} hair`;
  }
  
  if (params.eyeColor) {
    prompt += `, ${params.eyeColor} eyes`;
  }

  // Add clothing and accessories
  if (params.clothing) {
    prompt += `, wearing ${params.clothing}`;
  }
  
  if (params.accessories) {
    prompt += `, with ${params.accessories}`;
  }

  // Add pose and setting
  if (params.pose) {
    prompt += `, ${params.pose} pose`;
  }
  
  if (params.setting) {
    prompt += `, ${params.setting} background`;
  }

  // Add quality enhancers and strong negative cues to ensure realism
  prompt += ", professional studio lighting, detailed skin texture, pores, subsurface scattering, sharp focus, shallow depth of field, 85mm lens, DSLR, RAW photo, color graded, bokeh, stunning composition";

  // Negative prompts to avoid non-realistic artifacts
  prompt += ", no cartoon, no CGI, no illustration, no painting, no over-smooth skin, no plastic texture, no blurry, no text, no watermark, no extra fingers, no deformed";

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