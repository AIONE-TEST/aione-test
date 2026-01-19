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
    const { prompt, width = 1024, height = 1024 } = await req.json();
    const STABILITY_API_KEY = Deno.env.get('STABILITY_API_KEY');

    if (!STABILITY_API_KEY) {
      throw new Error('STABILITY_API_KEY is not configured');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Generating image with Stability AI:', prompt.substring(0, 50) + '...');

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
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: 7,
          height,
          width,
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
