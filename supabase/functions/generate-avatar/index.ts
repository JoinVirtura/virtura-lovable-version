
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
  photoMode?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const env = Deno.env.toObject();
    console.log('All environment variables:', Object.keys(env));
    console.log('Looking for OpenAI key...');
    
    const openAIApiKey = env.OPENAI_API_KEY;
    console.log('OPENAI_API_KEY found:', !!openAIApiKey);
    console.log('OPENAI_API_KEY length:', openAIApiKey?.length || 0);
    
    if (!openAIApiKey) {
      console.error('Missing OpenAI API key. Available env keys:', Object.keys(env));
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in Supabase Edge Function secrets.'
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

    // Map resolution to size - use standard DALL-E sizes
    const size = mapResolutionToSize(body.resolution || 'HD');
    console.log('Using size:', size);

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
        quality: body.photoMode ? 'high' : 'auto',
        style: body.photoMode ? 'natural' : 'auto',
        moderation: 'low'
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      let errorPayload: any = null;
      try {
        errorPayload = await response.json();
      } catch (_) {
        // No JSON body available
      }
      const message = errorPayload?.error?.message || `OpenAI API error (${response.status})`;
      console.error('OpenAI API error:', errorPayload || response.statusText);
      // Return structured error so client can show real reason instead of generic 500
      return new Response(JSON.stringify({
        success: false,
        error: message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    // DALL-E 3 returns URL, not base64
    const imageUrl = data.data[0].url;
    
    return new Response(JSON.stringify({ 
      success: true,
      image: imageUrl,
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
  // Clean and focus the prompt for better results
  let prompt = (params.prompt && params.prompt.trim().length > 0)
    ? params.prompt.trim().replace(/,?\s*(or|and|either|with|including)[^,]*/g, '').split(',')[0].trim()
    : "Professional portrait";

  // Photo Mode gets maximum realism treatment
  if (params.photoMode) {
    // Transform to professional headshot format
    prompt = `Professional studio headshot photograph of ${prompt.toLowerCase().replace('professional portrait', 'person').replace('professional studio headshot photograph of ', '')}`;
    
    // Add clean demographics
    if (params.gender) prompt += `, ${params.gender}`;
    if (params.age) prompt += `, ${params.age}`;
    
    // Single appearance choices (no alternatives)
    if (params.hairColor) prompt += `, ${params.hairColor} hair`;
    if (params.eyeColor) prompt += `, ${params.eyeColor} eyes`;
    if (params.clothing) prompt += `, wearing ${params.clothing.split(',')[0].trim()}`;
    
    // Professional photography specifications
    prompt += ", professional studio portrait, commercial photography quality, 85mm lens, professional lighting, three-point lighting setup, natural skin texture, professional makeup, sharp focus, shallow depth of field, neutral grey background, single person headshot, editorial quality, hyperrealistic detail, natural lighting, professional color grading";
    
    // Strong negative constraints
    prompt += ", not a cartoon, not anime, not illustration, not CGI, not painting, not 3D, not multiple people, not collage, no text, no watermarks, no borders, no artificial smoothing, no plastic skin, no extra limbs, no face distortion, no blurry, single consistent look";
    
  } else {
    // Creative mode with more freedom
    if (params.style) {
      switch (params.style.toLowerCase()) {
        case 'photorealistic':
        case 'realistic':
          prompt += ", photorealistic portrait photography, high quality";
          break;
        case 'artistic':
          prompt += ", artistic portrait, creative interpretation";
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
    
    // Add parameters for creative modes
    if (params.gender) prompt += `, ${params.gender}`;
    if (params.age) prompt += `, ${params.age}`;
    if (params.hairColor) prompt += `, ${params.hairColor} hair`;
    if (params.eyeColor) prompt += `, ${params.eyeColor} eyes`;
    if (params.clothing) prompt += `, wearing ${params.clothing}`;
    if (params.accessories) prompt += `, with ${params.accessories}`;
    if (params.pose) prompt += `, ${params.pose} pose`;
    if (params.setting) prompt += `, ${params.setting} background`;
    
    prompt += ", professional quality, detailed, high resolution";
  }

  return prompt;
}

function mapResolutionToSize(resolution: string): string {
  switch (resolution.toLowerCase()) {
    case 'sd':
    case '512x512':
      return '1024x1024';
    case 'hd':
    case '1024x1024':
      return '1024x1024';
    case '4k':
    case '1536x1536':
      return '1024x1792'; // DALL-E 3 supported size
    default:
      return '1024x1024';
  }
}
