import { supabase } from "@/integrations/supabase/client";

export type TrackedResource =
  | "image_generation"
  | "voice_generation"
  | "video_generation"
  | "storage";

/**
 * Fire-and-forget usage tracking. Records one row in the usage_tracking table
 * via the track-usage edge function. Skips silently for anonymous users so
 * the landing-page free trial is never blocked by tracking failures.
 */
export async function trackUsage(resource: TrackedResource, amount = 1): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.functions.invoke("track-usage", {
      body: {
        resource_type: resource,
        amount,
        metadata: { tracked_at: new Date().toISOString() },
      },
    });
    if (error) console.warn(`[trackUsage] ${resource} failed:`, error.message);
  } catch (err) {
    console.warn(`[trackUsage] ${resource} threw:`, err);
  }
}
