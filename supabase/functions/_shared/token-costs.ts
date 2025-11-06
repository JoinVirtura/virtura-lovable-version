/**
 * Token cost definitions for all operations
 * 1 token = 1 basic operation
 * Premium operations cost multiple tokens based on actual API cost
 */

export const TOKEN_COSTS = {
  // Image Generation (Replicate)
  image_generation: {
    'flux-schnell': 1,           // $0.003 - most cost effective
    'flux-dev': 3,                // $0.025
    'flux-redux': 1,              // $0.003
    'flux-1.1-pro': 4,            // $0.04
    'flux-1.1-pro-ultra': 6,      // $0.06
    'flux-pro-1.1-8k': 8,         // $0.08
    'default': 1,                 // Default for basic operations
  },
  
  // OpenAI Image Generation
  openai_image: {
    'dall-e-3-1024': 4,           // $0.04
    'dall-e-3-1792-hd': 8,        // $0.08
    'dall-e-3-1024-hd': 8,        // $0.08
    'dall-e-3-512': 2,            // $0.02
    'default': 4,
  },
  
  // Voice Generation (ElevenLabs)
  voice_generation: {
    'per_1000_chars': 1,          // $0.00018/1K chars - 1 token per 1000 chars
    'eleven_multilingual_v2': 1,
    'eleven_monolingual_v1': 1,
    'eleven_turbo_v2': 1,
    'default': 1,
  },
  
  // Video Generation (Replicate)
  video_generation: {
    'omni-human': 8,              // $0.08
    'synthesys-wav2lip': 4,       // $0.035
    'sadtalker': 5,               // $0.05
    'liveportrait': 6,            // $0.06
    'stable-video': 2,            // $0.024
    'default': 5,
  },
  
  // Premium Video (High Cost)
  premium_video: {
    'kling-motion': 16,           // $0.16 - avoid loss
    'heygen-talking-photo': 20,   // $1.93/min - VERY expensive, 20 tokens minimum
    'default': 20,
  },
  
  // Style Transfer
  style_transfer: {
    'basic': 2,                   // Basic style transfer
    'advanced': 4,                // Advanced with enhancements
    'default': 2,
  },
  
  // Avatar Generation
  avatar_generation: {
    'basic': 2,                   // Simple avatar
    'realistic': 5,               // Realistic avatar with processing
    'default': 2,
  },
  
  // Storage (per GB per month)
  storage: {
    'per_gb': 1,                  // 1 token per GB
    'default': 1,
  },
} as const;

/**
 * Calculate token cost for a specific operation
 */
export function calculateTokenCost(
  resourceType: keyof typeof TOKEN_COSTS,
  model?: string,
  quantity: number = 1
): number {
  const costs = TOKEN_COSTS[resourceType] as Record<string, number>;
  
  if (!costs) {
    console.warn(`Unknown resource type: ${resourceType}`);
    return 1; // Default to 1 token
  }
  
  const unitCost = model && costs[model] ? costs[model] : costs['default'];
  return Math.ceil(unitCost * quantity);
}

/**
 * Get token cost info for display to users
 */
export function getTokenCostInfo(
  resourceType: keyof typeof TOKEN_COSTS,
  model?: string
): { tokens: number; description: string } {
  const tokens = calculateTokenCost(resourceType, model);
  
  const descriptions: Record<string, string> = {
    'image_generation': 'Generate AI image',
    'openai_image': 'Generate DALL-E image',
    'voice_generation': 'Generate voice audio (per 1000 characters)',
    'video_generation': 'Generate AI video',
    'premium_video': 'Premium video generation',
    'style_transfer': 'Apply style transfer',
    'avatar_generation': 'Generate avatar',
    'storage': 'Storage (per GB/month)',
  };
  
  return {
    tokens,
    description: descriptions[resourceType] || 'Operation',
  };
}

/**
 * Token pricing for purchases (in USD)
 */
export const TOKEN_PRICING = {
  individual: {
    subscription: 200,      // 200 tokens per month for $20
    price: 20,
    costPerToken: 0.10,
  },
  pro: {
    subscription: 1000,     // 1000 tokens per month for $99
    price: 99,
    costPerToken: 0.099,
  },
  enterprise: {
    subscription: 3000,     // 3000 tokens per month for $299
    price: 299,
    costPerToken: 0.0997,
  },
  packs: {
    50: { price: 7.50, costPerToken: 0.15 },
    100: { price: 15, costPerToken: 0.15 },
    250: { price: 37.50, costPerToken: 0.15 },
    500: { price: 75, costPerToken: 0.15 },
    1000: { price: 150, costPerToken: 0.15 },
  },
} as const;
