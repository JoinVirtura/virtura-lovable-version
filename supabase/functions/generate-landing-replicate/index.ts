import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IP-based rate limiting (3 requests per IP per hour for free tier)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }
  
  if (limit.count >= 3) {
    return false;
  }
  
  limit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. You can generate 3 free images per hour. Sign up for unlimited generations!' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt } = await req.json();
    
    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Valid prompt required (max 500 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY not configured');
    }

    // Initialize Replicate (same as dashboard)
    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    console.log('[Landing] Generating with Replicate Flux Schnell:', prompt);

    // Use Flux Schnell for fast, high-quality generation (same as dashboard)
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `${prompt}, professional quality, 8K resolution, masterpiece, highly detailed`,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('[Landing] Image generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        image: imageUrl,
        prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Landing] Generation error:', error);
    
    // Handle Replicate rate limits
    if (error.message?.includes('rate limit') || error.status === 429) {
      return new Response(
        JSON.stringify({ 
          error: 'Service temporarily unavailable. Please try again later or sign up for priority access!' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate image. Please try again or sign up for better reliability!'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
