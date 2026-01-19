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
    const { messages, model = 'mistral-large-latest', stream = false } = body;
    
    // Validate input
    const validation = validateChatInput(messages, model, 'mistral');
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');

    if (!MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY is not configured');
    }

    console.log('Sending request to Mistral API with model:', validation.sanitizedModel || model);

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
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
      console.error('Mistral API error:', response.status, errorData);
      throw new Error(`Mistral API error: ${errorData.message || response.status}`);
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
    console.error('Error in chat-mistral function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
