import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  referenceImage?: string; // Base64 encoded image for image-to-image
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
    const imageSize = mapResolutionToSize(body.resolution || 'HD');
    console.log('Using size:', imageSize);

    // Helper to call OpenAI Images API
    const callOpenAI = async (payload: any) => {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      let json: any = null;
      try { json = await res.json(); } catch (_) {}
      return { res, json };
    };

    // 1) Try gpt-image-1 (best quality, may require org verification)
    const primaryPayload: any = {
      model: 'gpt-image-1',
      prompt: enhancedPrompt,
      n: 1,
      size: imageSize,
      quality: body.photoMode ? 'high' : 'auto',
      moderation: 'low',
    };

    let { res: response, json: data } = await callOpenAI(primaryPayload);
    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const message = data?.error?.message || `OpenAI API error (${response.status})`;
      console.error('OpenAI API error:', data || response.statusText);

      // 2) Automatic fallback to DALL·E 3 when org not verified / access denied
      if (response.status === 403 || /must be verified|not allowed|access/i.test(message)) {
        console.log('Falling back to model dall-e-3 due to permission error...');
        const dallePayload: any = {
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: imageSize,
          quality: body.photoMode ? 'hd' : 'standard', // valid for dall-e-3
          style: body.photoMode ? 'natural' : 'vivid', // valid for dall-e-3
        };
        const fb = await callOpenAI(dallePayload);
        response = fb.res;
        data = fb.json;
        console.log('DALL·E 3 response status:', response.status);
        if (!response.ok) {
          const fbMsg = data?.error?.message || `OpenAI API error (${response.status})`;
          return new Response(JSON.stringify({ success: false, error: fbMsg }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      } else {
        // Other errors: return to client
        return new Response(JSON.stringify({ success: false, error: message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    // Normalize output across models
    let image: string | null = null;
    if (data?.data?.[0]?.b64_json) {
      image = `data:image/png;base64,${data.data[0].b64_json}`;
    } else if (data?.data?.[0]?.url) {
      image = data.data[0].url;
    }

    if (!image) {
      return new Response(JSON.stringify({ success: false, error: 'Image generation returned no data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      image,
      prompt: enhancedPrompt,
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
    // Transform to ultra-realistic professional headshot format
    prompt = `Ultra-realistic professional studio headshot photograph of ${prompt.toLowerCase().replace('professional portrait', 'person').replace('professional studio headshot photograph of ', '').replace('hyperrealistic professional portrait photograph', 'person')}`;
    
    // Add clean demographics
    if (params.gender) prompt += `, ${params.gender} person`;
    if (params.age) prompt += `, ${params.age} years old`;
    
    // Single appearance choices (no alternatives)
    if (params.hairColor) prompt += `, natural ${params.hairColor} hair`;
    if (params.eyeColor) prompt += `, ${params.eyeColor} eyes`;
    if (params.clothing) prompt += `, wearing ${params.clothing.split(',')[0].trim()}`;
    
    // Ultra-realistic photography specifications for premium quality
    prompt += ", hyperrealistic professional studio portrait, commercial photography quality, 85mm portrait lens, professional three-point lighting setup, natural human skin texture, realistic facial features, professional makeup, razor sharp focus, shallow depth of field, neutral studio background, single person headshot, editorial magazine quality, ultra-detailed, lifelike, natural human proportions, authentic lighting, photorealistic human face, crystal clear details";
    
    // Stronger negative constraints for realism
    prompt += ", not a cartoon, not anime, not illustration, not CGI, not painting, not 3D render, not multiple people, not collage, no text, no watermarks, no borders, no artificial smoothing, no plastic skin, no extra limbs, no face distortion, no blurry features, single consistent realistic look, not doll-like, not artificial, authentic human only";
    
  } else {
    // Creative mode with more freedom
    if (params.style) {
      switch (params.style.toLowerCase()) {
        case 'photorealistic':
        case 'realistic':
          prompt += ", hyperrealistic portrait photography, ultra-detailed, high quality";
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
