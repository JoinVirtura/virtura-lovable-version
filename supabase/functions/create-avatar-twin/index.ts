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

    // Create enhanced version using OpenAI
    const enhancedResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `Create a professional, enhanced version of this person: ${promptStyle}, photorealistic, high quality, studio lighting, sharp focus, professional photography`,
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
    const enhancedBase64: string | undefined = enhancedData?.data?.[0]?.b64_json || enhancedData?.data?.[0]?.url;
    const enhancedUrl = enhancedBase64?.startsWith('data:') ? enhancedBase64 : `data:image/png;base64,${enhancedBase64}`;

    // Create variations using OpenAI
    const variationPromises = Array.from({ length: variations }, async (_, index) => {
      const variationStyles = [
        "professional business portrait, confident expression",
        "creative artistic style, dynamic lighting",
        "casual lifestyle portrait, natural smile",
        "elegant formal portrait, sophisticated look"
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
          prompt: `Create a variation of this person: ${style}, photorealistic, high quality, professional photography, unique perspective`,
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
      const vBase64: string | undefined = data?.data?.[0]?.b64_json || data?.data?.[0]?.url;
      return { url: vBase64?.startsWith('data:') ? vBase64 : `data:image/png;base64,${vBase64}` };
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
        revised_prompt: enhancedData?.data?.[0]?.revised_prompt || null
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