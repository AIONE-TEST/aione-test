/**
 * Helper to create Supabase headers with session info for RLS
 */
export function getSessionHeaders(): Record<string, string> {
  const sessionId = localStorage.getItem("aione_session_id") || "";
  const username = localStorage.getItem("aione_username") || "";
  
  return {
    "x-session-id": sessionId,
    "x-username": username,
  };
}

/**
 * Create fetch options with session headers for Supabase
 */
export function getSupabaseFetchOptions() {
  return {
    headers: getSessionHeaders(),
  };
}
