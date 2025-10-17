import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { voiceId, text } = await req.json()
    
    if (!voiceId || !text) {
      throw new Error('voiceId and text are required')
    }

    console.log('Generating voice preview for:', voiceId)
    
    // Try ElevenLabs first
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (ELEVENLABS_API_KEY) {
      console.log('Attempting ElevenLabs preview...')
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_turbo_v2_5', // Faster model for previews
              voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75
              }
            })
          }
        )
        
        if (response.ok) {
          console.log('ElevenLabs preview generated successfully')
          const audioBuffer = await response.arrayBuffer()
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))
          
          return new Response(
            JSON.stringify({ 
              success: true,
              audioData: `data:audio/mpeg;base64,${base64Audio}`,
              provider: 'elevenlabs'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        console.log('ElevenLabs failed, trying OpenAI...')
      } catch (elevenError) {
        console.error('ElevenLabs error:', elevenError)
      }
    }
    
    // Fallback to OpenAI TTS for preview
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('No voice API keys configured')
    }
    
    console.log('Attempting OpenAI preview...')
    
    // Map ALL 20 ElevenLabs voice IDs to OpenAI voices (matches voice-generate)
    const voiceMap: Record<string, string> = {
      // Executive Voices
      '9BWtsMINqrJLrRacOk9x': 'nova',     // Aria (Executive Female)
      'CwhRBWXzGAHq8TQ4Fs17': 'echo',     // Roger (Executive Male)
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
    };
    
    const openaiVoice = voiceMap[voiceId] || 'alloy';
    console.log(`🎙️ Voice Preview: ElevenLabs ID '${voiceId}' → OpenAI voice '${openaiVoice}'`);
    
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceMap[voiceId] || 'alloy',
        speed: 1.0,
      }),
    })
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI TTS error:', errorText)
      throw new Error('Voice preview generation failed')
    }
    
    console.log('OpenAI preview generated successfully')
    const audioBuffer = await openaiResponse.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))
    
    return new Response(
      JSON.stringify({ 
        success: true,
        audioData: `data:audio/mpeg;base64,${base64Audio}`,
        provider: 'openai'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error: any) {
    console.error('Voice preview error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
