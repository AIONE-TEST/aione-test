import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
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

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not configured');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const body = await req.json();

    // Status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId);
      const prediction = await replicate.predictions.get(body.predictionId);
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generation request
    if (!body.prompt) {
      throw new Error('Prompt is required');
    }

    console.log("Generating image with Replicate:", body.prompt.substring(0, 50) + '...');
    
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: body.prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: body.aspectRatio || "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      }
    );

    console.log("Replicate generation complete");
    return new Response(JSON.stringify({ output }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in replicate-image function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
