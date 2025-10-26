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
    const { projectId, videoUrl, pack, aspectRatios, contentCredentials, sourceVideo } = await req.json();
    
    console.log('📤 Export: Starting...');
    console.log('Project ID:', projectId);
    console.log('Video URL:', videoUrl);
    console.log('Aspect Ratios:', aspectRatios);
    console.log('Watermark:', contentCredentials);

    if (!videoUrl || !aspectRatios || aspectRatios.length === 0) {
      throw new Error('Missing required fields: videoUrl and aspectRatios');
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!REPLICATE_API_KEY) throw new Error('REPLICATE_API_KEY not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase credentials not configured');

    const replicate = new Replicate({ auth: REPLICATE_API_KEY });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const processedVideos = [];

    // Process each aspect ratio
    for (const ratio of aspectRatios) {
      console.log(`Processing ${ratio}...`);
      
      try {
        // Get crop dimensions based on aspect ratio
        const cropFilter = getCropFilter(ratio, sourceVideo);
        
        // Use Replicate to process video
        const output = await replicate.run(
          "fofr/video-to-video",
          {
            input: {
              video: videoUrl,
              prompt: contentCredentials 
                ? "Add semi-transparent 'AI Generated' watermark in bottom-right corner"
                : "Process video maintaining quality",
              fps: 24,
              width: cropFilter.width,
              height: cropFilter.height,
            }
          }
        );

        const processedVideoUrl = Array.isArray(output) ? output[0] : output;
        
        // Download processed video
        const videoResponse = await fetch(processedVideoUrl);
        const videoBlob = await videoResponse.blob();
        const videoBuffer = await videoBlob.arrayBuffer();
        
        // Upload to Supabase Storage
        const fileName = `exports/${projectId}/${ratio.replace(':', '-')}_${Date.now()}.mp4`;
        const { data: uploadData, error: uploadError } = await supabase.storage
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
          width: cropFilter.width,
          height: cropFilter.height,
          size: `${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`
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
          requestedRatios: aspectRatios.length
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

function getCropFilter(ratio: string, sourceVideo: any) {
  const [widthRatio, heightRatio] = ratio.split(':').map(Number);
  const targetAspect = widthRatio / heightRatio;
  
  // Base dimensions on target aspect ratio
  if (ratio === '1:1') {
    return { width: 1080, height: 1080 };
  } else if (ratio === '9:16') {
    return { width: 1080, height: 1920 };
  } else if (ratio === '16:9') {
    return { width: 1920, height: 1080 };
  } else if (ratio === '4:5') {
    return { width: 1080, height: 1350 };
  }
  
  // Fallback
  return { width: 1920, height: 1080 };
}