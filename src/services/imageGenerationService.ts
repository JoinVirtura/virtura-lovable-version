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
      console.log('Generating image with params:', params);

      const contentType = params.contentType === 'auto' || !params.contentType 
        ? this.detectContentType(params.prompt) 
        : params.contentType;

      const quality = params.quality || 'balanced';
      const enhancedPrompt = this.enhancePromptForContentType(params.prompt, contentType, quality);

      // Get resolution dimensions
      const resolutionMap = {
        '512x512': { width: 512, height: 512 },
        '1024x1024': { width: 1024, height: 1024 },
        '1536x1536': { width: 1536, height: 1536 }
      };

      const resolution = params.resolution || '1024x1024';
      const dimensions = resolutionMap[resolution as keyof typeof resolutionMap];

      // Primary: Real Image Generation (FLUX) with enhanced quality parameters
      const realResp = await supabase.functions.invoke('generate-avatar-real', {
        body: {
          prompt: enhancedPrompt,
          negativePrompt: params.negativePrompt || "blurry, low quality, distorted, deformed, ugly, bad anatomy",
          contentType,
          style: params.style || 'photorealistic',
          quality: quality === 'ultra' ? '8K' : quality === 'balanced' ? '4K' : 'HD',
          resolution,
          width: dimensions.width,
          height: dimensions.height,
          adherence: params.adherence || (quality === 'ultra' ? 15.0 : 12.0),
          steps: params.steps || (quality === 'ultra' ? 100 : 50),
          enhance: params.enhance !== false, // Default to true for quality
          referenceImage: params.referenceImage,
          photoMode: true, // Enable professional photo mode
          selectedPreset: params.style || 'photorealistic'
        },
      });

      if (!realResp.error && realResp.data?.success) {
        console.log('Image generated successfully');
        return {
          success: true,
          image: realResp.data.image,
          prompt: enhancedPrompt,
          metadata: {
            contentType,
            style: params.style || 'photorealistic',
            resolution,
            processingTime: realResp.data.processingTime
          }
        };
      }

      // Fallback to OpenAI if FLUX fails
      if (realResp.error) {
        console.warn('Real function error, falling back to OpenAI:', realResp.error?.message);
      }

      const oaResp = await supabase.functions.invoke('generate-avatar', {
        body: {
          prompt: enhancedPrompt,
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