/**
 * Supabase client wrapper that automatically adds session headers for RLS policies.
 * This fixes the security issue where RLS policies expect x-session-id and x-username headers.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Get session credentials from localStorage
 */
export function getSessionCredentials() {
  const sessionId = localStorage.getItem('aione_session_id') || '';
  const username = localStorage.getItem('aione_username') || '';
  return { sessionId, username };
}

/**
 * Create a Supabase client with session headers for authenticated requests.
 * Call this when you need to make authenticated database requests.
 */
export function createAuthenticatedClient() {
  const { sessionId, username } = getSessionCredentials();
  
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-session-id': sessionId,
        'x-username': username,
      },
    },
  });
}

/**
 * Get headers for edge function calls
 */
export function getEdgeFunctionHeaders(): Record<string, string> {
  const { sessionId, username } = getSessionCredentials();
  return {
    'x-session-id': sessionId,
    'x-username': username,
  };
}

// Default export for convenience - creates a new client with current session headers
export const supabaseWithSession = createAuthenticatedClient();
