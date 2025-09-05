import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('=== UPLOAD AVATAR FUNCTION START ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    console.log('HeyGen API Key available:', !!heygenKey);
    
    if (!heygenKey) {
      throw new Error('HeyGen API key not configured in backend');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { photoUrl } = await req.json();
    console.log('Processing upload for user:', user.id, 'photoUrl:', photoUrl);

    if (!photoUrl) {
      throw new Error('Missing photoUrl parameter');
    }

    // Step 1: Clear ALL existing HeyGen avatars first
    console.log('Step 1: Clearing existing HeyGen avatars...');
    try {
      const listResponse = await fetch('https://api.heygen.com/v2/avatars', {
        headers: {
          'Authorization': `Bearer ${heygenKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log('Found avatars:', listData.data?.avatars?.length || 0);
        
        if (listData.data?.avatars) {
          for (const avatar of listData.data.avatars) {
            if (avatar.avatar_type === 'talking_photo') {
              try {
                const deleteResponse = await fetch(`https://api.heygen.com/v1/photo_avatar/${avatar.avatar_id}`, {
                  method: 'DELETE',
                  headers: { 'x-api-key': heygenKey }
                });
                console.log(`Deleted existing avatar ${avatar.avatar_id}, status: ${deleteResponse.status}`);
              } catch (deleteError) {
                console.log('Delete error (continuing):', deleteError);
              }
            }
          }
        }
      }
    } catch (cleanupError) {
      console.log('Cleanup warning (continuing):', cleanupError);
    }

    // Step 2: Fetch and upload image to HeyGen
    console.log('Step 2: Uploading new image to HeyGen...');
    const imageResponse = await fetch(photoUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const imageBlob = await imageResponse.blob();
    console.log('Image fetched, size:', imageBlob.size, 'type:', imageBlob.type);

    const heygenResponse = await fetch('https://upload.heygen.com/v1/talking_photo', {
      method: 'POST',
      headers: {
        'x-api-key': heygenKey,
        'Content-Type': imageBlob.type || 'image/jpeg',
      },
      body: imageBlob,
    });

    const heygenResponseText = await heygenResponse.text();
    console.log('HeyGen upload response status:', heygenResponse.status);
    console.log('HeyGen upload response:', heygenResponseText);

    let heygenTalkingPhotoId = null;
    let heygenError = null;

    if (heygenResponse.ok) {
      const heygenData = JSON.parse(heygenResponseText);
      heygenTalkingPhotoId = heygenData.data?.talking_photo_id || heygenData.talking_photo_id;
      console.log('✅ HeyGen upload successful! Talking photo ID:', heygenTalkingPhotoId);
    } else {
      heygenError = `HeyGen upload failed: ${heygenResponse.status} ${heygenResponseText}`;
      console.error('❌ HeyGen upload failed:', heygenError);
      throw new Error(heygenError);
    }

    // Step 3: Save to database
    console.log('Step 3: Saving to database...');
    const avatarData = {
      user_id: user.id,
      original_image_url: photoUrl,
      heygen_talking_photo_id: heygenTalkingPhotoId,
      openai_avatar_id: photoUrl,
      status: 'ready',
      error_message: null,
      metadata: {
        uploaded_at: new Date().toISOString(),
        heygen_upload: 'success',
        heygen_talking_photo_id: heygenTalkingPhotoId
      }
    };

    const { data, error } = await supabase
      .from('talking_avatars')
      .insert(avatarData)
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Avatar saved to database successfully');
    console.log('=== UPLOAD AVATAR FUNCTION SUCCESS ===');

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatar: data,
        heygen_available: true,
        message: 'Avatar uploaded and ready for video generation!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('=== UPLOAD AVATAR FUNCTION ERROR ===');
    console.error('Error details:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Upload failed',
        details: error
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});