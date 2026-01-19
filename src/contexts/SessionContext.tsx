import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  id: string;
  username: string;
  ip_address?: string;
  save_history?: boolean;
  settings?: Record<string, any>;
}

interface SessionContextType {
  session: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (sessionId: string, username: string) => void;
  logout: () => void;
  updateSettings: (settings: Partial<SessionData>) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("aione_session_id");
    const storedUsername = localStorage.getItem("aione_username");

    if (storedSessionId && storedUsername) {
      // Verify session still exists in DB
      supabase
        .from("user_sessions")
        .select("*")
        .eq("id", storedSessionId)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setSession({
              id: data.id,
              username: data.username,
              ip_address: data.ip_address,
              save_history: data.save_history,
              settings: data.settings as Record<string, any>,
            });
          } else {
            // Clear invalid session
            localStorage.removeItem("aione_session_id");
            localStorage.removeItem("aione_username");
          }
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (sessionId: string, username: string) => {
    localStorage.setItem("aione_session_id", sessionId);
    localStorage.setItem("aione_username", username);
    setSession({ id: sessionId, username });
  };

  const logout = async () => {
    if (session) {
      // Log logout
      await supabase.from("activity_logs").insert({
        session_id: session.id,
        username: session.username,
        action: "logout",
        details: {}
      });
    }
    
    localStorage.removeItem("aione_session_id");
    localStorage.removeItem("aione_username");
    setSession(null);
  };

  const updateSettings = async (newSettings: Partial<SessionData>) => {
    if (!session) return;

    const { error } = await supabase
      .from("user_sessions")
      .update(newSettings)
      .eq("id", session.id);

    if (!error) {
      setSession(prev => prev ? { ...prev, ...newSettings } : null);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: !!session,
        login,
        logout,
        updateSettings,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
