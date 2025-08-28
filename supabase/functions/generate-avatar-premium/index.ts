import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAvatarRequest {
  prompt: string;
  negativePrompt?: string;
  resolution?: string;
  quality?: string;
  style?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating premium avatar with OpenAI...');
    
    const { 
      prompt, 
      negativePrompt = "blurry, low quality, distorted features, extra limbs, bad anatomy, watermark, text, cartoon, anime", 
      resolution = "1024x1536",
      quality = "high",
      style = "professional"
    }: GenerateAvatarRequest = await req.json();

    console.log('Premium generation request:', { prompt: prompt.substring(0, 100) + '...', resolution, quality });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced prompt with quality modifiers
    const enhancedPrompt = `${prompt}, ultra high quality, professional photography, 8k resolution, sharp focus, perfect lighting, detailed skin texture, photorealistic, studio quality, crisp details, award-winning portrait photography`;

    console.log('Calling OpenAI gpt-image-1 with enhanced prompt...');

    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        size: resolution,
        quality: quality,
        n: 1,
        response_format: 'b64_json'
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('OpenAI Image API error:', imageResponse.status, errorText);
      throw new Error(`OpenAI Image API error: ${imageResponse.status} - ${errorText}`);
    }

    const imageData = await imageResponse.json();
    console.log('Image generation successful');

    const generatedImageB64 = imageData.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${generatedImageB64}`;

    return new Response(JSON.stringify({
      success: true,
      imageUrl,
      metadata: {
        model: 'gpt-image-1',
        resolution,
        quality,
        promptLength: enhancedPrompt.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-avatar-premium function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});