import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { document_type, front_url, back_url } = await req.json();

    if (!document_type || !front_url || !back_url) {
      throw new Error('Missing required fields');
    }

    // Create or update verification request
    const { error: upsertError } = await supabaseClient
      .from('user_verification')
      .upsert({
        user_id: user.id,
        status: 'pending',
        id_document_type: document_type,
        id_document_url: JSON.stringify({ front: front_url, back: back_url }),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) throw upsertError;

    // TODO: Send notification to admins about new verification request
    console.log(`[submit-verification] New verification request from user ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Verification request submitted' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[submit-verification] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
