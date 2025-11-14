import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { testId, targetUserIds } = await req.json();

    console.log(`Sending A/B test notifications for test ${testId} to ${targetUserIds.length} users`);

    // Get test configuration with variants
    const { data: test, error: testError } = await supabase
      .from('notification_ab_tests')
      .select(`
        *,
        variants:notification_ab_variants(*)
      `)
      .eq('id', testId)
      .single();

    if (testError || !test) {
      console.error('Error fetching test:', testError);
      return new Response(
        JSON.stringify({ error: 'Test not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (test.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Test is not active' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const variants = test.variants || [];
    if (variants.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No variants found for test' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find control variant
    const controlVariant = variants.find(v => v.variant_name === 'control');
    const testVariants = variants.filter(v => v.variant_name !== 'control');

    if (!controlVariant || testVariants.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Test must have a control variant and at least one test variant' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let successCount = 0;
    let errorCount = 0;

    // Assign users to variants and send notifications
    for (const userId of targetUserIds) {
      try {
        // Determine variant assignment (random split based on control_group_percentage)
        const randomValue = Math.random() * 100;
        const assignedVariant = randomValue < test.control_group_percentage 
          ? controlVariant
          : testVariants[Math.floor(Math.random() * testVariants.length)];

        console.log(`Assigning user ${userId} to variant ${assignedVariant.variant_name}`);

        // Send notification with variant content
        const { data: notification, error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: assignedVariant.title,
            message: assignedVariant.message,
            category: assignedVariant.category,
            priority: assignedVariant.priority,
            metadata: { 
              ab_test_id: testId, 
              variant_id: assignedVariant.id,
              variant_name: assignedVariant.variant_name,
            },
          })
          .select()
          .single();

        if (notifError) {
          console.error(`Error creating notification for user ${userId}:`, notifError);
          errorCount++;
          continue;
        }

        // Record assignment
        await supabase.from('notification_ab_assignments').insert({
          test_id: testId,
          variant_id: assignedVariant.id,
          user_id: userId,
          notification_id: notification.id,
        });

        // Record initial metric
        await supabase.from('notification_ab_metrics').insert({
          test_id: testId,
          variant_id: assignedVariant.id,
          user_id: userId,
          notification_sent: true,
          sent_at: new Date().toISOString(),
        });

        successCount++;
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        errorCount++;
      }
    }

    console.log(`A/B test send complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        successCount,
        errorCount,
        totalProcessed: targetUserIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in ab-test-send-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
