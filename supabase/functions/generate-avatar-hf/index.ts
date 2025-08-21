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

    const image = await hf.textToImage({
      inputs: enhancedPrompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    });

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
  let prompt = params.prompt || "Beautiful avatar portrait";
  
  // Add style context
  if (params.style) {
    switch (params.style.toLowerCase()) {
      case 'realistic':
        prompt += ", photorealistic, high quality portrait photography";
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

  // Add quality enhancers
  prompt += ", professional lighting, detailed, high resolution, stunning composition";

  return prompt;
}