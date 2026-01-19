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

    if (!password || typeof password !== 'string' || password.length < 1 || password.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid password', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for RPC calls
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First check if user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { 
      _username: username.toLowerCase().trim() 
    });

    if (adminError) {
      console.error('Error checking admin status:', adminError);
      throw new Error('Failed to verify admin status');
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'User is not an admin', valid: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify password using existing RPC function
    const { data: passwordValid, error: passwordError } = await supabase.rpc('verify_session_password', {
      session_username: username.toLowerCase().trim(),
      input_password: password
    });

    if (passwordError) {
      console.error('Error verifying password:', passwordError);
      throw new Error('Failed to verify password');
    }

    if (!passwordValid) {
      // Log failed attempt
      await supabase.from('activity_logs').insert({
        username: username.toLowerCase().trim(),
        action: 'admin_login_failed',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        details: { reason: 'invalid_password' }
      });

      return new Response(
        JSON.stringify({ error: 'Invalid password', valid: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('id, username')
      .eq('username', username.toLowerCase().trim())
      .single();

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Session not found', valid: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last login
    await supabase
      .from('user_sessions')
      .update({ 
        last_login: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })
      .eq('id', sessionData.id);

    // Log successful admin login
    await supabase.from('activity_logs').insert({
      session_id: sessionData.id,
      username: sessionData.username,
      action: 'admin_login',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      details: { source: 'verify-admin-password' }
    });

    return new Response(
      JSON.stringify({ 
        valid: true, 
        sessionId: sessionData.id,
        username: sessionData.username
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-admin-password function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', valid: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
