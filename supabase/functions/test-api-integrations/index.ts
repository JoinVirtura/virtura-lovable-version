import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface APITestResult {
  provider: string;
  status: 'success' | 'error';
  message: string;
  responseTime?: number;
}

async function testReplicate(): Promise<APITestResult> {
  const startTime = Date.now();
  const apiKey = Deno.env.get('REPLICATE_API_KEY')?.trim();
  
  if (!apiKey) {
    return { provider: 'Replicate', status: 'error', message: 'API key not configured' };
  }

  try {
    // Test by fetching account info
    const response = await fetch('https://api.replicate.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return { provider: 'Replicate', status: 'success', message: 'API connection verified', responseTime };
    } else {
      const error = await response.text();
      return { provider: 'Replicate', status: 'error', message: `HTTP ${response.status}: ${error.substring(0, 100)}`, responseTime };
    }
  } catch (error) {
    return { provider: 'Replicate', status: 'error', message: `Connection failed: ${error.message}` };
  }
}

async function testOpenAI(): Promise<APITestResult> {
  const startTime = Date.now();
  const apiKey = Deno.env.get('OPENAI_API_KEY')?.trim();
  
  if (!apiKey) {
    return { provider: 'OpenAI', status: 'error', message: 'API key not configured' };
  }

  try {
    // Test by fetching models list
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return { provider: 'OpenAI', status: 'success', message: 'API connection verified', responseTime };
    } else {
      const error = await response.text();
      return { provider: 'OpenAI', status: 'error', message: `HTTP ${response.status}: ${error.substring(0, 100)}`, responseTime };
    }
  } catch (error) {
    return { provider: 'OpenAI', status: 'error', message: `Connection failed: ${error.message}` };
  }
}

async function testHeyGen(): Promise<APITestResult> {
  const startTime = Date.now();
  const apiKey = Deno.env.get('HEYGEN_API_KEY')?.trim();
  
  if (!apiKey) {
    return { provider: 'HeyGen', status: 'error', message: 'API key not configured' };
  }

  try {
    // Test by fetching user info - updated endpoint
    const response = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return { 
        provider: 'HeyGen', 
        status: 'success', 
        message: `API verified - Remaining quota: ${data.data?.remaining_quota || 'unknown'}`, 
        responseTime 
      };
    } else {
      const error = await response.text();
      return { provider: 'HeyGen', status: 'error', message: `HTTP ${response.status}: ${error.substring(0, 100)}`, responseTime };
    }
  } catch (error) {
    return { provider: 'HeyGen', status: 'error', message: `Connection failed: ${error.message}` };
  }
}

async function testElevenLabs(): Promise<APITestResult> {
  const startTime = Date.now();
  const apiKey = (Deno.env.get('ELEVENLABS_API_KEY') || Deno.env.get('ELEVEN_LABS_API_KEY'))?.trim();
  
  if (!apiKey) {
    return { provider: 'ElevenLabs', status: 'error', message: 'API key not configured' };
  }

  try {
    // Test by fetching user info
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return { 
        provider: 'ElevenLabs', 
        status: 'success', 
        message: `API verified - Character limit: ${data.subscription?.character_limit || 'unknown'}`, 
        responseTime 
      };
    } else {
      const error = await response.text();
      return { provider: 'ElevenLabs', status: 'error', message: `HTTP ${response.status}: ${error.substring(0, 100)}`, responseTime };
    }
  } catch (error) {
    return { provider: 'ElevenLabs', status: 'error', message: `Connection failed: ${error.message}` };
  }
}

async function testHuggingFace(): Promise<APITestResult> {
  const startTime = Date.now();
  const apiKey = (Deno.env.get('HUGGING_FACE_ACCESS_TOKEN') || Deno.env.get('HUGGINGFACE_API_KEY') || Deno.env.get('HUGGING_FACE_API_KEY'))?.trim();
  
  if (!apiKey) {
    return { provider: 'HuggingFace', status: 'error', message: 'API key not configured' };
  }

  try {
    // Test by fetching whoami
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return { 
        provider: 'HuggingFace', 
        status: 'success', 
        message: `API verified - User: ${data.name || 'authenticated'}`, 
        responseTime 
      };
    } else {
      const error = await response.text();
      return { provider: 'HuggingFace', status: 'error', message: `HTTP ${response.status}: ${error.substring(0, 100)}`, responseTime };
    }
  } catch (error) {
    return { provider: 'HuggingFace', status: 'error', message: `Connection failed: ${error.message}` };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting API integration tests...');

  try {
    // Run all tests in parallel
    const results = await Promise.all([
      testReplicate(),
      testOpenAI(),
      testHeyGen(),
      testElevenLabs(),
      testHuggingFace()
    ]);

    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passed: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    };

    console.log('API integration test results:', JSON.stringify(summary, null, 2));

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Test suite failed:', error);
    return new Response(
      JSON.stringify({ error: 'Test suite failed', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
