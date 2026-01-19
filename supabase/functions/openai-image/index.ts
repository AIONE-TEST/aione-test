import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";
import { validateImageInput, validateNumericRange } from "../_shared/validation.ts";

// Allowed image sizes
const ALLOWED_SIZES = ['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'];
const ALLOWED_QUALITIES = ['standard', 'hd'];

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await req.json();
    const { prompt, size = '1024x1024', quality = 'standard' } = body;
    
    // Validate prompt
    const promptValidation = validateImageInput(prompt);
    if (!promptValidation.valid) {
      return new Response(
        JSON.stringify({ error: promptValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate size
    if (!ALLOWED_SIZES.includes(size)) {
      return new Response(
        JSON.stringify({ error: `Invalid size. Allowed: ${ALLOWED_SIZES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate quality
    if (!ALLOWED_QUALITIES.includes(quality)) {
      return new Response(
        JSON.stringify({ error: `Invalid quality. Allowed: ${ALLOWED_QUALITIES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating image with DALL-E:', promptValidation.sanitizedPrompt!.substring(0, 50) + '...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: promptValidation.sanitizedPrompt,
        n: 1,
        size,
        quality,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    return new Response(
      JSON.stringify({ image: imageUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in openai-image function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
