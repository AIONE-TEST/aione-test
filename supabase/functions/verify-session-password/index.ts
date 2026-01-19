import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { getCorsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { username, password } = await req.json();

    // Validate input
    if (!username || typeof username !== 'string' || username.length < 3 || username.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid username', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password !== undefined && password !== null && password !== '') {
      if (typeof password !== 'string' || password.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid password format', valid: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create Supabase client with service role for RPC calls
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const normalizedUsername = username.toLowerCase().trim();

    // Check if session has password
    const { data: hasPassword, error: hasPasswordError } = await supabase.rpc('session_has_password', { 
      session_username: normalizedUsername 
    });

    if (hasPasswordError) {
      console.error('Error checking password:', hasPasswordError);
      throw new Error('Failed to check password status');
    }

    // If session has password but none provided
    if (hasPassword && (!password || password === '')) {
      return new Response(
        JSON.stringify({ 
          error: 'Password required', 
          valid: false,
          requiresPassword: true 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If password is required, verify it
    if (hasPassword) {
      const { data: passwordValid, error: passwordError } = await supabase.rpc('verify_session_password', {
        session_username: normalizedUsername,
        input_password: password
      });

      if (passwordError) {
        console.error('Error verifying password:', passwordError);
        throw new Error('Failed to verify password');
      }

      if (!passwordValid) {
        // Log failed attempt
        await supabase.from('activity_logs').insert({
          username: normalizedUsername,
          action: 'login_failed',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          details: { reason: 'invalid_password' }
        });

        return new Response(
          JSON.stringify({ error: 'Invalid password', valid: false }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('id, username')
      .eq('username', normalizedUsername)
      .single();

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Session not found', valid: false, notFound: true }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { 
      _username: normalizedUsername 
    });

    // Update last login
    await supabase
      .from('user_sessions')
      .update({ 
        last_login: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })
      .eq('id', sessionData.id);

    // Log successful login
    await supabase.from('activity_logs').insert({
      session_id: sessionData.id,
      username: sessionData.username,
      action: 'login',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      details: { source: 'verify-session-password' }
    });

    return new Response(
      JSON.stringify({ 
        valid: true, 
        sessionId: sessionData.id,
        username: sessionData.username,
        isAdmin: isAdmin || false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-session-password function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', valid: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
