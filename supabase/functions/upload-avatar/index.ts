import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Upload avatar function called');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API keys
    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { photoUrl } = await req.json();
    console.log('Processing upload for user:', user.id, 'photoUrl:', photoUrl);

    if (!photoUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing photoUrl parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let heygenTalkingPhotoId = null;
    let heygenError = null;

    // Try to upload to HeyGen first (primary provider)
    if (heygenKey) {
      try {
        console.log('Uploading to HeyGen...');
        
        // First, try to clean up old avatars to stay within limits
        try {
          const { data: existingAvatars } = await supabase
            .from('talking_avatars')
            .select('heygen_talking_photo_id')
            .eq('user_id', user.id)
            .not('heygen_talking_photo_id', 'is', null)
            .order('created_at', { ascending: true })
            .limit(2); // Keep only newest 2, delete older ones

          if (existingAvatars && existingAvatars.length > 0) {
            for (const avatar of existingAvatars) {
              try {
                await fetch(`https://api.heygen.com/v1/photo_avatar/${avatar.heygen_talking_photo_id}`, {
                  method: 'DELETE',
                  headers: { 'x-api-key': heygenKey }
                });
                console.log('Deleted old HeyGen avatar:', avatar.heygen_talking_photo_id);
              } catch (deleteError) {
                console.log('Failed to delete old avatar:', deleteError);
              }
            }
          }
        } catch (cleanupError) {
          console.log('Cleanup warning:', cleanupError);
        }
        
        // Fetch the image from the URL
        const imageResponse = await fetch(photoUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        
        const imageBlob = await imageResponse.blob();
        console.log('Image fetched, size:', imageBlob.size, 'type:', imageBlob.type);

        // Upload to HeyGen talking photo API
        const heygenResponse = await fetch('https://upload.heygen.com/v1/talking_photo', {
          method: 'POST',
          headers: {
            'x-api-key': heygenKey,
            'Content-Type': imageBlob.type || 'image/jpeg',
          },
          body: imageBlob,
        });

        const heygenResponseText = await heygenResponse.text();
        console.log('HeyGen response status:', heygenResponse.status);
        console.log('HeyGen response:', heygenResponseText);

        if (heygenResponse.ok) {
          const heygenData = JSON.parse(heygenResponseText);
          heygenTalkingPhotoId = heygenData.data?.talking_photo_id || heygenData.talking_photo_id;
          console.log('HeyGen upload successful, talking_photo_id:', heygenTalkingPhotoId);
        } else {
          heygenError = `HeyGen upload failed: ${heygenResponse.status} ${heygenResponseText}`;
          console.error(heygenError);
        }
      } catch (error) {
        heygenError = `HeyGen upload error: ${error.message}`;
        console.error(heygenError);
      }
    } else {
      console.log('HeyGen API key not configured, skipping HeyGen upload');
    }

    // Prepare avatar data for database
    const avatarData = {
      user_id: user.id,
      original_image_url: photoUrl,
      heygen_talking_photo_id: heygenTalkingPhotoId,
      openai_avatar_id: photoUrl, // Use URL as fallback ID for OpenAI
      status: heygenTalkingPhotoId ? 'ready' : 'failed',
      error_message: heygenError,
      metadata: {
        uploaded_at: new Date().toISOString(),
        heygen_upload: heygenTalkingPhotoId ? 'success' : 'failed',
        heygen_error: heygenError || null
      }
    };

    console.log('Inserting avatar data:', avatarData);

    const { data, error } = await supabase
      .from('talking_avatars')
      .insert(avatarData)
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      return new Response(
        JSON.stringify({ 
          error: `Database error: ${error.message}`,
          details: error
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Avatar data inserted successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatar: data,
        heygen_available: !!heygenTalkingPhotoId,
        heygen_error: heygenError
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});