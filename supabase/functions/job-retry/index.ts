import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, maxRetries = 3 } = await req.json();
    
    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Job ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get job details
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch job: ${fetchError.message}`);
    }

    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check retry count
    if (job.retry_count >= maxRetries) {
      return new Response(JSON.stringify({ 
        error: 'Maximum retry attempts reached',
        retry_count: job.retry_count,
        max_retries: maxRetries
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Reset job status and increment retry count
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'queued',
        progress: 0,
        retry_count: job.retry_count + 1,
        error_message: null,
        started_at: null,
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      throw new Error(`Failed to update job: ${updateError.message}`);
    }

    // Trigger job processing based on job type
    await triggerJobProcessing(supabase, job);

    console.log(`Job ${jobId} queued for retry (attempt ${job.retry_count + 1}/${maxRetries})`);

    return new Response(JSON.stringify({ 
      success: true,
      jobId,
      retry_count: job.retry_count + 1,
      message: 'Job queued for retry'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Job retry error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to retry job'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function triggerJobProcessing(supabase: any, job: any) {
  try {
    switch (job.type) {
      case 'voice_generation':
        await retryVoiceGeneration(supabase, job);
        break;
      case 'video_generation':
        await retryVideoGeneration(supabase, job);
        break;
      case 'avatar_upload':
        await retryAvatarUpload(supabase, job);
        break;
      default:
        console.log(`No retry handler for job type: ${job.type}`);
    }
  } catch (error) {
    console.error(`Failed to trigger ${job.type} retry:`, error);
    
    // Mark job as failed
    await supabase
      .from('jobs')
      .update({
        status: 'failed',
        error_message: `Retry trigger failed: ${error.message}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);
  }
}

async function retryVoiceGeneration(supabase: any, job: any) {
  const inputData = job.input_data;
  
  // Call voice generation function
  const { error } = await supabase.functions.invoke('voice-generate', {
    body: {
      script: inputData.script,
      voiceId: inputData.voiceId,
      model: inputData.model,
      voiceSettings: inputData.voiceSettings,
      jobId: job.id
    }
  });

  if (error) {
    throw new Error(`Voice generation retry failed: ${error.message}`);
  }
}

async function retryVideoGeneration(supabase: any, job: any) {
  const inputData = job.input_data;
  
  // Call video generation function
  const { error } = await supabase.functions.invoke('video-generate-simple', {
    body: {
      avatarId: inputData.avatarId,
      prompt: inputData.prompt,
      audioUrl: inputData.audioUrl,
      jobId: job.id
    }
  });

  if (error) {
    throw new Error(`Video generation retry failed: ${error.message}`);
  }
}

async function retryAvatarUpload(supabase: any, job: any) {
  const inputData = job.input_data;
  
  // Call avatar upload function
  const { error } = await supabase.functions.invoke('upload-avatar', {
    body: {
      photoUrl: inputData.photoUrl,
      jobId: job.id
    }
  });

  if (error) {
    throw new Error(`Avatar upload retry failed: ${error.message}`);
  }
}