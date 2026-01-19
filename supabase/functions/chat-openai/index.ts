import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";
import { validateChatInput } from "../_shared/validation.ts";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await req.json();
    const { messages, model = 'gpt-4o-mini', stream = false } = body;
    
    // Validate input
    const validation = validateChatInput(messages, model, 'openai');
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Sending request to OpenAI API with model:', validation.sanitizedModel || model);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: validation.sanitizedModel || model,
        messages: validation.sanitizedMessages,
        stream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-openai function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
