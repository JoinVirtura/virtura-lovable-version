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

    // Insert into talking_avatars table with simplified working data
    const avatarData = {
      user_id: user.id,
      original_image_url: photoUrl,
      openai_avatar_id: photoUrl, // Use the URL as the ID 
      status: 'ready',
      metadata: {
        uploaded_at: new Date().toISOString(),
        provider: 'direct'
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
        avatarData: data,
        talking_photo_id: data.openai_avatar_id
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