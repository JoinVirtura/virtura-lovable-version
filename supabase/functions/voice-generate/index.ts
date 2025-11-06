import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { deductTokensAndTrackCost, checkTokenBalance } from '../_shared/token-manager.ts';
import { calculateTokenCost, MODEL_COSTS } from '../_shared/token-costs.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { script, voiceId, model, voiceSettings } = await req.json();
    console.log('🎙️ Voice generation started:', { scriptLength: script?.length, voiceId });
    
    if (!script) {
      throw new Error('Script is required');
    }

    const normalizedScript = String(script).trim().slice(0, 1000);
    
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const authClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate token cost (1 token per 1000 characters)
    const charCount = normalizedScript.length;
    const requiredTokens = Math.max(1, Math.ceil(charCount / 1000));
    const estimatedCost = (charCount / 1000) * MODEL_COSTS.elevenlabs['eleven_multilingual_v2'];
    
    console.log(`💰 Token cost: ${requiredTokens} tokens for ${charCount} chars (estimated $${estimatedCost.toFixed(4)})`);
    
    // Check balance first (quick check)
    const balanceCheck = await checkTokenBalance(user.id, requiredTokens);
    if (!balanceCheck.hasBalance) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Insufficient tokens',
          requiredTokens,
          currentBalance: balanceCheck.currentBalance,
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Accept any provided ElevenLabs voiceId, fall back to Aria if missing
    const selectedVoiceId = (typeof voiceId === 'string' && voiceId.trim().length > 0)
      ? voiceId.trim()
      : '9BWtsMINqrJLrRacOk9x';

    // Sanitize/normalize voice settings to avoid API 4xx due to wrong types
    const sanitizeVoiceSettings = (vs: any) => {
      const toNum = (v: any, d: number) => {
        const n = typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : d);
        if (Number.isFinite(n)) return Math.max(0, Math.min(1, n));
        return d;
      };
      return {
        stability: toNum(vs?.stability, 0.5),
        similarity_boost: toNum(vs?.similarity_boost, 0.5),
        style: toNum(vs?.style, 0.0),
        use_speaker_boost: typeof vs?.use_speaker_boost === 'boolean' ? vs.use_speaker_boost : true,
      };
    };

    const elevenlabsKey = Deno.env.get('ELEVENLABS_API_KEY') || '';
    const openaiKey = Deno.env.get('OPENAI_API_KEY') || '';
    console.log('voice-generate: providers', { hasElevenLabs: !!elevenlabsKey, hasOpenAI: !!openaiKey });

    const sanitize = sanitizeVoiceSettings(voiceSettings);

    const generateWithElevenLabs = async (modelId: string): Promise<Uint8Array> => {
      console.log(`Trying ElevenLabs TTS with model ${modelId}...`);
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenlabsKey,
        },
        body: JSON.stringify({
          text: normalizedScript,
          model_id: model || modelId,
          voice_settings: sanitize,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`ElevenLabs API error: ${res.status} ${res.statusText}: ${txt}`);
      }
      const buf = await res.arrayBuffer();
      console.log(`✅ ElevenLabs audio generated in ${Date.now() - startTime}ms`);
      return new Uint8Array(buf);
    };

    const generateWithOpenAI = async (): Promise<Uint8Array> => {
      console.log('Trying OpenAI TTS (tts-1)...');
      
      // Map ALL 20 ElevenLabs voice IDs to OpenAI voices for fallback
      const voiceMapping: Record<string, string> = {
        // Executive Voices
        '9BWtsMINqrJLrRacOk9x': 'nova',     // Aria (Executive Female)
        'CwhRBWXzGAHq8TQ4Fs17': 'echo',     // Roger (Executive Male) ← KEY FIX
        'TX3LPaxmHKxFdv7VOQHJ': 'onyx',     // Liam (Executive Male)
        
        // Creative Voices
        'EXAVITQu4vr4xnSDxMaL': 'alloy',    // Sarah (Creative Female)
        'cgSgspJ2msm6clMCkdW9': 'shimmer',  // Jessica (Creative Female)
        'pFZP5JQG7iQjIQuC4Bku': 'nova',     // Lily (Creative Female)
        
        // Narrator Voices
        'onwK4e9ZLuTAKqWW03F9': 'onyx',     // Daniel (Narrator Male)
        'cjVigY5qzO86Huf0OWal': 'fable',    // Eric (Narrator Male)
        'XB0fDUnXU5powFXDhCwa': 'shimmer',  // Charlotte (Narrator Female)
        
        // Character Voices
        'IKne3meq5aSn9XLyUdCD': 'fable',    // Charlie (Character Male)
        'Xb7hH8MSUJpSbSDYk0k2': 'nova',     // Alice (Character Female)
        'XrExE9yKIg1WjnnlVkGX': 'alloy',    // Matilda (Character Female)
        
        // International Voices
        'SAz9YHcvj6GT2YYXdXww': 'onyx',     // River (International Male)
        'N2lVS1w4EtoT3dr4eOWO': 'echo',     // Callum (International Male)
        'FGY2WhTYpPnrIDTdsKH5': 'nova',     // Laura (International Female)
        
        // Young Professional Voices
        'JBFqnCBsd6RMkjVDRZzb': 'fable',    // George (Young Professional)
        'iP95p4xoKVk53GoZ742B': 'onyx',     // Chris (Young Professional)
        'nPczCjzI2devNBz1zQrb': 'echo',     // Brian (Young Professional)
        'pqHfZKP75CvOlQylNhV4': 'alloy',    // Bill (Young Professional)
        'bIHbv24MWmeRgasZH58o': 'echo',     // Will (Young Professional)
        
        // Legacy voice mappings (for backward compatibility)
        'pNInz6obpgDQGcFmaJgB': 'onyx',     // Adam
        'TxGEqnHWrfWFTfGW9XjX': 'echo',     // Josh
        'VR6AewLTigWG4xSOukaG': 'fable',    // Arnold
      };
      
      const openaiVoice = voiceMapping[selectedVoiceId] || 'alloy';
      console.log(`✅ Voice Selection: ElevenLabs ID '${selectedVoiceId}' → OpenAI voice '${openaiVoice}'`);
      
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: normalizedScript,
          voice: openaiVoice,
          response_format: 'mp3',
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`OpenAI TTS error: ${res.status} ${res.statusText}: ${txt}`);
      }
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    };

    let bytes: Uint8Array | null = null;
    let providerUsed = '';

    if (elevenlabsKey) {
      try {
        bytes = await generateWithElevenLabs('eleven_multilingual_v2');
        providerUsed = 'elevenlabs';
      } catch (e) {
        console.warn('ElevenLabs primary failed:', e);
        try {
          bytes = await generateWithElevenLabs('eleven_turbo_v2_5');
          providerUsed = 'elevenlabs-turbo';
        } catch (e2) {
          console.warn('ElevenLabs turbo failed:', e2);
        }
      }
    }

    if (!bytes && openaiKey) {
      try {
        bytes = await generateWithOpenAI();
        providerUsed = 'openai-tts-1';
      } catch (e) {
        console.error('OpenAI TTS fallback failed:', e);
      }
    }

    if (!bytes) {
      console.error('No TTS provider succeeded.');
      return new Response(
        JSON.stringify({ success: false, error: elevenlabsKey ? 'All TTS providers failed' : 'ELEVENLABS_API_KEY missing and OpenAI fallback failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Deduct tokens AFTER successful generation
    const tokenResult = await deductTokensAndTrackCost({
      userId: user.id,
      resourceType: 'voice_generation',
      apiProvider: providerUsed.includes('elevenlabs') ? 'elevenlabs' : 'openai',
      modelUsed: providerUsed,
      tokensToDeduct: requiredTokens,
      costUsd: estimatedCost,
      metadata: {
        characterCount: charCount,
        voiceId: selectedVoiceId,
        provider: providerUsed,
      },
    });
    
    if (!tokenResult.success) {
      console.error('Failed to deduct tokens after generation');
    } else {
      console.log(`✅ Tokens deducted. Remaining balance: ${tokenResult.remainingBalance}`);
    }

    // Prepare base64 for inline playback
    const chunkSize = 0x8000; // 32KB chunks
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Audio = btoa(binary);

    // Upload MP3 to Supabase Storage for a stable URL
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    let publicUrl: string | null = null;

    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      console.log('📤 Starting storage upload...');
      try {
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        const fileName = `audio/${Date.now()}-${(crypto as any).randomUUID?.() || Math.random().toString(36).slice(2)}.mp3`;
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const { error: uploadError } = await supabase.storage.from('virtura-media').upload(fileName, blob, {
          contentType: 'audio/mpeg',
          upsert: false,
        });
        if (uploadError) {
          console.warn('Audio upload failed, fallback to base64 only:', uploadError.message);
        } else {
          const { data: pub } = supabase.storage.from('virtura-media').getPublicUrl(fileName);
          publicUrl = pub?.publicUrl || null;
          console.log(`✅ Storage upload completed in ${Date.now() - startTime}ms total - URL:`, publicUrl, 'provider:', providerUsed);
        }
      } catch (e) {
        console.warn('Error uploading audio to storage:', e);
      }
    } else {
      console.warn('Missing SUPABASE_URL or SERVICE_ROLE_KEY; skipping storage upload');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        provider: providerUsed,
        audioData: `data:audio/mpeg;base64,${base64Audio}`,
        audioUrl: publicUrl,
        duration: 'estimated_duration',
        tokensCharged: requiredTokens,
        remainingBalance: tokenResult.remainingBalance,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Voice generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message, code: 'TTS_ERROR' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});