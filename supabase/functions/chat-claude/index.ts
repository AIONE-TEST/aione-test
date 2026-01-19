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
    const { messages, model = 'claude-sonnet-4-20250514', stream = false } = body;
    
    // Validate input
    const validation = validateChatInput(messages, model, 'anthropic');
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    console.log('Sending request to Claude API with model:', validation.sanitizedModel || model);

    // Extract system message if present
    const systemMessage = validation.sanitizedMessages!.find(m => m.role === 'system')?.content || '';
    const userMessages = validation.sanitizedMessages!.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: validation.sanitizedModel || model,
        max_tokens: 4096,
        system: systemMessage,
        messages: userMessages,
        stream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', response.status, errorData);
      throw new Error(`Claude API error: ${errorData.error?.message || response.status}`);
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

    const data = await response.json();
    
    // Transform to OpenAI-compatible format
    const transformedResponse = {
      id: data.id,
      choices: [{
        message: {
          role: 'assistant',
          content: data.content[0].text,
        },
        finish_reason: data.stop_reason,
      }],
      usage: data.usage,
    };

    return new Response(JSON.stringify(transformedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-claude function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
