import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, jobData, jobId } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🔄 Job Queue Manager: ${action}`, { jobId, jobData });

    switch (action) {
      case 'create':
        return await createJob(supabase, jobData);
      case 'update':
        return await updateJob(supabase, jobId, jobData);
      case 'get':
        return await getJob(supabase, jobId);
      case 'queue_status':
        return await getQueueStatus(supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    console.error('Job Queue Manager error:', error);
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

async function createJob(supabase: any, jobData: any) {
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      user_id: jobData.user_id,
      type: jobData.type,
      stage: jobData.stage || 'queued',
      status: 'queued',
      input_data: jobData.input_data,
      progress: 0,
      gpu_requirements: jobData.gpu_requirements || {},
      estimated_completion: new Date(Date.now() + (jobData.estimated_duration || 60000))
    })
    .select()
    .single();

  if (error) throw error;

  console.log('✅ Job created:', job.id);

  return new Response(
    JSON.stringify({
      success: true,
      job
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateJob(supabase: any, jobId: string, updates: any) {
  const { data: job, error } = await supabase
    .from('jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;

  console.log('📝 Job updated:', jobId, updates);

  return new Response(
    JSON.stringify({
      success: true,
      job
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getJob(supabase: any, jobId: string) {
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      job
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getQueueStatus(supabase: any) {
  const { data: queueStats, error } = await supabase
    .from('jobs')
    .select('status, type, stage')
    .in('status', ['queued', 'processing', 'completed', 'failed']);

  if (error) throw error;

  const stats = {
    queued: queueStats.filter(j => j.status === 'queued').length,
    processing: queueStats.filter(j => j.status === 'processing').length,
    completed: queueStats.filter(j => j.status === 'completed').length,
    failed: queueStats.filter(j => j.status === 'failed').length,
    by_type: queueStats.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return new Response(
    JSON.stringify({
      success: true,
      stats
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}