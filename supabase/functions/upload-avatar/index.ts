import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoUrl } = await req.json();
    
    if (!photoUrl) {
      throw new Error('Photo URL is required');
    }

    // Initialize providers based on available API keys
    const providers = [];
    
    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const runwayKey = Deno.env.get('RUNWAY_API_KEY');
    
    let results = {
      heygen_talking_photo_id: null,
      openai_avatar_id: null,
      runway_avatar_id: null,
      errors: []
    };

    // Try HeyGen first if available
    if (heygenKey) {
      try {
        console.log('Uploading to HeyGen...');
        const heygenResponse = await fetch('https://upload.heygen.com/v1/talking_photo', {
          method: 'POST',
          headers: {
            'x-api-key': heygenKey,
          },
          body: await fetch(photoUrl).then(r => r.blob())
        });

        const heygenData = await heygenResponse.json();
        
        if (heygenResponse.ok && heygenData?.data?.talking_photo_id) {
          results.heygen_talking_photo_id = heygenData.data.talking_photo_id;
          console.log('HeyGen upload successful:', results.heygen_talking_photo_id);
        } else {
          results.errors.push(`HeyGen: ${heygenData?.message || 'Upload failed'}`);
        }
      } catch (error) {
        results.errors.push(`HeyGen: ${error.message}`);
      }
    }

    // Try OpenAI avatar creation as fallback
    if (openaiKey && !results.heygen_talking_photo_id) {
      try {
        console.log('Creating OpenAI avatar reference...');
        // For OpenAI, we'll store the image URL as the avatar ID since it's used directly
        results.openai_avatar_id = photoUrl;
        console.log('OpenAI avatar reference created');
      } catch (error) {
        results.errors.push(`OpenAI: ${error.message}`);
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Save avatar data to database
    const { data: avatarData, error: dbError } = await supabase
      .from('talking_avatars')
      .insert({
        user_id: user.id,
        original_image_url: photoUrl,
        heygen_talking_photo_id: results.heygen_talking_photo_id,
        openai_avatar_id: results.openai_avatar_id,
        runway_avatar_id: results.runway_avatar_id,
        status: results.heygen_talking_photo_id || results.openai_avatar_id ? 'ready' : 'error',
        error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
        metadata: { upload_timestamp: new Date().toISOString(), providers_attempted: Object.keys(results).filter(k => k !== 'errors') }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        avatar: avatarData,
        providers_available: providers,
        ...results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Upload avatar error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        code: 'UPLOAD_AVATAR_ERROR'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});