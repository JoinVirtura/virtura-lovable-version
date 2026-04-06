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
    // Google Gemini
    'gemini-image-gen': 1,        // $0.003 - text-to-image
    'gemini-image-edit': 2,       // $0.005 - image editing with reference
    // fal.ai models
    'fal-flux-schnell': 1,        // $0.003
    'fal-flux-dev': 3,            // $0.025
    'fal-flux-kontext': 4,        // $0.04
    'fal-recraft-v4': 4,          // $0.04
    'fal-nano-banana-2': 4,       // $0.04
    'fal-qwen-image': 2,          // $0.02
    'fal-seedream-v4': 3,         // $0.03
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
    // fal.ai video models
    'fal-kling-v3-pro': 8,        // $0.112/sec × 5s ≈ $0.56
    'fal-kling-v2.5-turbo': 5,    // $0.07/sec × 5s ≈ $0.35
    'fal-wan-2.7': 3,             // $0.05/sec × 5s ≈ $0.25
    'fal-kling-v3-pro-t2v': 8,    // $0.112/sec × 5s
    'fal-wan-2.7-t2v': 3,         // $0.05/sec × 5s
    'fal-seedance-2': 7,          // $0.10/sec × 5s ≈ $0.50
    'fal-pixverse-v6': 5,         // $0.07/sec × 5s ≈ $0.35
    'default': 5,
  },
  
  // Premium Video (High Cost)
  premium_video: {
    'kling-motion': 16,           // $0.16 - avoid loss
    'heygen-talking-photo': 75,   // $1.93/min - 75 tokens = 83% profit margin
    'default': 75,
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
 * Aligned with landing page pricing: $29/$129/$349
 * Generations: 120/700/2200
 */
export const TOKEN_PRICING = {
  starter: {
    subscription: 120,      // 120 generations per month for $29
    price: 29,
    costPerToken: 0.24,     // $29 / 120 = $0.24 per generation
  },
  pro: {
    subscription: 700,      // 700 generations per month for $129
    price: 129,
    costPerToken: 0.18,     // $129 / 700 = $0.18 per generation
  },
  enterprise: {
    subscription: 2200,     // 2200 generations per month for $349
    price: 349,
    costPerToken: 0.16,     // $349 / 2200 = $0.16 per generation
  },
  packs: {
    50: { price: 7.50, costPerToken: 0.15 },
    100: { price: 15, costPerToken: 0.15 },
    250: { price: 37.50, costPerToken: 0.15 },
    500: { price: 75, costPerToken: 0.15 },
    1000: { price: 150, costPerToken: 0.15 },
  },
} as const;

/**
 * Get token allocation for a subscription plan
 */
export function getSubscriptionTokens(plan: string): number {
  const planTokens: Record<string, number> = {
    starter: 120,
    pro: 700,
    enterprise: 2200,
  };
  return planTokens[plan.toLowerCase()] || 120;
}
