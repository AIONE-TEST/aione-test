import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id, x-username',
};

// Validation de session
async function validateSession(req: Request): Promise<{ valid: boolean; sessionId?: string; username?: string; error?: string }> {
  const sessionId = req.headers.get('x-session-id');
  const username = req.headers.get('x-username');
  
  if (!sessionId && !username) {
    return { valid: false, error: 'Session ID or username required' };
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  if (sessionId) {
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('id, username')
      .eq('id', sessionId)
      .maybeSingle();
      
    if (error || !session) {
      return { valid: false, error: 'Invalid session' };
    }
    
    return { valid: true, sessionId: session.id, username: session.username };
  }
  
  return { valid: true, username: username || undefined };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SÉCURITÉ: Validation de la session
    const sessionCheck = await validateSession(req);
    if (!sessionCheck.valid) {
      console.log('Session validation failed:', sessionCheck.error);
      return new Response(
        JSON.stringify({ error: sessionCheck.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Session validated for user:', sessionCheck.username);

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
