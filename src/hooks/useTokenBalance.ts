import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TokenBalance {
  balance: number;
  lifetimePurchased: number;
  lifetimeUsed: number;
  isLoading: boolean;
  isAdmin: boolean;
}

export interface TokenCostInfo {
  tokens: number;
  description: string;
  costUsd?: number;
}

/**
 * Hook to manage user token balance
 * Admins have unlimited tokens and skip balance checks
 */
export function useTokenBalance() {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance>({
    balance: 0,
    lifetimePurchased: 0,
    lifetimeUsed: 0,
    isLoading: true,
    isAdmin: false,
  });
  const { toast } = useToast();

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
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
  };

  const refreshBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTokenBalance({ balance: 0, lifetimePurchased: 0, lifetimeUsed: 0, isLoading: false, isAdmin: false });
        return;
      }

      // Check admin status first
      const isAdmin = await checkAdminStatus(user.id);
      
      if (isAdmin) {
        // Admin users have unlimited tokens
        setTokenBalance({
          balance: 999999,
          lifetimePurchased: 999999,
          lifetimeUsed: 0,
          isLoading: false,
          isAdmin: true,
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_tokens')
        .select('balance, lifetime_purchased, lifetime_used')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch token balance:', error);
        setTokenBalance({ balance: 0, lifetimePurchased: 0, lifetimeUsed: 0, isLoading: false, isAdmin: false });
        return;
      }

      setTokenBalance({
        balance: data.balance || 0,
        lifetimePurchased: data.lifetime_purchased || 0,
        lifetimeUsed: data.lifetime_used || 0,
        isLoading: false,
        isAdmin: false,
      });
    } catch (error) {
      console.error('Error refreshing token balance:', error);
      setTokenBalance({ balance: 0, lifetimePurchased: 0, lifetimeUsed: 0, isLoading: false, isAdmin: false });
    }
  };

  useEffect(() => {
    refreshBalance();
  }, []);

  const checkAndWarn = (requiredTokens: number): boolean => {
    // Admins always pass - unlimited tokens
    if (tokenBalance.isAdmin) {
      return true;
    }

    if (tokenBalance.balance < requiredTokens) {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${requiredTokens} tokens but only have ${tokenBalance.balance}. Please purchase more tokens to continue.`,
        variant: "destructive",
      });
      return false;
    }

    // Warn if getting low
    if (tokenBalance.balance < requiredTokens * 2) {
      toast({
        title: "Low Token Balance",
        description: `You have ${tokenBalance.balance} tokens remaining. Consider purchasing more soon.`,
      });
    }

    return true;
  };

  return {
    ...tokenBalance,
    refreshBalance,
    checkAndWarn,
  };
}

/**
 * Token cost calculator (frontend version matching backend)
 */
export const TOKEN_COSTS = {
  image_generation: {
    'flux-schnell': 1,
    'flux-dev': 3,
    'flux-redux': 1,
    'flux-1.1-pro': 4,
    'flux-1.1-pro-ultra': 6,
    'flux-pro-1.1-8k': 8,
    'default': 1,
  },
  openai_image: {
    'dall-e-3-1024': 4,
    'dall-e-3-1792-hd': 8,
    'dall-e-3-1024-hd': 8,
    'dall-e-3-512': 2,
    'default': 4,
  },
  voice_generation: {
    'per_1000_chars': 1,
    'default': 1,
  },
  video_generation: {
    'omni-human': 8,
    'synthesys-wav2lip': 4,
    'sadtalker': 5,
    'liveportrait': 6,
    'stable-video': 2,
    'default': 5,
  },
  premium_video: {
    'kling-motion': 16,
    'heygen-talking-photo': 75,
    'default': 75,
  },
  style_transfer: {
    'basic': 2,
    'advanced': 4,
    'default': 2,
  },
  avatar_generation: {
    'basic': 2,
    'realistic': 5,
    'default': 2,
  },
} as const;

export function calculateTokenCost(
  resourceType: keyof typeof TOKEN_COSTS,
  model?: string,
  quantity: number = 1
): number {
  const costs = TOKEN_COSTS[resourceType] as Record<string, number>;
  
  if (!costs) {
    console.warn(`Unknown resource type: ${resourceType}`);
    return 1;
  }
  
  const unitCost = model && costs[model] ? costs[model] : costs['default'];
  return Math.ceil(unitCost * quantity);
}

export function getTokenCostInfo(
  resourceType: keyof typeof TOKEN_COSTS,
  model?: string
): TokenCostInfo {
  const tokens = calculateTokenCost(resourceType, model);
  
  const descriptions: Record<string, string> = {
    'image_generation': 'AI Image Generation',
    'openai_image': 'DALL-E Image',
    'voice_generation': 'Voice Generation (per 1000 chars)',
    'video_generation': 'AI Video Generation',
    'premium_video': 'Premium Video (HeyGen/Kling)',
    'style_transfer': 'Style Transfer',
    'avatar_generation': 'Avatar Generation',
  };
  
  return {
    tokens,
    description: descriptions[resourceType] || 'Operation',
  };
}
