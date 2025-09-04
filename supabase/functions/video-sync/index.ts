import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility helpers
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url: string, init: RequestInit, retries = 2) {
  let attempt = 0;
  let res: Response | null = null;
  while (attempt <= retries) {
    res = await fetch(url, init);
    if (res.ok) return res;
    // Retry on 5xx and 429
    if (res.status >= 500 || res.status === 429) {
      const backoff = Math.min(2000, 300 * 2 ** attempt);
      await sleep(backoff);
      attempt++;
      continue;
    }
    break;
  }
  return res!;
}

function dataUrlToBlob(dataUrl: string, fallbackType: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const match = /data:(.*?);base64/.exec(meta || '');
  const contentType = match?.[1] || fallbackType;
  const bytes = base64Decode(base64 || '');
  return new Blob([bytes], { type: contentType });
}

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

    // Prepare Supabase client for optional audio upload (data URLs)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    // Normalize audio URL: if it's a data URL, upload to a public bucket and use its public URL
    let resolvedAudioUrl: string = audioUrl;
    try {
      if (typeof audioUrl === 'string' && audioUrl.startsWith('data:')) {
        if (!supabase) throw new Error('Supabase client not configured for audio upload');

const blob = dataUrlToBlob(audioUrl, 'audio/mpeg');

        const bucket = 'virtura-media';
        // Ensure bucket exists and is public
        try {
          const { data: gotBucket, error: getErr } = await supabase.storage.getBucket(bucket);
          if (getErr || !gotBucket) {
            await supabase.storage.createBucket(bucket, { public: true });
          }
        } catch (_) {
          // Attempt to create bucket if getBucket is not available or failed
          try { await supabase.storage.createBucket(bucket, { public: true }); } catch { /* ignore */ }
        }

        const contentType = (blob.type as string) || 'audio/mpeg';
        const ext = contentType.includes('wav') ? 'wav' : contentType.includes('ogg') ? 'ogg' : 'mp3';
        const path = `assets/output/audio/sync/${Date.now()}.${ext}`;
        console.log('Uploading audio data URL to Supabase storage at', path);
        const { data: uploadData, error: uploadErr } = await supabase.storage.from(bucket).upload(path, blob, {
          contentType,
          upsert: true,
        });
        if (uploadErr) {
          console.error('Supabase audio upload error:', uploadErr.message);
          throw uploadErr;
        }
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(uploadData!.path);
        resolvedAudioUrl = pub.publicUrl;
        console.log('Audio uploaded. Public URL:', resolvedAudioUrl);
      }
    } catch (e) {
      console.error('Audio normalization/upload failed:', e);
      // proceed with original audioUrl; HeyGen may reject, but we log the reason
    }

    // Decide path: if videoUrl is a real video, use translate; otherwise treat it as an image and generate from talking_photo + audio
    const isVideoFile = typeof videoUrl === 'string' && /\.(mp4|mov|webm|mkv)(\?|$)/i.test(videoUrl);

    let data: any;

    if (isVideoFile) {
      // Re-sync an existing video with provided audio
      const response = await fetchWithRetry('https://api.heygen.com/v1/video/translate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${heygenKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          target_language: 'en',
          audio_url: resolvedAudioUrl,
          translate_audio: false
        }),
      }, 2);

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
            imageBlob = dataUrlToBlob(videoUrl, 'image/png');
          } else if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
            const imgRes = await fetch(videoUrl);
            if (!imgRes.ok) throw new Error(`Failed to fetch image URL for talking photo: ${imgRes.status}`);
            imageBlob = await imgRes.blob();
          }

          if (imageBlob) {
            console.log('Uploading talking photo to HeyGen (video-sync)...');
            const uploadRes = await fetchWithRetry('https://upload.heygen.com/v1/talking_photo', {
              method: 'POST',
              headers: {
                'x-api-key': heygenKey,
                'Content-Type': imageBlob.type || 'image/jpeg',
              },
              body: imageBlob,
            }, 2);

            const uploadText = await uploadRes.text();
            let uploadJson: any = {};
            try { uploadJson = JSON.parse(uploadText); } catch { uploadJson = { raw: uploadText }; }

            if (!uploadRes.ok) {
              console.error('HeyGen talking_photo upload error:', uploadText);
              if (uploadJson?.code === 401028 || /exceeded your limit/i.test(uploadText)) {
                throw new Error(`HEYGEN_TALKING_PHOTO_LIMIT: ${uploadJson?.message || uploadText}`);
              }
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

      const genRes = await fetchWithRetry('https://api.heygen.com/v2/video/generate', {
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
              talking_photo_id: talkingPhotoId,
              scale: 1.0,
              talking_photo_style: 'closeup_body'
            },
            voice: {
              type: 'audio',
              audio_url: resolvedAudioUrl
            },
            background: { type: 'color', value: '#000000' }
          }]
        }),
      }, 2);

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
        videoUrl: data?.data?.video_url || `/demo/heygen-synced-${Date.now()}.mp4`,
        video_id: data?.data?.video_id,
        audioUrl: resolvedAudioUrl,
        rawVideoUrl: videoUrl,
        engine: 'heygen',
        status: 'completed',
        trimSettings: trimSettings
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Video sync error:', error);
    const msg = String(error?.message || 'Unknown error');
    const code = msg.includes('HEYGEN_TALKING_PHOTO_LIMIT') ? 'HEYGEN_TALKING_PHOTO_LIMIT' : 'SYNC_ERROR';
    return new Response(
      JSON.stringify({ success: false, error: msg, code }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});