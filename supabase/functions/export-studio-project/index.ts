import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      projectId, 
      videoUrl, 
      pack, 
      aspectRatios, 
      contentCredentials, 
      sourceVideo 
    } = await req.json();
    
    console.log('📤 Export: Starting...');
    console.log('Project ID:', projectId);
    console.log('Video URL:', videoUrl);
    console.log('Pack:', pack);
    console.log('Aspect Ratios:', aspectRatios);
    console.log('Source Dimensions:', sourceVideo);

    if (!videoUrl || !aspectRatios || aspectRatios.length === 0) {
      throw new Error('Missing required fields: videoUrl and aspectRatios');
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!REPLICATE_API_KEY) throw new Error('REPLICATE_API_KEY not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const processedVideos = [];
    
    // Calculate source ratio
    const sourceRatio = `${Math.round(sourceVideo.width / Math.gcd(sourceVideo.width, sourceVideo.height))}:${Math.round(sourceVideo.height / Math.gcd(sourceVideo.width, sourceVideo.height))}`;
    console.log('Source ratio:', sourceRatio);

    // Helper to calculate GCD for ratio calculation
    Math.gcd = function(a: number, b: number): number {
      return b ? Math.gcd(b, a % b) : a;
    };

    // Process each aspect ratio
    for (const ratio of aspectRatios) {
      console.log(`Processing ${ratio}...`);
      
      try {
        const targetDims = getTargetDimensions(ratio);
        
        // Check if this is already the native ratio
        const isNative = ratio === sourceRatio || 
                         (ratio === '16:9' && sourceVideo.width === 1920 && sourceVideo.height === 1080) ||
                         (ratio === '9:16' && sourceVideo.width === 1080 && sourceVideo.height === 1920) ||
                         (ratio === '1:1' && sourceVideo.width === 1080 && sourceVideo.height === 1080) ||
                         (ratio === '4:5' && sourceVideo.width === 1080 && sourceVideo.height === 1350);
        
        if (isNative) {
          console.log(`✅ Skipping ${ratio} (already native)`);
          
          let finalUrl = videoUrl;
          
          // Add watermark if requested
          if (contentCredentials) {
            console.log('Adding watermark to native video...');
            const watermarked = await replicate.run(
              "victor-upmeet/ffmpeg-basic",
              {
                input: {
                  video_url: videoUrl,
                  operation: "overlay_text",
                  text: "AI Generated",
                  font_size: 36,
                  font_color: "white@0.7",
                  position: "bottom_right",
                  padding: 20
                }
              }
            );
            
            const watermarkedUrl = Array.isArray(watermarked) ? watermarked[0] : watermarked;
            
            // Download and upload watermarked video
            const response = await fetch(watermarkedUrl);
            const blob = await response.blob();
            const buffer = await blob.arrayBuffer();
            
            const fileName = `exports/${projectId}/${ratio.replace(':', '-')}_native_${Date.now()}.mp4`;
            const { error: uploadError } = await supabase.storage
              .from('virtura-media')
              .upload(fileName, buffer, {
                contentType: 'video/mp4',
                upsert: true
              });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from('virtura-media')
              .getPublicUrl(fileName);
            
            finalUrl = urlData.publicUrl;
          }
          
          processedVideos.push({
            aspectRatio: ratio,
            url: finalUrl,
            width: sourceVideo.width,
            height: sourceVideo.height,
            size: 'Original',
            isNative: true
          });
          continue;
        }

        // Use FFmpeg for smart cropping and resizing
        console.log(`Cropping to ${targetDims.width}x${targetDims.height}...`);
        
        const output = await replicate.run(
          "victor-upmeet/ffmpeg-basic",
          {
            input: {
              video_url: videoUrl,
              operation: "crop_and_scale",
              width: targetDims.width,
              height: targetDims.height,
              crop_mode: "smart", // Smart center-crop
              scale_mode: "lanczos" // High quality scaling
            }
          }
        );

        let processedVideoUrl = Array.isArray(output) ? output[0] : output;
        
        // Add watermark if enabled
        if (contentCredentials) {
          console.log('Adding watermark...');
          const watermarked = await replicate.run(
            "victor-upmeet/ffmpeg-basic",
            {
              input: {
                video_url: processedVideoUrl,
                operation: "overlay_text",
                text: "AI Generated",
                font_size: 36,
                font_color: "white@0.7",
                position: "bottom_right",
                padding: 20
              }
            }
          );
          processedVideoUrl = Array.isArray(watermarked) ? watermarked[0] : watermarked;
        }

        // Download processed video
        const videoResponse = await fetch(processedVideoUrl);
        const videoBlob = await videoResponse.blob();
        const videoBuffer = await videoBlob.arrayBuffer();
        
        // Upload to Supabase Storage
        const fileName = `exports/${projectId}/${ratio.replace(':', '-')}_${Date.now()}.mp4`;
        const { error: uploadError } = await supabase.storage
          .from('virtura-media')
          .upload(fileName, videoBuffer, {
            contentType: 'video/mp4',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${ratio}:`, uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('virtura-media')
          .getPublicUrl(fileName);

        processedVideos.push({
          aspectRatio: ratio,
          url: urlData.publicUrl,
          width: targetDims.width,
          height: targetDims.height,
          size: `${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`,
          isNative: false
        });

        console.log(`✅ Processed ${ratio}`);
      } catch (error) {
        console.error(`Error processing ${ratio}:`, error);
        // Continue with other ratios even if one fails
      }
    }

    if (processedVideos.length === 0) {
      throw new Error('All video processing failed');
    }

    console.log('✅ Export completed!');
    
    return new Response(
      JSON.stringify({
        success: true,
        videos: processedVideos,
        pack,
        watermark: contentCredentials,
        exportId: `export_${Date.now()}`,
        metadata: {
          totalVideos: processedVideos.length,
          requestedRatios: aspectRatios.length,
          sourceRatio
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function getTargetDimensions(ratio: string): { width: number; height: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1080, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '16:9': { width: 1920, height: 1080 },
    '4:5': { width: 1080, height: 1350 }
  };
  return dimensions[ratio] || { width: 1920, height: 1080 };
}
