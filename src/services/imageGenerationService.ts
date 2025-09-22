import { supabase } from "@/integrations/supabase/client";

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  contentType?: 'portrait' | 'landscape' | 'object' | 'abstract' | 'scene' | 'auto';
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  resolution?: '512x512' | '1024x1024' | '1536x1536';
  quality?: 'speed' | 'balanced' | 'ultra';
  adherence?: number;
  steps?: number;
  enhance?: boolean;
  referenceImage?: string;
  variantType?: 'composition' | 'style' | 'lighting' | 'mood';
}

export interface GeneratedImage {
  success: boolean;
  image?: string;
  prompt?: string;
  error?: string;
  metadata?: {
    contentType: string;
    style: string;
    resolution: string;
    processingTime?: string;
  };
}

export class ImageGenerationService {
  private static detectContentType(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Portrait detection
    if (lowerPrompt.includes('portrait') || lowerPrompt.includes('person') || 
        lowerPrompt.includes('woman') || lowerPrompt.includes('man') || 
        lowerPrompt.includes('face') || lowerPrompt.includes('character')) {
      return 'portrait';
    }
    
    // Landscape detection
    if (lowerPrompt.includes('landscape') || lowerPrompt.includes('mountain') || 
        lowerPrompt.includes('ocean') || lowerPrompt.includes('forest') || 
        lowerPrompt.includes('scenery') || lowerPrompt.includes('nature')) {
      return 'landscape';
    }
    
    // Object detection
    if (lowerPrompt.includes('product') || lowerPrompt.includes('car') || 
        lowerPrompt.includes('building') || lowerPrompt.includes('architecture') ||
        lowerPrompt.includes('furniture') || lowerPrompt.includes('food')) {
      return 'object';
    }
    
    // Abstract detection
    if (lowerPrompt.includes('abstract') || lowerPrompt.includes('artistic') || 
        lowerPrompt.includes('surreal') || lowerPrompt.includes('concept')) {
      return 'abstract';
    }
    
    return 'scene';
  }

  private static enhancePromptForContentType(prompt: string, contentType: string, quality: string): string {
    const qualityEnhancements = {
      'speed': 'sharp focus, detailed',
      'balanced': 'ultra-sharp focus, highly detailed, professional quality',
      'ultra': 'ultra-sharp focus, hyperdetailed, photorealistic, professional photography, 8K resolution, masterpiece'
    };

    const contentEnhancements = {
      'portrait': 'perfect facial features, detailed skin texture, professional portrait lighting, sharp eyes',
      'landscape': 'atmospheric perspective, detailed environment, natural lighting, expansive view',
      'object': 'precise details, clean composition, studio lighting, product photography',
      'abstract': 'creative composition, artistic interpretation, dynamic colors',
      'scene': 'cinematic composition, environmental storytelling, atmospheric lighting'
    };

    const baseEnhancement = qualityEnhancements[quality as keyof typeof qualityEnhancements] || qualityEnhancements.balanced;
    const typeEnhancement = contentEnhancements[contentType as keyof typeof contentEnhancements] || contentEnhancements.scene;

    return `${prompt}, ${typeEnhancement}, ${baseEnhancement}`;
  }

  private static generateVariantPrompt(basePrompt: string, contentType: string, variantType: string, variantIndex: number): string {
    const variantModifiers = {
      'portrait': {
        'composition': ['close-up shot', 'three-quarter view', 'profile view'],
        'style': ['studio portrait', 'environmental portrait', 'dramatic portrait'],
        'lighting': ['soft lighting', 'dramatic lighting', 'natural lighting'],
        'mood': ['confident expression', 'serene expression', 'dynamic expression']
      },
      'landscape': {
        'composition': ['wide angle view', 'telephoto compression', 'aerial perspective'],
        'style': ['naturalistic', 'cinematic', 'minimalist'],
        'lighting': ['golden hour', 'blue hour', 'overcast lighting'],
        'mood': ['serene atmosphere', 'dramatic atmosphere', 'mysterious atmosphere']
      },
      'object': {
        'composition': ['centered composition', 'dynamic angle', 'macro detail'],
        'style': ['product photography', 'artistic styling', 'lifestyle context'],
        'lighting': ['studio lighting', 'natural lighting', 'dramatic lighting'],
        'mood': ['clean aesthetic', 'luxury feel', 'modern design']
      },
      'scene': {
        'composition': ['establishing shot', 'intimate scene', 'dynamic perspective'],
        'style': ['photorealistic', 'cinematic', 'artistic interpretation'],
        'lighting': ['natural lighting', 'dramatic lighting', 'ambient lighting'],
        'mood': ['peaceful scene', 'energetic scene', 'mysterious scene']
      }
    };

    const typeModifiers = variantModifiers[contentType as keyof typeof variantModifiers] || variantModifiers.scene;
    const modifier = typeModifiers[variantType as keyof typeof typeModifiers]?.[variantIndex] || '';
    
    return modifier ? `${basePrompt}, ${modifier}` : basePrompt;
  }

  static async generateImage(params: ImageGenerationParams): Promise<GeneratedImage> {
    try {
      console.log('Generating single perfect image with params:', params);

      const contentType = params.contentType === 'auto' || !params.contentType 
        ? this.detectContentType(params.prompt) 
        : params.contentType;

      const quality = params.quality || 'ultra';
      
      // Apply single-image optimization to prevent grids
      let optimizedPrompt = this.optimizeForSingleImage(params.prompt);
      
      if (params.enhance !== false) {
        optimizedPrompt = this.enhancePromptForContentType(optimizedPrompt, contentType, quality);
      }

      // Get resolution dimensions
      const resolutionMap = {
        '512x512': { width: 512, height: 512 },
        '1024x1024': { width: 1024, height: 1024 },
        '1536x1536': { width: 1536, height: 1536 }
      };

      const resolution = params.resolution || '1024x1024';
      const dimensions = resolutionMap[resolution as keyof typeof resolutionMap];

      // Primary: Real Image Generation (FLUX) with optimized parameters for single portraits
      const realResp = await supabase.functions.invoke('generate-avatar-real', {
        body: {
          prompt: optimizedPrompt,
          negativePrompt: params.negativePrompt || "grid, collage, multiple people, split screen, blurry, low quality, distorted, deformed, ugly, bad anatomy",
          contentType,
          style: params.style || 'photorealistic',
          quality: quality === 'ultra' ? '8K' : quality === 'balanced' ? '4K' : 'HD',
          resolution,
          width: dimensions.width,
          height: dimensions.height,
          adherence: params.adherence || (quality === 'ultra' ? 12.0 : 10.0),
          steps: params.steps || (quality === 'ultra' ? 50 : 35),
          enhance: params.enhance !== false,
          referenceImage: params.referenceImage,
          photoMode: true,
          selectedPreset: params.style || 'photorealistic'
        },
      });

      if (!realResp.error && realResp.data?.success) {
        console.log('Perfect image generated successfully');
        return {
          success: true,
          image: realResp.data.image,
          prompt: optimizedPrompt,
          metadata: {
            contentType,
            style: params.style || 'photorealistic',
            resolution,
            processingTime: realResp.data.metadata?.processingTime || '30s'
          }
        };
      }

      // Fallback to OpenAI if FLUX fails
      if (realResp.error) {
        console.warn('Real function error, falling back to OpenAI:', realResp.error?.message);
      }

      const oaResp = await supabase.functions.invoke('generate-avatar', {
        body: {
          prompt: optimizedPrompt,
          ...params
        },
      });

      if (oaResp.error) {
        throw new Error(oaResp.error.message);
      }

      if (!oaResp.data?.success) {
        throw new Error(oaResp.data?.error || 'Generation failed');
      }

      return {
        ...oaResp.data,
        metadata: {
          contentType,
          style: params.style || 'photorealistic',
          resolution
        }
      } as GeneratedImage;

    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Enhanced prompt interpretation to preserve essential details while preventing grids
  private static optimizeForSingleImage(prompt: string): string {
    console.log('🔍 Original prompt:', prompt);
    
    let optimized = prompt;
    
    // Step 1: Extract core subject information (preserve these!)
    const subjectDetails = this.extractSubjectDetails(optimized);
    console.log('👤 Extracted subject details:', subjectDetails);
    
    // Step 2: Parse and intelligently select from multi-options
    const resolvedOptions = this.resolveMultiOptions(optimized);
    console.log('🎯 Resolved options:', resolvedOptions);
    
    // Step 3: Build structured prompt with preserved details
    optimized = this.buildStructuredPrompt(subjectDetails, resolvedOptions);
    
    // Step 4: Add quality amplification and anti-grid reinforcement
    optimized = this.addQualityAmplification(optimized);
    
    console.log('✅ Final optimized prompt:', optimized);
    return optimized;
  }

  private static extractSubjectDetails(prompt: string): any {
    const details: any = {};
    
    // Extract ethnicity/heritage
    const ethnicityMatch = prompt.match(/(German-American|African-American|Asian|Latino|European|mixed heritage|multiracial).*?woman/i);
    details.ethnicity = ethnicityMatch ? ethnicityMatch[1] : 'woman';
    
    // Extract skin tone specifics
    const skinMatch = prompt.match(/(light|medium|dark|olive|warm|cool).*?skin/i);
    details.skinTone = skinMatch ? skinMatch[0] : 'natural skin tone';
    
    // Extract eye details
    const eyeMatch = prompt.match(/(brown|blue|green|hazel|amber).*?eyes?/i);
    details.eyes = eyeMatch ? eyeMatch[0] : 'expressive eyes';
    
    // Extract face shape and features
    const faceMatch = prompt.match(/(oval|round|square|heart|diamond).*?face/i);
    details.faceShape = faceMatch ? faceMatch[0] : 'elegant face';
    
    // Extract specific features mentioned
    const featuresMatch = prompt.match(/(full lips|softly arched brows|elegant cheekbones|radiant smile)/gi);
    details.features = featuresMatch ? featuresMatch.join(', ') : 'natural features';
    
    // Extract age or age-related descriptors
    const ageMatch = prompt.match(/(\d{2}.*?year.*?old|young|mature|middle-aged)/i);
    details.age = ageMatch ? ageMatch[0] : '';
    
    return details;
  }

  private static resolveMultiOptions(prompt: string): any {
    const resolved: any = {};
    
    // Smart hairstyle resolution
    const hairstyles = [
      'long neat braids pulled back with center part',
      'voluminous curly updo with bangs', 
      'large fluffy afro with natural texture',
      'big rounded afro curls'
    ];
    
    const outfits = [
      'glamorous black lace dress with plunging neckline and long silver earrings',
      'strapless black gown with dazzling silver diamond choker necklace and emerald accents',
      'casual white tank top with large gold hoop earrings and layered necklaces',
      'bold dark tactical-style outfit with simple cord necklace'
    ];
    
    const backgrounds = [
      'dark blurred cinematic backdrop of premiere',
      'golden award-show stage with geometric light décor',
      'casual outdoor neutral wall in daylight',
      'textured industrial grey wall'
    ];
    
    // Select options that maintain coherence
    const selectedIndex = Math.floor(Math.random() * Math.min(hairstyles.length, outfits.length, backgrounds.length));
    
    resolved.hairstyle = hairstyles[selectedIndex] || hairstyles[0];
    resolved.outfit = outfits[selectedIndex] || outfits[0];
    resolved.background = backgrounds[selectedIndex] || backgrounds[0];
    
    return resolved;
  }

  private static buildStructuredPrompt(subjectDetails: any, resolvedOptions: any): string {
    // Priority structure: Core subject → Physical features → Styling → Environment
    const parts = [
      'Professional portrait photography, single subject only, individual headshot, one person',
      'no grid layout, no collage, no multiple images, no split screen',
      
      // Core subject with preserved ethnicity and features
      `A stunning ${subjectDetails.ethnicity} with ${subjectDetails.skinTone}, ${subjectDetails.eyes}, and ${subjectDetails.faceShape}`,
      subjectDetails.features ? `featuring ${subjectDetails.features}` : '',
      subjectDetails.age ? `${subjectDetails.age}` : '',
      
      // Amplified styling details
      `hair styled in ${resolvedOptions.hairstyle}`,
      `wearing ${resolvedOptions.outfit}`,
      
      // Environmental context
      `photographed against ${resolvedOptions.background}`,
      
      // Quality reinforcement
      'perfect facial features, detailed skin texture, professional portrait lighting',
      'sharp eyes, ultra-sharp focus, hyperdetailed, photorealistic',
      'professional photography, 8K resolution, masterpiece'
    ];
    
    return parts.filter(part => part.trim().length > 0).join(', ');
  }

  private static addQualityAmplification(prompt: string): string {
    const qualityTerms = [
      'professional portrait, perfect facial features, detailed skin texture',
      'studio lighting, sharp eyes, hyperrealistic, photorealistic, ultra-detailed',
      'lifelike, professional photography, ultra-sharp focus, 8K resolution',
      'masterpiece quality, professional grade, advanced post-processing',
      'professional retouching, color correction, perfect exposure',
      'enhanced clarity, ultra-sharp focus, premium quality',
      'professional headshot studio setup, perfect lighting setup',
      'high-end camera equipment, professional photographer, commercial quality'
    ];
    
    const negativeTerms = [
      'grid, collage, multiple people, split screen, composite image, montage',
      'multiple faces, multiple portraits, side by side, comparison',
      'before and after, panel layout, comic strip, storyboard',
      'multiple versions, variations, different styles, multiple angles',
      'multiple poses, contact sheet, photo strip, tiled layout, mosaic',
      'blurry, low quality, distorted, deformed, ugly, bad anatomy',
      'bad proportions, extra limbs, cloned face, disfigured',
      'gross proportions, malformed limbs, missing arms, missing legs',
      'extra arms, extra legs, mutated hands, poorly drawn hands',
      'poorly drawn face, mutation, deformed face, long neck, cropped',
      'worst quality, jpeg artifacts, watermark, signature, text, logo',
      'cartoon, painting, illustration, monochrome, zombie, overexposure'
    ];
    
    return `${prompt} [NEGATIVE: ${negativeTerms.join(', ')}]`;
  }

  static async generateVariants(basePrompt: string, params: ImageGenerationParams, count: number = 3): Promise<GeneratedImage[]> {
    const contentType = params.contentType === 'auto' || !params.contentType 
      ? this.detectContentType(basePrompt) 
      : params.contentType;

    // Quality anchor - core elements that must be preserved
    const qualityAnchor = 'ultra-realistic, professional photography, sharp focus, high quality, detailed, 8K resolution';
    
    // Sequential generation with strategic delays for quality preservation
    const results: GeneratedImage[] = [];
    
    // Variant configurations for Urban fashion scenario
    const variantConfigs = [
      {
        name: 'Original Enhanced',
        modifier: `${qualityAnchor}, cinematic lighting, editorial style`,
        delay: 0
      },
      {
        name: 'Different Angle',
        modifier: `${qualityAnchor}, low angle shot, dramatic perspective, urban atmosphere`,
        delay: 2000
      },
      {
        name: 'Different Lighting',
        modifier: `${qualityAnchor}, golden hour lighting, warm tones, atmospheric mood`,
        delay: 4000
      }
    ];

    for (let i = 0; i < Math.min(count, variantConfigs.length); i++) {
      const config = variantConfigs[i];
      
      // Add strategic delay to prevent server overload
      if (config.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
      
      const variantPrompt = `${basePrompt}, ${config.modifier}`;
      
      try {
        console.log(`Generating variant ${i + 1}: ${config.name}`);
        const result = await this.generateImage({
          ...params,
          prompt: variantPrompt,
          contentType: contentType as any,
          enhance: true, // Force enhancement for quality
          quality: 'ultra' // Force ultra quality
        });
        
        results.push(result);
        
        if (!result.success) {
          console.warn(`Variant ${i + 1} failed, but continuing...`);
        }
      } catch (error) {
        console.error(`Error generating variant ${i + 1}:`, error);
        results.push({
          success: false,
          error: `Variant ${i + 1} generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return results;
  }

  static async generateThreeVariants(
    basePrompt: string, 
    params: ImageGenerationParams,
    onProgress?: (variantIndex: number, progress: number, stage: string) => void
  ): Promise<GeneratedImage[]> {
    const results: GeneratedImage[] = [];
    
    // Parse the prompt to extract different elements
    const { parsedElements, focusedPrompts } = this.parseComplexPrompt(basePrompt);
    
    for (let i = 0; i < 3; i++) {
      try {
        onProgress?.(i, 10, 'Starting generation...');
        
        // Use focused prompts to avoid grid generation
        const focusedPrompt = focusedPrompts[i] || parsedElements.baseDescription;
        
        onProgress?.(i, 50, 'Generating image...');
        
        const result = await this.generateImage({
          ...params,
          prompt: focusedPrompt,
          enhance: true,
          quality: 'ultra'
        });
        
        onProgress?.(i, 100, 'Complete!');
        results.push(result);
        
      } catch (error) {
        console.error(`Error generating variant ${i + 1}:`, error);
        results.push({
          success: false,
          error: `Variant ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        onProgress?.(i, 100, 'Failed');
      }
    }
    
    return results;
  }

  private static parseComplexPrompt(prompt: string): { parsedElements: any; focusedPrompts: string[] } {
    // Extract base description (everything before the first list or option)
    const baseMatch = prompt.match(/^([^*•\n]+?)(?=\n|\*|•|either|both)/i);
    const baseDescription = baseMatch ? baseMatch[1].trim() : prompt.split('.')[0];
    
    // Extract hairstyles
    const hairstyleMatches = prompt.match(/\* ([^,\n]+(?:braids|hair|afro|curls|updo)[^,\n]*)/gi) || [];
    const hairstyles = hairstyleMatches.map(m => m.replace(/^\* /, '').trim());
    
    // Extract outfits
    const outfitMatches = prompt.match(/\* ([^,\n]*(?:dress|gown|outfit|top)[^,\n]*)/gi) || [];
    const outfits = outfitMatches.map(m => m.replace(/^\* /, '').trim());
    
    // Extract backgrounds
    const backgroundMatches = prompt.match(/\* ([^,\n]*(?:backdrop|background|stage|wall)[^,\n]*)/gi) || [];
    const backgrounds = backgroundMatches.map(m => m.replace(/^\* /, '').trim());
    
    // Create 3 focused prompts by combining one element from each category
    const focusedPrompts = [];
    
    for (let i = 0; i < 3; i++) {
      let focused = baseDescription;
      
      if (hairstyles.length > 0) {
        const hairstyle = hairstyles[i % hairstyles.length];
        focused += `, ${hairstyle}`;
      }
      
      if (outfits.length > 0) {
        const outfit = outfits[i % outfits.length];
        focused += `, wearing ${outfit}`;
      }
      
      if (backgrounds.length > 0) {
        const background = backgrounds[i % backgrounds.length];
        focused += `, ${background}`;
      }
      
      focused += ', professional portrait photography, ultra-realistic, single person, individual headshot, no grid, no collage';
      focusedPrompts.push(focused);
    }
    
    return {
      parsedElements: { baseDescription, hairstyles, outfits, backgrounds },
      focusedPrompts
    };
  }
}