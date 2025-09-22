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
    
    // PRESERVE user's exact specifications - don't override them
    console.log('🔍 Parsing user prompt for preservation...');
    
    // Enhanced ethnicity and heritage extraction with multiple patterns
    const ethnicityPatterns = [
      // Pattern for "German-American woman", "Italian-Brazilian man", etc.
      /(?:stunning\s+|beautiful\s+)?([A-Z][a-z]+-[A-Z][a-z]+)\s+(?:woman|man|person)/gi,
      // Pattern for single ethnicity "German woman", "Italian man"
      /(?:stunning\s+|beautiful\s+)?([A-Z][a-z]+)\s+(?:woman|man|person)/gi,
      // Pattern for heritage descriptors
      /(?:of\s+)?([A-Z][a-z]+-?[A-Z]?[a-z]*)\s+(?:heritage|descent|ancestry|background)/gi,
      // Pattern for ethnicity labels
      /(?:ethnicity|heritage|ancestry):\s*([^,\n]+)/gi
    ];
    
    let ethnicityFound = '';
    for (const pattern of ethnicityPatterns) {
      const matches = [...prompt.matchAll(pattern)];
      for (const match of matches) {
        if (match && match[1]) {
          ethnicityFound = match[1].trim();
          break;
        }
      }
      if (ethnicityFound) break;
    }
    
    // Extract skin tone with enhanced precision
    const skinTonePatterns = [
      /(?:with\s+)?([a-z]+-?[a-z]*-?[a-z]*)\s+(?:skin|complexion|tone)/gi,
      /skin\s+(?:tone|color):\s*([^,\n]+)/gi
    ];
    
    let skinToneFound = '';
    for (const pattern of skinTonePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        skinToneFound = match[1].trim();
        break;
      }
    }
    
    // Extract core subject identity (preserve exact wording with ethnicity amplification)
    const subjectMatch = prompt.match(/(A stunning [^.,]+)/i);
    let subject = subjectMatch ? subjectMatch[1] : 'A stunning woman';
    
    // Amplify ethnicity in subject if found
    if (ethnicityFound && subject) {
      details.ethnicity = ethnicityFound;
      details.heritage = ethnicityFound;
      // Ensure ethnicity is strongly emphasized in subject description
      subject = subject.replace(ethnicityFound, `${ethnicityFound} heritage ${ethnicityFound}`);
    }
    details.subject = subject;
    
    // Store skin tone for amplification
    if (skinToneFound) {
      details.skinTone = skinToneFound;
    }
    
    // Extract physical descriptions (preserve user's specific terms)
    const physicalDescMatch = prompt.match(/(with [^.]+\.)/gi);
    details.physicalDescription = physicalDescMatch ? physicalDescMatch.join(' ') : '';
    
    // Extract specific facial features (preserve exact terminology)
    const featuresMatch = prompt.match(/(full lips|softly arched brows|elegant cheekbones|radiant smile|white teeth|expressive eyes)[^.,]*/gi);
    details.specificFeatures = featuresMatch ? featuresMatch : [];
    
    // Extract structured sections (hairstyle, outfit, makeup, background)
    const hairstyleMatch = prompt.match(/hairstyle:\s*\*\s*([^,\n]*)/i) || prompt.match(/hair styled in ([^,\n]*)/i);
    details.userHairstyle = hairstyleMatch ? hairstyleMatch[1].trim() : null;
    
    const outfitMatch = prompt.match(/styled [^:]*:\s*\*\s*([^,\n]*)/i) || prompt.match(/wearing ([^,\n]*)/i);
    details.userOutfit = outfitMatch ? outfitMatch[1].trim() : null;
    
    const backgroundMatch = prompt.match(/Background:\s*\*\s*([^,\n]*)/i);
    details.userBackground = backgroundMatch ? backgroundMatch[1].trim() : null;
    
    const makeupMatch = prompt.match(/Makeup is ([^.]*)/i);
    details.makeup = makeupMatch ? makeupMatch[1].trim() : null;
    
    console.log('📝 Preserved user details with ethnicity amplification:', details);
    return details;
  }

  private static resolveMultiOptions(prompt: string): any {
    const resolved: any = {};
    
    // INTELLIGENT RESOLUTION: Only select when user provides multiple options or no specific choice
    console.log('🎯 Intelligently resolving options based on user input...');
    
    // Detect if user provided multiple hairstyle options (e.g., "either X or Y")
    if (prompt.includes('either') && prompt.includes('or') && prompt.toLowerCase().includes('hair')) {
      console.log('🔄 Multiple hairstyle options detected, selecting...');
      const options = prompt.match(/either ([^or]+) or ([^,.\n]+)/i);
      resolved.hairstyle = options ? (Math.random() > 0.5 ? options[1].trim() : options[2].trim()) : null;
    }
    
    // Same for outfits
    if (prompt.includes('either') && prompt.includes('or') && (prompt.includes('wearing') || prompt.includes('outfit'))) {
      console.log('🔄 Multiple outfit options detected, selecting...');
      const options = prompt.match(/either ([^or]+) or ([^,.\n]+)/i);
      resolved.outfit = options ? (Math.random() > 0.5 ? options[1].trim() : options[2].trim()) : null;
    }
    
    // Default backgrounds only if user doesn't specify
    if (!prompt.toLowerCase().includes('background') && !prompt.toLowerCase().includes('photographed against')) {
      const defaultBackgrounds = [
        'professional studio backdrop',
        'neutral background',
        'softly blurred background'
      ];
      resolved.background = defaultBackgrounds[Math.floor(Math.random() * defaultBackgrounds.length)];
      console.log('📷 No background specified, using default:', resolved.background);
    }
    
    console.log('✅ Resolution complete:', resolved);
    return resolved;
  }

  private static buildStructuredPrompt(subjectDetails: any, resolvedOptions: any): string {
    console.log('🏗️ Building structured prompt with preserved details...');
    
    const parts = [
      // Anti-grid reinforcement at the start
      'Professional portrait photography, single subject only, individual headshot, one person',
      'no grid layout, no collage, no multiple images, no split screen',
      
      // ETHNICITY-FIRST APPROACH: Lead with ethnicity/heritage for maximum impact
      subjectDetails.ethnicity ? `${subjectDetails.ethnicity} ethnicity, ${subjectDetails.heritage} heritage` : '',
      subjectDetails.skinTone ? `${subjectDetails.skinTone} skin tone, ${subjectDetails.skinTone} complexion` : '',
      
      // PRESERVE user's exact subject description with ethnicity reinforcement
      subjectDetails.subject,
      subjectDetails.physicalDescription,
      
      // Strategic ethnicity reinforcement mid-prompt
      subjectDetails.ethnicity ? `of ${subjectDetails.ethnicity} descent, ${subjectDetails.ethnicity} features` : '',
      
      // Add amplified specific features
      ...subjectDetails.specificFeatures.map((feature: string) => this.amplifyFeatureDetail(feature)),
      
      // PRESERVE user's styling choices with amplification
      subjectDetails.userHairstyle ? this.amplifyHairstyleDetail(subjectDetails.userHairstyle) : '',
      subjectDetails.userOutfit ? this.amplifyOutfitDetail(subjectDetails.userOutfit) : '',
      
      // Add makeup details if specified
      subjectDetails.makeup ? `${subjectDetails.makeup} makeup` : '',
      
      // PRESERVE user's background choice or use intelligent default
      subjectDetails.userBackground ? this.amplifyBackgroundDetail(subjectDetails.userBackground) : 
        (resolvedOptions.background ? `photographed against ${resolvedOptions.background}` : ''),
      
      // Technical quality amplification (non-overriding)
      'perfect facial features, detailed skin texture, professional portrait lighting',
      'sharp eyes, ultra-sharp focus, hyperdetailed, photorealistic',
      'professional photography, 8K resolution, masterpiece'
    ];
    
    const structured = parts.filter(part => part && part.trim().length > 0).join(', ');
    console.log('✅ Structured prompt built with ethnicity-first preservation');
    return structured;
  }
  
  // Detail amplification helpers that enhance rather than replace
  private static amplifyFeatureDetail(feature: string): string {
    const amplifications = {
      'full lips': 'full lips, perfectly shaped, natural fullness',
      'softly arched brows': 'softly arched brows, perfectly groomed, natural arch',
      'elegant cheekbones': 'elegant cheekbones, defined facial structure, sculpted',
      'radiant smile': 'radiant smile, genuine expression, beautiful teeth',
      'white teeth': 'white teeth, perfect smile, bright',
      'expressive eyes': 'expressive eyes, captivating gaze, detailed iris'
    };
    
    return amplifications[feature.toLowerCase()] || feature;
  }
  
  private static amplifyHairstyleDetail(hairstyle: string): string {
    // Enhance the user's specific hairstyle choice with supportive details
    if (hairstyle.includes('voluminous curly updo with bangs')) {
      return 'hair styled in voluminous curly updo with bangs, defined curls styled upward, face-framing bangs, voluminous texture, professional styling';
    }
    if (hairstyle.includes('large fluffy afro')) {
      return 'hair styled in large fluffy afro with natural texture, voluminous natural curls, soft texture, beautifully defined';
    }
    if (hairstyle.includes('braids')) {
      return `hair styled in ${hairstyle}, expertly braided, neat styling, professional look`;
    }
    
    return `hair styled in ${hairstyle}, perfectly styled, professional finish`;
  }
  
  private static amplifyOutfitDetail(outfit: string): string {
    // Enhance outfit with complementary styling details
    if (outfit.includes('casual white tank top')) {
      return 'wearing casual white tank top with large gold hoop earrings and layered necklaces, relaxed authentic style, perfect fit';
    }
    if (outfit.includes('black dress') || outfit.includes('gown')) {
      return `wearing ${outfit}, elegant styling, perfect fit, sophisticated look`;
    }
    
    return `wearing ${outfit}, perfectly fitted, styled elegantly`;
  }
  
  private static amplifyBackgroundDetail(background: string): string {
    // Enhance background with atmospheric details
    if (background.includes('casual outdoor neutral wall')) {
      return 'photographed against casual outdoor neutral wall in daylight, natural lighting, soft shadows, clean backdrop';
    }
    if (background.includes('studio')) {
      return `photographed against ${background}, professional lighting setup, controlled environment`;
    }
    
    return `photographed against ${background}, professional photography setup`;
  }

  private static addQualityAmplification(prompt: string): string {
    console.log('🎯 Adding quality amplification with anti-drift protection...');
    
    // Enhanced quality terms that reinforce user specifications
    const qualityTerms = [
      'professional portrait, perfect facial features, detailed skin texture',
      'studio lighting, sharp eyes, hyperrealistic, photorealistic, ultra-detailed',
      'lifelike, professional photography, ultra-sharp focus, 8K resolution',
      'masterpiece quality, professional grade, commercial photography',
      'enhanced clarity, perfect exposure, professional retouching',
      'high-end camera equipment, professional photographer setup'
    ];
    
    // Comprehensive negative terms to prevent ALL unwanted variations
    const negativeTerms = [
      // Anti-grid and multi-image prevention
      'grid, collage, multiple people, split screen, composite image, montage',
      'multiple faces, multiple portraits, side by side, comparison, before and after',
      'panel layout, comic strip, storyboard, multiple versions, variations',
      'different styles, multiple angles, multiple poses, contact sheet, photo strip',
      'tiled layout, mosaic, four-panel, grid layout, split image, divided image',
      
      // ENHANCED Feature drift prevention with ethnicity protection
      'different hairstyle, changed hair, wrong hair color, altered features',
      'different ethnicity, changed skin tone, wrong eye color, modified face',
      'wrong nationality, altered heritage, changed ethnicity, wrong ethnic features',
      'African features, Asian features, Caucasian drift, Latino drift, ethnic confusion',
      'wrong complexion, altered facial structure, changed bone structure',
      'different outfit, changed clothing, wrong accessories, altered style',
      'different background, changed setting, wrong environment',
      
      // Quality degradation prevention
      'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions',
      'extra limbs, cloned face, disfigured, gross proportions, malformed limbs',
      'missing arms, missing legs, extra arms, extra legs, mutated hands',
      'poorly drawn hands, poorly drawn face, mutation, deformed face, long neck',
      'cropped, worst quality, jpeg artifacts, watermark, signature, text, logo',
      'cartoon, painting, illustration, drawing, sketch, anime, animated',
      '(worst quality, low quality:1.4), monochrome, zombie, overexposure',
      
      // Technical artifacts prevention
      'watermark, text, bad anatomy, bad hand, extra hands, extra fingers',
      'too many fingers, fused fingers, bad arm, distorted arm, extra arms',
      'fused arms, extra legs, missing leg, disembodied leg, extra nipples',
      'detached arm, liquid hand, inverted hand, disembodied limb',
      'oversized head, extra body, completely nude, extra navel',
      'easynegative, (hair between eyes), sketch, duplicate, ugly, huge eyes',
      'worst face, (bad and mutated hands:1.3), (blurry:2.0), horror, geometry',
      'bad_prompt, (bad hands), (missing fingers), multiple limbs, bad anatomy',
      '(interlocked fingers:1.2), Ugly Fingers',
      '(extra digit and hands and fingers and legs and arms:1.4)',
      '((2girl)), (deformed fingers:1.2), (long fingers:1.2)',
      '(bad-artist-anime), bad-artist, bad hand, extra legs, nipples, nsfw'
    ];
    
    const enhancedPrompt = `${prompt}, ${qualityTerms.join(', ')}`;
    return `${enhancedPrompt} [NEGATIVE: ${negativeTerms.join(', ')}]`;
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