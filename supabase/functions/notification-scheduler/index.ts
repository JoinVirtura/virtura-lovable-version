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

    console.log("Checking for pending scheduled notifications...");

    // Get all pending notifications scheduled for now or earlier
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${pendingNotifications?.length || 0} pending notifications`);

    for (const notification of pendingNotifications || []) {
      try {
        console.log(`Processing notification: ${notification.id}`);

        // Get target users based on audience
        let targetUserIds: string[] = [];

        if (notification.target_audience === "all") {
          const { data: users } = await supabase
            .from("profiles")
            .select("id");
          targetUserIds = users?.map(u => u.id) || [];
        } else if (notification.target_audience === "admins") {
          const { data: adminRoles } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", "admin");
          targetUserIds = adminRoles?.map(r => r.user_id) || [];
        } else if (notification.target_audience === "active") {
          // Get users who have logged in within the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: users } = await supabase
            .from("profiles")
            .select("id")
            .gte("created_at", thirtyDaysAgo.toISOString());
          targetUserIds = users?.map(u => u.id) || [];
        }

        console.log(`Target users count: ${targetUserIds.length}`);

        // Create notifications for each user
        const notifications = targetUserIds.map(userId => ({
          user_id: userId,
          title: notification.subject,
          message: notification.message,
          category: notification.category,
          priority: notification.priority,
          metadata: notification.metadata || {},
        }));

        // Insert in batches of 1000
        const batchSize = 1000;
        for (let i = 0; i < notifications.length; i += batchSize) {
          const batch = notifications.slice(i, i + batchSize);
          await supabase.from("notifications").insert(batch);
        }

        // Update scheduled notification status
        await supabase
          .from("scheduled_notifications")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            recipient_count: targetUserIds.length,
          })
          .eq("id", notification.id);

        // If recurring, create next occurrence
        if (notification.recurring && notification.recurrence_pattern) {
          const nextScheduledDate = calculateNextOccurrence(
            new Date(notification.scheduled_for),
            notification.recurrence_pattern
          );

          if (!notification.recurrence_end_date || 
              nextScheduledDate <= new Date(notification.recurrence_end_date)) {
            await supabase.from("scheduled_notifications").insert({
              admin_id: notification.admin_id,
              admin_email: notification.admin_email,
              subject: notification.subject,
              message: notification.message,
              category: notification.category,
              priority: notification.priority,
              target_audience: notification.target_audience,
              scheduled_for: nextScheduledDate.toISOString(),
              timezone: notification.timezone,
              recurring: true,
              recurrence_pattern: notification.recurrence_pattern,
              recurrence_end_date: notification.recurrence_end_date,
              status: "pending",
              metadata: notification.metadata,
            });
          }
        }

        console.log(`Successfully processed notification: ${notification.id}`);
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        
        // Mark as failed
        await supabase
          .from("scheduled_notifications")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", notification.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingNotifications?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notification-scheduler:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function calculateNextOccurrence(currentDate: Date, pattern: string): Date {
  const next = new Date(currentDate);
  
  switch (pattern) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }
  
  return next;
}