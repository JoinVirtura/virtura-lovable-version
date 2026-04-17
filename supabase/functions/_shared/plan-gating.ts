import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type PlanName = "free" | "starter" | "pro" | "scale";

/**
 * Plan tier ordering. Higher tier = more access.
 */
const PLAN_TIER: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  scale: 3,
};

/**
 * Features that require a minimum plan tier.
 * Admins bypass all checks.
 */
const FEATURE_MIN_PLAN: Record<string, PlanName> = {
  "heygen-talking-photo": "pro",
  "heygen-video": "pro",
  "premium-video": "pro",
  "priority-processing": "pro",
  "commercial-license": "pro",
  "team-collaboration": "scale",
  "white-label": "scale",
};

export interface PlanAccessResult {
  hasAccess: boolean;
  plan: PlanName;
  isAdmin: boolean;
  requiredPlan?: PlanName;
  reason?: string;
}

/**
 * Check if a user has access to a gated feature.
 * Reads plan from the `subscriptions` table and admin status from `user_roles`.
 */
export async function checkPlanAccess(
  userId: string,
  feature: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<PlanAccessResult> {
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Admins bypass all restrictions
  const { data: roleData } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleData) {
    return { hasAccess: true, plan: "scale", isAdmin: true };
  }

  // Get current plan from active subscription
  const { data: sub } = await adminClient
    .from("subscriptions")
    .select("plan_name, status")
    .eq("user_id", userId)
    .maybeSingle();

  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const plan: PlanName = (isActive && sub?.plan_name && PLAN_TIER[sub.plan_name] !== undefined)
    ? (sub.plan_name as PlanName)
    : "free";

  const requiredPlan = FEATURE_MIN_PLAN[feature];
  if (!requiredPlan) {
    // No gating for this feature — allow
    return { hasAccess: true, plan, isAdmin: false };
  }

  const userTier = PLAN_TIER[plan];
  const requiredTier = PLAN_TIER[requiredPlan];
  const hasAccess = userTier >= requiredTier;

  return {
    hasAccess,
    plan,
    isAdmin: false,
    requiredPlan,
    reason: hasAccess
      ? undefined
      : `This feature requires the ${requiredPlan} plan or higher. You're currently on ${plan}.`,
  };
}
