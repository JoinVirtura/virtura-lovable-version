import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const body: GenerateAvatarRequest = await req.json();
    console.log('Generate avatar request:', body);

    // Build enhanced prompt from user selections
    const enhancedPrompt = buildEnhancedPrompt(body);
    console.log('Enhanced prompt:', enhancedPrompt);

    // Map resolution to size
    const size = mapResolutionToSize(body.resolution || 'HD');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: 'high',
        output_format: 'png',
        background: 'auto'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    // Extract base64 image data (gpt-image-1 returns base64)
    const base64Image = data.data[0].b64_json;
    
    return new Response(JSON.stringify({ 
      success: true,
      image: `data:image/png;base64,${base64Image}`,
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

function mapResolutionToSize(resolution: string): string {
  switch (resolution.toLowerCase()) {
    case 'sd':
      return '1024x1024';
    case 'hd':
      return '1536x1024';
    case '4k':
      return '1536x1024'; // gpt-image-1 max size
    default:
      return '1024x1024';
  }
}