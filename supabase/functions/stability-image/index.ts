import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";
import { validateImageInput, validateNumericRange } from "../_shared/validation.ts";

// Allowed dimensions for Stability AI
const MIN_DIMENSION = 512;
const MAX_DIMENSION = 2048;

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await req.json();
    const { prompt, width = 1024, height = 1024 } = body;
    
    // Validate prompt
    const promptValidation = validateImageInput(prompt);
    if (!promptValidation.valid) {
      return new Response(
        JSON.stringify({ error: promptValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate dimensions
    const widthValidation = validateNumericRange(width, MIN_DIMENSION, MAX_DIMENSION, 'width');
    if (!widthValidation.valid) {
      return new Response(
        JSON.stringify({ error: widthValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const heightValidation = validateNumericRange(height, MIN_DIMENSION, MAX_DIMENSION, 'height');
    if (!heightValidation.valid) {
      return new Response(
        JSON.stringify({ error: heightValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const STABILITY_API_KEY = Deno.env.get('STABILITY_API_KEY');

    if (!STABILITY_API_KEY) {
      throw new Error('STABILITY_API_KEY is not configured');
    }

    console.log('Generating image with Stability AI:', promptValidation.sanitizedPrompt!.substring(0, 50) + '...');

    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [{ text: promptValidation.sanitizedPrompt, weight: 1 }],
          cfg_scale: 7,
          height: heightValidation.sanitizedValue || 1024,
          width: widthValidation.sanitizedValue || 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability API error:', response.status, errorText);
      throw new Error(`Stability API error: ${response.status}`);
    }

    const data = await response.json();
    const imageBase64 = data.artifacts[0].base64;

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${imageBase64}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in stability-image function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
