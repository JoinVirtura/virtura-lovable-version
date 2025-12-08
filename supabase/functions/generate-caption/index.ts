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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { content_type, context, tone } = await req.json();

    const toneInstructions = {
      casual: "Use a friendly, conversational tone with emojis.",
      professional: "Keep it polished and professional.",
      funny: "Be witty and humorous, include puns if appropriate.",
      inspirational: "Be uplifting and motivational.",
    };

    const toneGuide = tone && toneInstructions[tone as keyof typeof toneInstructions] 
      ? toneInstructions[tone as keyof typeof toneInstructions]
      : "Be engaging and authentic.";

    const systemPrompt = `You are a social media caption expert. Generate engaging, creative captions for posts. ${toneGuide}

Rules:
- Keep captions concise (under 280 characters ideally)
- Include 2-3 relevant hashtags at the end
- Make it scroll-stopping and shareable
- Match the content type and context provided
- Don't use generic phrases like "Check this out"`;

    const userPrompt = `Generate a caption for a ${content_type || 'image'} post.${context ? ` Context: ${context}` : ''} Tone: ${tone || 'casual'}`;

    console.log('Generating caption with prompt:', userPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const caption = data.choices?.[0]?.message?.content?.trim() || "";

    console.log('Generated caption:', caption);

    return new Response(JSON.stringify({ caption }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating caption:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
