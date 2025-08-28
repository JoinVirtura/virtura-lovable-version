import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizePromptRequest {
  originalPrompt: string;
  style?: string;
  resolution?: string;
  variantCount?: number;
}

interface OptimizedPrompt {
  prompt: string;
  negativePrompt: string;
  style: string;
  cameraSettings: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Optimizing avatar prompt...');
    
    const { originalPrompt, style = "professional", resolution = "1024x1536", variantCount = 3 }: OptimizePromptRequest = await req.json();

    console.log('Original prompt:', originalPrompt);
    console.log('Style:', style, 'Resolution:', resolution);

    const optimizationPrompt = `You are an expert prompt engineer specializing in high-quality portrait photography generation. Transform the following user prompt into ${variantCount} optimized variants for AI image generation.

CRITICAL REQUIREMENTS:
1. Each variant must describe ONE specific, concrete scene (no "alternating between" or "varies between")
2. Include precise camera and lighting specifications
3. Focus on photorealistic portrait photography
4. Maintain the core essence while removing ambiguity
5. Add professional photography terms for quality

ORIGINAL PROMPT: "${originalPrompt}"

For each variant, provide:
- A single, specific description (no alternates)
- Precise lighting setup
- Camera angle and lens details
- One specific outfit/styling choice
- One specific hair/makeup look
- One specific background setting

STYLE PREFERENCE: ${style}

Return exactly ${variantCount} variants in this JSON format:
{
  "variants": [
    {
      "prompt": "professional portrait photography, [optimized single-scene description], shot with 85mm lens, studio lighting setup, high resolution, photorealistic, detailed skin texture, sharp focus",
      "negativePrompt": "multiple faces, blurry, low quality, distorted features, extra limbs, bad anatomy, watermark, text, cartoon, anime, illustration, painting",
      "style": "professional portrait",
      "cameraSettings": "85mm lens, studio lighting, f/2.8, professional setup"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert prompt engineer for AI image generation. Return valid JSON only.' 
          },
          { role: 'user', content: optimizationPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const content = data.choices[0].message.content;
    console.log('Generated content:', content);

    // Parse the JSON response
    let optimizedPrompts;
    try {
      optimizedPrompts = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback: create a single optimized version
      optimizedPrompts = {
        variants: [{
          prompt: `professional portrait photography, ${originalPrompt.split('.')[0]}, shot with 85mm lens, studio lighting setup, high resolution, photorealistic, detailed skin texture, sharp focus`,
          negativePrompt: "multiple faces, blurry, low quality, distorted features, extra limbs, bad anatomy, watermark, text, cartoon, anime, illustration, painting",
          style: "professional portrait",
          cameraSettings: "85mm lens, studio lighting, f/2.8, professional setup"
        }]
      };
    }

    console.log('Optimization complete, returning variants:', optimizedPrompts.variants.length);

    return new Response(JSON.stringify({
      success: true,
      optimizedPrompts: optimizedPrompts.variants,
      originalPrompt,
      metadata: {
        style,
        resolution,
        variantCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in optimize-avatar-prompt function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Failed to optimize prompt'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});