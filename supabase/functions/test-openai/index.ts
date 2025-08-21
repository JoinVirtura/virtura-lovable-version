import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('Testing OpenAI API key access...');
    const env = Deno.env.toObject();
    console.log('Available env keys:', Object.keys(env));
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OPENAI_API_KEY exists:', !!openAIApiKey);
    console.log('OPENAI_API_KEY length:', openAIApiKey?.length || 0);
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key not found',
        availableKeys: Object.keys(env).filter(key => key.includes('OPENAI') || key.includes('API'))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test simple OpenAI call
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
    });

    console.log('OpenAI models response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `OpenAI API error: ${response.status}`,
        details: errorText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const models = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'OpenAI API key is working!',
      modelCount: models.data?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in test-openai function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});