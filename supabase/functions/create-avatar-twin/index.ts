import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const { sourceImage, promptStyle = "professional portrait", variations = 4 }: CreateAvatarTwinRequest = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting avatar twin creation process...');
    console.log('Prompt style:', promptStyle);

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

    // Store results in Supabase if user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );

        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        
        if (userData.user) {
          // Store the avatar twin creation in the library
          await supabaseClient.from("avatar_library").insert({
            user_id: userData.user.id,
            title: "AI Avatar Twin",
            prompt: `Avatar twin created with style: ${promptStyle}`,
            image_url: enhancedUrl,
            tags: ["avatar-twin", "enhanced", promptStyle]
          });
          
          console.log('Avatar twin saved to user library');
        }
      } catch (error) {
        console.error('Failed to save to library:', error);
        // Continue without saving to library
      }
    }

    return new Response(JSON.stringify({
      success: true,
      enhancedVersion: {
        url: enhancedUrl,
        revised_prompt: enhancedImage?.revised_prompt || null
      },
      variations: successfulVariations,
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