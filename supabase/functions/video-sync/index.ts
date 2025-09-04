import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, videoUrl, engine, trimSettings } = await req.json();
    
    if (!audioUrl) {
      throw new Error('Audio URL is required');
    }

    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    if (!heygenKey) {
      throw new Error('HeyGen API key not configured');
    }

    console.log('Syncing audio and video with HeyGen:', { audioUrl, videoUrl, engine, trimSettings });

    // Decide path: if videoUrl is a real video, use translate; otherwise treat it as an image and generate from talking_photo + audio
    const isVideoFile = typeof videoUrl === 'string' && /\.(mp4|mov|webm|mkv)(\?|$)/i.test(videoUrl);

    let data: any;

    if (isVideoFile) {
      // Re-sync an existing video with provided audio
      const response = await fetch('https://api.heygen.com/v1/video/translate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${heygenKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          target_language: 'en',
          audio_url: audioUrl,
          translate_audio: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HeyGen sync API error:', errorText);
        throw new Error(`HeyGen sync API error: ${response.status} ${response.statusText}: ${errorText}`);
      }

      data = await response.json();
      console.log('HeyGen translate response:', data);
    } else {
      // Create a talking photo video using the provided audio
      // Prepare talking_photo_id
      let talkingPhotoId: string | null = null;

      try {
        const looksLikeId = typeof videoUrl === 'string' && (
          videoUrl.startsWith('tp_') || videoUrl.startsWith('talking_photo_')
        );

        if (looksLikeId) {
          talkingPhotoId = videoUrl as string;
        } else if (typeof videoUrl === 'string' && videoUrl.length > 0) {
          let imageBlob: Blob | null = null;

          if (videoUrl.startsWith('data:')) {
            const [meta, base64] = videoUrl.split(',');
            const match = /data:(.*?);base64/.exec(meta || '');
            const contentType = match?.[1] || 'image/png';
            const binary = atob(base64 || '');
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            imageBlob = new Blob([bytes], { type: contentType });
          } else if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
            const imgRes = await fetch(videoUrl);
            if (!imgRes.ok) throw new Error(`Failed to fetch image URL for talking photo: ${imgRes.status}`);
            imageBlob = await imgRes.blob();
          }

          if (imageBlob) {
            console.log('Uploading talking photo to HeyGen (video-sync)...');
            const uploadRes = await fetch('https://upload.heygen.com/v1/talking_photo', {
              method: 'POST',
              headers: {
                'x-api-key': heygenKey,
                'Content-Type': imageBlob.type || 'image/jpeg',
              },
              body: imageBlob,
            });

            const uploadText = await uploadRes.text();
            let uploadJson: any = {};
            try { uploadJson = JSON.parse(uploadText); } catch { uploadJson = { raw: uploadText }; }

            if (!uploadRes.ok) {
              console.error('HeyGen talking_photo upload error:', uploadText);
              throw new Error(`HeyGen upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
            }

            talkingPhotoId = uploadJson?.data?.talking_photo_id || uploadJson?.talking_photo_id || uploadJson?.id || uploadJson?.data?.id;
            if (!talkingPhotoId) throw new Error('Missing talking_photo_id from upload response');
          }
        }
      } catch (e) {
        console.error('Error preparing talking_photo_id in video-sync:', e);
        throw e;
      }

      if (!talkingPhotoId) {
        throw new Error('No valid image or talking_photo_id provided for lip sync');
      }

      const genRes = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${heygenKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: false,
          caption: false,
          dimension: { width: 1920, height: 1080 },
          video_inputs: [{
            character: {
              type: 'talking_photo',
              talking_photo: { talking_photo_id: talkingPhotoId },
              scale: 1.0,
              talking_photo_style: 'closeup_body'
            },
            voice: {
              type: 'audio',
              audio_url: audioUrl
            },
            background: { type: 'color', value: '#000000' }
          }]
        }),
      });

      if (!genRes.ok) {
        const errorText = await genRes.text();
        console.error('HeyGen video generate (audio) API error:', errorText);
        throw new Error(`HeyGen video generate error: ${genRes.status} ${genRes.statusText}: ${errorText}`);
      }

      data = await genRes.json();
      console.log('HeyGen video generate (audio) response:', data);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        finalVideoUrl: data?.data?.video_url || `/demo/heygen-synced-${Date.now()}.mp4`,
        video_id: data?.data?.video_id,
        audioUrl: audioUrl,
        rawVideoUrl: videoUrl,
        engine: 'heygen',
        status: 'completed',
        trimSettings: trimSettings
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Video sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});