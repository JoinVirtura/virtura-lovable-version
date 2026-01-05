import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { trackApiCost } from './cost-tracking.ts';
import { calculateTokenCost } from './token-costs.ts';

const ADMIN_EMAIL = 'sirjahibentley@gmail.com';

/**
 * Check if user is admin (unlimited free access)
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check user_roles table for admin role
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }

  return !!data;
}

/**
 * Check if user has enough tokens for an operation
 * Admins always have unlimited tokens
 */
export async function checkTokenBalance(
  userId: string,
  requiredTokens: number
): Promise<{ hasBalance: boolean; currentBalance: number; isAdmin?: boolean }> {
  // Check if user is admin first - admins have unlimited access
  const isAdmin = await isAdminUser(userId);
  if (isAdmin) {
    console.log(`[ADMIN] Unlimited tokens for admin user: ${userId}`);
    return { hasBalance: true, currentBalance: 999999, isAdmin: true };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('user_tokens')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Failed to check token balance:', error);
    return { hasBalance: false, currentBalance: 0 };
  }

  return {
    hasBalance: data.balance >= requiredTokens,
    currentBalance: data.balance,
  };
}

/**
 * Deduct tokens and track cost atomically
 * Returns true if successful, false if insufficient balance
 */
export async function deductTokensAndTrackCost(params: {
  userId: string;
  resourceType: 'image_generation' | 'voice_generation' | 'video_generation' | 'style_transfer' | 'avatar_generation';
  apiProvider: 'replicate' | 'elevenlabs' | 'heygen' | 'openai' | 'huggingface';
  modelUsed?: string;
  tokensToDeduct: number;
  costUsd: number;
  metadata?: Record<string, any>;
  resourceId?: string;
}): Promise<{ success: boolean; remainingBalance: number; error?: string; isAdmin?: boolean }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if user is admin - skip token deduction but still track costs
    const isAdmin = await isAdminUser(params.userId);
    
    if (isAdmin) {
      console.log(`[ADMIN] Skipping token deduction for admin user: ${params.userId}`);
      
      // Still track API cost for analytics
      await trackApiCost({
        userId: params.userId,
        resourceType: params.resourceType,
        apiProvider: params.apiProvider,
        modelUsed: params.modelUsed,
        costUsd: params.costUsd,
        tokensCharged: 0, // Admin not charged
        metadata: { ...params.metadata, admin: true },
      });

      return { success: true, remainingBalance: 999999, isAdmin: true };
    }
    // Call database function to deduct tokens atomically
    const { data, error } = await supabase.rpc('deduct_tokens', {
      p_user_id: params.userId,
      p_amount: params.tokensToDeduct,
      p_resource_type: params.resourceType,
      p_resource_id: params.resourceId || null,
      p_cost_usd: params.costUsd,
      p_metadata: params.metadata || {},
    });

    if (error) {
      console.error('Failed to deduct tokens:', error);
      return { success: false, remainingBalance: 0, error: error.message };
    }

    // If deduction failed (insufficient balance)
    if (!data) {
      const balance = await checkTokenBalance(params.userId, 0);
      return { 
        success: false, 
        remainingBalance: balance.currentBalance,
        error: 'Insufficient token balance' 
      };
    }

    // Track API cost for analytics
    await trackApiCost({
      userId: params.userId,
      resourceType: params.resourceType,
      apiProvider: params.apiProvider,
      modelUsed: params.modelUsed,
      costUsd: params.costUsd,
      tokensCharged: params.tokensToDeduct,
      metadata: params.metadata,
    });

    // Get remaining balance
    const { currentBalance } = await checkTokenBalance(params.userId, 0);

    return { success: true, remainingBalance: currentBalance };
  } catch (error: any) {
    console.error('Error in deductTokensAndTrackCost:', error);
    return { success: false, remainingBalance: 0, error: error.message };
  }
}

/**
 * Add tokens (for purchases or bonuses)
 */
export async function addTokens(
  userId: string,
  amount: number,
  transactionType: 'purchase' | 'bonus' | 'refund' | 'admin_credit' = 'purchase',
  metadata?: Record<string, any>
): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase.rpc('add_tokens', {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: transactionType,
    p_metadata: metadata || {},
  });

  if (error) {
    console.error('Failed to add tokens:', error);
    return false;
  }

  return data === true;
}

/**
 * Get user's token balance and stats
 */
export async function getUserTokenStats(userId: string): Promise<{
  balance: number;
  lifetimePurchased: number;
  lifetimeUsed: number;
} | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('user_tokens')
    .select('balance, lifetime_purchased, lifetime_used')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Failed to get token stats:', error);
    return null;
  }

  return {
    balance: data.balance,
    lifetimePurchased: data.lifetime_purchased,
    lifetimeUsed: data.lifetime_used,
  };
}
