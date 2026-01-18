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

    const { messages, model = 'mistral-large-latest', stream = false } = await req.json();
    const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');

    if (!MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY is not configured');
    }

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    console.log('Sending request to Mistral API with model:', model);

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
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
