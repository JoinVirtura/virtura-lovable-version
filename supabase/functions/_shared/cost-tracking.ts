import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

/**
 * Tracks API usage cost in the database
 */
export async function trackApiCost(params: {
  userId: string;
  resourceType: 'image_generation' | 'voice_generation' | 'video_generation' | 'style_transfer';
  apiProvider: 'replicate' | 'elevenlabs' | 'heygen' | 'openai' | 'huggingface';
  modelUsed?: string;
  costUsd: number;
  tokensCharged?: number;
  metadata?: Record<string, any>;
}) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase.from('api_cost_tracking').insert({
    user_id: params.userId,
    resource_type: params.resourceType,
    api_provider: params.apiProvider,
    model_used: params.modelUsed || null,
    cost_usd: params.costUsd,
    tokens_charged: params.tokensCharged || 0,
    metadata: params.metadata || {},
  });

  if (error) {
    console.error('Failed to track API cost:', error);
  }
}

/**
 * Model cost definitions
 */
export const MODEL_COSTS = {
  // Replicate Image Generation
  replicate: {
    'flux-schnell': 0.003,
    'flux-dev': 0.025,
    'flux-1.1-pro': 0.04,
    'flux-1.1-pro-ultra': 0.06,
    'flux-pro-1.1-8k': 0.08,
    'flux-redux': 0.003,
  },
  
  // OpenAI
  openai: {
    'gpt-image-1-1024': 0.04,
    'gpt-image-1-1792-hd': 0.08,
    'gpt-image-1-1024-hd': 0.08,
    'gpt-image-1-512': 0.02,
  },
  
  // ElevenLabs Voice (per 1000 characters)
  elevenlabs: {
    'eleven_multilingual_v2': 0.18 / 1000, // Pay-as-you-go rate
    'eleven_monolingual_v1': 0.18 / 1000,
    'eleven_turbo_v2': 0.18 / 1000,
  },
  
  // Replicate Video Generation
  replicateVideo: {
    'omni-human': 0.08,
    'synthesys-wav2lip': 0.035,
    'sadtalker': 0.05,
    'liveportrait': 0.06,
    'kling-motion': 0.16,
    'stable-video': 0.024,
  },
  
  // HeyGen (approximate, per minute)
  heygen: {
    'talking-photo': 1.93,
  },
};

/**
 * Calculate cost for a specific model and usage
 */
export function calculateCost(
  provider: keyof typeof MODEL_COSTS,
  model: string,
  quantity: number = 1
): number {
  const costs = MODEL_COSTS[provider] as Record<string, number>;
  const unitCost = costs[model] || 0;
  return unitCost * quantity;
}
