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
    const { pipeline } = await req.json();
    
    console.log('Starting pipeline run:', pipeline);
    
    // Simulate pipeline execution with SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Simulate voice generation
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          stage: 'voice',
          progress: 33,
          message: 'Generating voice with ElevenLabs...'
        })}\n\n`));
        
        setTimeout(() => {
          // Simulate video generation
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            stage: 'video', 
            progress: 66,
            message: 'Creating video with Kling...'
          })}\n\n`));
          
          setTimeout(() => {
            // Simulate lip-sync
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              stage: 'sync',
              progress: 100,
              message: 'Applying lip-sync with Pixverse...',
              completed: true,
              audioUrl: '/demo/output.mp3',
              rawVideoUrl: '/demo/raw.mp4', 
              finalVideoUrl: '/demo/final.mp4'
            })}\n\n`));
            
            controller.close();
          }, 2000);
        }, 2000);
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('Pipeline error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});