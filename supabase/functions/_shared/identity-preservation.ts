/**
 * Shared Identity Preservation Module
 * Provides consistent identity preservation handling across all image generation functions
 */

// Keywords that indicate the user wants to modify their appearance while preserving identity
const MODIFICATION_KEYWORDS = [
  // Physical appearance changes
  'change', 'make', 'transform', 'add', 'remove', 'modify', 'edit', 'alter',
  // Hair modifications
  'blonde', 'brunette', 'redhead', 'bald', 'hair color', 'hairstyle', 'curly', 'straight', 'wavy',
  'short hair', 'long hair', 'bangs', 'dyed', 'highlights', 'silver hair', 'gray hair', 'pink hair',
  'blue hair', 'green hair', 'purple hair', 'black hair', 'brown hair', 'ginger',
  // Body modifications
  'fat', 'thin', 'muscular', 'skinny', 'chubby', 'slim', 'athletic', 'bulky', 'lean',
  'bigger', 'smaller', 'taller', 'shorter', 'wider', 'thinner', 'heavier', 'lighter',
  'belly', 'stomach', 'abs', 'arms', 'chest', 'shoulders',
  // Facial modifications
  'older', 'younger', 'beard', 'mustache', 'glasses', 'tattoo', 'freckles', 'dimples',
  'gold teeth', 'teeth', 'eyes', 'eyebrows', 'lips', 'nose', 'chin', 'jaw',
  'wrinkles', 'smooth skin', 'tan', 'pale', 'darker skin', 'lighter skin',
  // Clothing and accessories
  'clothing', 'outfit', 'wearing', 'dressed', 'costume', 'uniform', 'suit', 'dress',
  'hat', 'earrings', 'necklace', 'watch', 'ring', 'piercing',
  // Expressions
  'smile', 'smiling', 'grin', 'expression', 'laughing', 'serious', 'angry', 'sad',
  // Style modifications
  'makeup', 'lipstick', 'eyeliner', 'nail polish'
];

/**
 * Detect if the prompt indicates the user wants to modify their appearance
 * while preserving their identity
 */
export function detectModificationIntent(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  return MODIFICATION_KEYWORDS.some(keyword => lowerPrompt.includes(keyword));
}

/**
 * Build an identity-preserving prompt that strongly anchors facial features
 * while allowing specified modifications
 */
export function buildIdentityPreservingPrompt(userPrompt: string): string {
  return `CRITICAL IDENTITY PRESERVATION: Keep the EXACT same person - same face, same eyes, same nose, same mouth, same facial bone structure, same skin tone, same skin texture, same identity. ` +
    `The person's face and identity must be 100% recognizable and unchanged. ` +
    `Preserve all facial landmarks, proportions, and unique identifying features exactly as they are. ` +
    `ONLY modify what is specifically requested: ${userPrompt}. ` +
    `Do NOT change any facial features, face shape, eye shape, nose shape, lip shape, or identity characteristics. ` +
    `The result must look like the SAME EXACT PERSON with only the requested changes applied.`;
}

/**
 * Build a simplified identity preservation prompt for models that work better with shorter prompts
 */
export function buildSimpleIdentityPrompt(userPrompt: string): string {
  return `Same person, same face unchanged. Only modify: ${userPrompt}. Keep exact facial features and identity.`;
}

/**
 * Get model-specific parameters optimized for identity preservation
 */
export function getIdentityPreservationParams(model: string): {
  guidance_scale: number;
  prompt_strength?: number;
  num_inference_steps?: number;
} {
  switch (model) {
    case 'flux-kontext-pro':
    case 'black-forest-labs/flux-kontext-pro':
      return { 
        guidance_scale: 5.0,  // Higher for stricter prompt adherence
        num_inference_steps: 50 
      };
    
    case 'sdxl':
    case 'stability-ai/sdxl':
      return { 
        guidance_scale: 7.5, 
        prompt_strength: 0.55,  // Lower to preserve more of original
        num_inference_steps: 25 
      };
    
    case 'flux-redux':
    case 'flux-redux-schnell':
    case 'black-forest-labs/flux-redux-schnell':
      return { 
        guidance_scale: 4.0,
        num_inference_steps: 4 
      };
    
    case 'flux-schnell':
    case 'black-forest-labs/flux-schnell':
      return { 
        guidance_scale: 3.5,
        num_inference_steps: 4 
      };
    
    case 'flux-dev':
    case 'black-forest-labs/FLUX.1-dev':
      return { 
        guidance_scale: 15.0,  // High for strict adherence
        num_inference_steps: 25 
      };
    
    case 'dall-e-3':
    case 'gpt-image-1':
      return { 
        guidance_scale: 7.0 
      };
    
    default:
      return { 
        guidance_scale: 5.0,
        num_inference_steps: 25 
      };
  }
}

/**
 * Enhance a style transfer prompt to preserve identity while applying style
 */
export function buildIdentityPreservingStylePrompt(stylePrompt: string): string {
  return `Maintain the exact same person's face, identity, and all facial features unchanged. ` +
    `Apply the following style while preserving the subject's identity: ${stylePrompt}. ` +
    `The face and identity must remain 100% recognizable.`;
}

/**
 * Check if identity preservation should be automatically enabled
 * based on the presence of a reference image and modification intent
 */
export function shouldPreserveIdentity(
  hasReferenceImage: boolean,
  prompt: string,
  explicitPreserveIdentity?: boolean
): boolean {
  // If explicitly set, use that value
  if (typeof explicitPreserveIdentity === 'boolean') {
    return explicitPreserveIdentity;
  }
  
  // Auto-enable if there's a reference image and modification intent
  if (hasReferenceImage && detectModificationIntent(prompt)) {
    return true;
  }
  
  return false;
}

/**
 * Get the appropriate model for identity-preserving edits
 * Returns the best model choice based on the type of edit requested
 */
export function getIdentityPreservingModel(
  prompt: string,
  defaultModel: string
): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // For body/physique changes, FLUX Kontext Pro is best
  const bodyKeywords = ['fat', 'thin', 'muscular', 'skinny', 'chubby', 'slim', 'athletic', 'belly', 'body'];
  if (bodyKeywords.some(k => lowerPrompt.includes(k))) {
    return 'black-forest-labs/flux-kontext-pro';
  }
  
  // For hair changes, FLUX Kontext Pro is best
  const hairKeywords = ['hair', 'blonde', 'brunette', 'redhead', 'bald'];
  if (hairKeywords.some(k => lowerPrompt.includes(k))) {
    return 'black-forest-labs/flux-kontext-pro';
  }
  
  // For facial additions (glasses, beard, etc.), FLUX Kontext Pro
  const facialAdditions = ['glasses', 'beard', 'mustache', 'tattoo', 'piercing'];
  if (facialAdditions.some(k => lowerPrompt.includes(k))) {
    return 'black-forest-labs/flux-kontext-pro';
  }
  
  return defaultModel;
}

console.log('🔒 Identity preservation module loaded');
