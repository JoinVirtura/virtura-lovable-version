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
    console.log('HeyGen cleanup function called');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get HeyGen API key
    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    if (!heygenKey) {
      throw new Error('HeyGen API key not configured');
    }

    console.log('HeyGen API key found, proceeding with cleanup');

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

    // First, let's list all HeyGen avatars to see what we have
    try {
      const listResponse = await fetch('https://api.heygen.com/v2/avatars', {
        headers: {
          'Authorization': `Bearer ${heygenKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log('HeyGen avatars:', JSON.stringify(listData, null, 2));

        // Delete all existing talking photos to free up space
        if (listData.data?.avatars) {
          for (const avatar of listData.data.avatars) {
            if (avatar.avatar_type === 'talking_photo') {
              try {
                const deleteResponse = await fetch(`https://api.heygen.com/v1/photo_avatar/${avatar.avatar_id}`, {
                  method: 'DELETE',
                  headers: { 'x-api-key': heygenKey }
                });
                console.log(`Deleted avatar ${avatar.avatar_id}, status: ${deleteResponse.status}`);
              } catch (deleteError) {
                console.log('Delete error:', deleteError);
              }
            }
          }
        }
      } else {
        console.log('List avatars failed:', listResponse.status, await listResponse.text());
      }
    } catch (listError) {
      console.log('List error:', listError);
    }

    // Clean up our database records
    const { error: updateError } = await supabase
      .from('talking_avatars')
      .update({ 
        heygen_talking_photo_id: null,
        status: 'failed',
        error_message: 'Cleaned up for new upload'
      })
      .eq('user_id', user.id)
      .not('heygen_talking_photo_id', 'is', null);

    if (updateError) {
      console.error('Database cleanup error:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'HeyGen avatars cleaned up successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});