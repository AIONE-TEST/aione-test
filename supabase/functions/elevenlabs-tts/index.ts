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

    const { text, voiceId = 'JBFqnCBsd6RMkjVDRZzb' } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Generating audio with ElevenLabs for text:', text.substring(0, 50) + '...');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
