import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { logAdminAction } from "../_shared/audit-logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { operation, id, data } = await req.json();

    let result;
    switch (operation) {
      case 'list':
        result = await supabase
          .from('avatar_library')
          .select('*')
          .contains('tags', ['showcase'])
          .order('created_at', { ascending: true });
        break;

      case 'update':
        if (!id || !data) {
          return new Response(JSON.stringify({ error: 'id and data required for update' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await supabase
          .from('avatar_library')
          .update(data)
          .eq('id', id);
        
        await logAdminAction({
          adminId: user.id,
          adminEmail: user.email!,
          actionType: 'showcase_gallery_update',
          targetType: 'gallery_item',
          targetId: id,
          details: { data }
        });
        break;

      case 'delete':
        if (!id) {
          return new Response(JSON.stringify({ error: 'id required for delete' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await supabase
          .from('avatar_library')
          .delete()
          .eq('id', id);
        
        await logAdminAction({
          adminId: user.id,
          adminEmail: user.email!,
          actionType: 'showcase_gallery_delete',
          targetType: 'gallery_item',
          targetId: id,
          details: {}
        });
        break;

      case 'create':
        if (!data) {
          return new Response(JSON.stringify({ error: 'data required for create' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await supabase
          .from('avatar_library')
          .insert({
            ...data,
            user_id: null,
            tags: [...(data.tags || []), 'showcase', 'gallery', 'featured']
          });
        
        await logAdminAction({
          adminId: user.id,
          adminEmail: user.email!,
          actionType: 'showcase_gallery_create',
          targetType: 'gallery_item',
          details: { data }
        });
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid operation' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in manage-showcase-gallery:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});