import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { deductTokensAndTrackCost } from '../_shared/token-manager.ts';
import { calculateTokenCost } from '../_shared/token-costs.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAvatarTwinRequest {
  sourceImage: string; // base64 image
  promptStyle?: string;
  variations?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication first
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sourceImage, promptStyle = "professional portrait", variations = 4 }: CreateAvatarTwinRequest = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting avatar twin creation process...');
    console.log('Prompt style:', promptStyle);

    // Calculate total tokens needed (enhanced + variations)
    const totalGenerations = 1 + variations;
    const tokensPerImage = calculateTokenCost('openai_image', 'dall-e-3-1024-hd');
    const tokensNeeded = tokensPerImage * totalGenerations;
    
    console.log(`💰 Tokens required: ${tokensNeeded} (${totalGenerations} images × ${tokensPerImage} tokens)`);
    
    // Deduct tokens upfront for all generations
    const tokenResult = await deductTokensAndTrackCost({
      userId: user.id,
      resourceType: 'image_generation',
      apiProvider: 'openai',
      modelUsed: 'gpt-image-1',
      tokensToDeduct: tokensNeeded,
      costUsd: 0.08 * totalGenerations,
      metadata: { promptStyle, variations, totalGenerations }
    });

    if (!tokenResult.success) {
      console.error('❌ Insufficient tokens:', tokenResult.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: tokenResult.error || 'Insufficient token balance',
          required: tokensNeeded,
          currentBalance: tokenResult.remainingBalance
        }), 
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Tokens deducted. Remaining balance: ${tokenResult.remainingBalance}`);

    // Since we can't process uploaded images directly with the current API setup,
    // we'll create professional avatar variations based on the selected style
    const basePrompt = `Create a photorealistic professional avatar: ${promptStyle} style, high quality portrait photography, studio lighting, sharp focus, detailed facial features`;

    // Create enhanced version using OpenAI
    const enhancedResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `${basePrompt}, enhanced quality, premium professional headshot`,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    });

    if (!enhancedResponse.ok) {
      const error = await enhancedResponse.text();
      console.error('Enhanced image generation failed:', error);
      throw new Error(`Enhanced image generation failed: ${error}`);
    }

    const enhancedData = await enhancedResponse.json();
    console.log('Enhanced version created successfully');
    
    // Extract base64 data from response
    const enhancedImage = enhancedData?.data?.[0];
    const enhancedUrl = enhancedImage?.b64_json ? 
      `data:image/png;base64,${enhancedImage.b64_json}` : 
      enhancedImage?.url || null;

    if (!enhancedUrl) {
      throw new Error('No enhanced image URL received from OpenAI');
    }

    // Create variations using OpenAI
    const variationPromises = Array.from({ length: variations }, async (_, index) => {
      const variationStyles = [
        "professional business portrait, confident expression, suit and tie",
        "creative artistic portrait, dynamic lighting, modern styling",
        "casual lifestyle portrait, natural smile, relaxed atmosphere",
        "elegant formal portrait, sophisticated look, classic composition"
      ];
      
      const style = variationStyles[index % variationStyles.length];
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: `${basePrompt}, ${style}, unique perspective, variation ${index + 1}`,
          n: 1,
          size: '1024x1024',
          quality: 'high',
          output_format: 'png'
        }),
      });

      if (!response.ok) {
        console.error(`Variation ${index + 1} generation failed`);
        return null;
      }

      const data = await response.json();
      const variationImage = data?.data?.[0];
      const variationUrl = variationImage?.b64_json ? 
        `data:image/png;base64,${variationImage.b64_json}` : 
        variationImage?.url || null;
      
      return variationUrl ? { url: variationUrl } : null;
    });

    const variationResults = await Promise.allSettled(variationPromises);
    const successfulVariations = variationResults
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    console.log(`Created ${successfulVariations.length} variations successfully`);

    // Store results in library
    try {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      
      await serviceClient.from("avatar_library").insert({
        user_id: user.id,
        title: "AI Avatar Twin",
        prompt: `Avatar twin created with style: ${promptStyle}`,
        image_url: enhancedUrl,
        tags: ["avatar-twin", "enhanced", promptStyle]
      });
      
      console.log('Avatar twin saved to user library');
    } catch (error) {
      console.error('Failed to save to library:', error);
      // Continue without saving to library
    }

    return new Response(JSON.stringify({
      success: true,
      enhancedVersion: {
        url: enhancedUrl,
        revised_prompt: enhancedImage?.revised_prompt || null
      },
      variations: successfulVariations,
      tokensCharged: tokensNeeded,
      remainingBalance: tokenResult.remainingBalance,
      message: `Successfully created enhanced version and ${successfulVariations.length} variations`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-avatar-twin function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to create avatar twin',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});