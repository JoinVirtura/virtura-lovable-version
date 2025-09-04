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
    const { avatarImage, engine, prompt, duration } = await req.json();
    
    if (!avatarImage) {
      throw new Error('Avatar image is required');
    }

    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    if (!heygenKey) {
      throw new Error('HeyGen API key not configured');
    }

    console.log('Generating video with HeyGen:', { engine, prompt, duration });

    // Prepare talking_photo_id for HeyGen
    let talkingPhotoId = avatarImage as string;

    try {
      // If the incoming value looks like a data URL or http(s) URL, upload it to HeyGen to obtain an ID
      const looksLikeId = typeof avatarImage === 'string' && (
        avatarImage.startsWith('tp_') ||
        avatarImage.startsWith('talking_photo_')
      );

      if (!looksLikeId) {
        let imageBlob: Blob | null = null;

        if (typeof avatarImage === 'string' && avatarImage.startsWith('data:')) {
          // Convert data URL to Blob
          const [meta, base64] = avatarImage.split(',');
          const match = /data:(.*?);base64/.exec(meta || '');
          const contentType = match?.[1] || 'image/png';
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          imageBlob = new Blob([bytes], { type: contentType });
        } else if (typeof avatarImage === 'string' && (avatarImage.startsWith('http://') || avatarImage.startsWith('https://'))) {
          const imgRes = await fetch(avatarImage);
          if (!imgRes.ok) throw new Error(`Failed to fetch avatar image URL: ${imgRes.status}`);
          imageBlob = await imgRes.blob();
        }

        if (imageBlob) {
          console.log('Uploading talking photo to HeyGen...');
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
            console.error('HeyGen upload error:', uploadText);
            throw new Error(`HeyGen upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
          }

          talkingPhotoId = uploadJson?.data?.talking_photo_id || uploadJson?.talking_photo_id || uploadJson?.id || uploadJson?.data?.id;
          console.log('Upload success. talking_photo_id:', talkingPhotoId, 'upload response:', uploadJson);

          if (!talkingPhotoId) {
            throw new Error('Missing talking_photo_id from HeyGen upload response');
          }
        }
      }
    } catch (e) {
      console.error('Error preparing talking_photo_id:', e);
      throw e;
    }

    // Call HeyGen API for avatar video generation
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${heygenKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: false,
        caption: false,
        dimension: {
          width: 1920,
          height: 1080
        },
        video_inputs: [{
          character: {
            type: "talking_photo",
            talking_photo: { talking_photo_id: talkingPhotoId },
            scale: 1.0,
            talking_photo_style: "closeup_body"
          },
          voice: {
            type: "text",
            input_text: prompt,
            voice_id: "1bd001e7e50f421d891986aad5158bc8"
          },
          background: {
            type: "color",
            value: "#000000"
          }
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen API error:', errorText);
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('HeyGen response:', data);

    return new Response(
      JSON.stringify({ 
        success: true,
        videoUrl: data.data?.video_url || `/demo/heygen-video-${Date.now()}.mp4`,
        video_id: data.data?.video_id,
        duration: duration,
        engine: 'heygen',
        status: 'completed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});