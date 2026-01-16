import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  id: string;
  username: string;
  ip_address?: string;
  save_history?: boolean;
  settings?: Record<string, any>;
  stay_connected?: boolean;
  isAdmin?: boolean;
}

interface SessionContextType {
  session: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (sessionId: string, username: string) => void;
  logout: () => void;
  updateSettings: (settings: Partial<SessionData>) => Promise<void>;
  updateActivity: () => void;
  deleteHistory: () => Promise<void>; // TÂCHE 21
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// TÂCHE 9: Timeout d'inactivité de 30 minutes
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isInactive, setIsInactive] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("aione_session_id");
    const storedUsername = localStorage.getItem("aione_username");

    if (storedSessionId && storedUsername) {
      // Verify session still exists in DB
      supabase
        .from("user_sessions_public")
        .select("*")
        .eq("id", storedSessionId)
        .single()
        .then(async ({ data: rawData, error }) => {
          const data = rawData as any;
          if (data && !error) {
            // Check if admin - TÂCHE 15
            const { data: adminCheck } = await supabase
              .rpc("is_admin", { _username: data.username });
            
            const adminStatus = adminCheck === true;
            setIsAdmin(adminStatus);
            
            setSession({
              id: data.id,
              username: data.username,
              ip_address: data.ip_address,
              save_history: data.save_history,
              settings: data.settings as Record<string, any>,
              stay_connected: data.stay_connected || false,
              isAdmin: adminStatus
            });
            
            // Update last activity
            supabase
              .from("user_sessions")
              .update({ last_activity: new Date().toISOString() })
              .eq("id", data.id);
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

  // TÂCHE 9: Activity tracking and timeout
  useEffect(() => {
    if (!session || session.stay_connected) return;

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        setIsInactive(true);
        logout();
      }
    };

    const interval = setInterval(checkInactivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [session, lastActivity]);

  // Track user activity
  useEffect(() => {
    if (!session) return;

    const updateActivityTimestamp = () => {
      setLastActivity(Date.now());
      setIsInactive(false);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivityTimestamp);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivityTimestamp);
      });
    };
  }, [session]);

  const updateActivity = useCallback(() => {
    if (!session) return;
    setLastActivity(Date.now());
    
    // Update in DB periodically (every 5 min)
    supabase
      .from("user_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("id", session.id);
  }, [session]);

  const login = async (sessionId: string, username: string) => {
    localStorage.setItem("aione_session_id", sessionId);
    localStorage.setItem("aione_username", username);
    
    // Check if admin - TÂCHE 15
    const { data: adminCheck } = await supabase
      .rpc("is_admin", { _username: username });
    
    const adminStatus = adminCheck === true;
    setIsAdmin(adminStatus);
    
    setSession({ id: sessionId, username, isAdmin: adminStatus });
    setLastActivity(Date.now());
  };

  const logout = async () => {
    if (session) {
      // Log logout
      await supabase.from("activity_logs").insert({
        session_id: session.id,
        username: session.username,
        action: "logout",
        details: { reason: isInactive ? "inactivity_timeout" : "manual" }
      });
    }
    
    localStorage.removeItem("aione_session_id");
    localStorage.removeItem("aione_username");
    setSession(null);
    setIsAdmin(false);
    setIsInactive(false);
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

  // TÂCHE 21: Delete all user history
  const deleteHistory = async () => {
    if (!session) return;

    try {
      // Delete generation history
      await supabase
        .from("generation_history")
        .delete()
        .eq("session_id", session.id);

      // Delete activity logs
      await supabase
        .from("activity_logs")
        .delete()
        .eq("session_id", session.id);

      // Delete chat conversations and messages
      const { data: conversations } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", session.id);

      if (conversations) {
        for (const conv of conversations) {
          await supabase
            .from("chat_messages")
            .delete()
            .eq("conversation_id", conv.id);
        }
        
        await supabase
          .from("chat_conversations")
          .delete()
          .eq("session_id", session.id);
      }

      // Clear user notes
      await supabase
        .from("user_notes")
        .update({ content: "" })
        .eq("session_id", session.id);

    } catch (error) {
      console.error("Error deleting history:", error);
      throw error;
    }
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: !!session,
        isAdmin,
        login,
        logout,
        updateSettings,
        updateActivity,
        deleteHistory,
      }}
    >
      {/* TÂCHE 9: Overlay when inactive */}
      {isInactive && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xl mb-4">Session expirée pour inactivité</p>
            <p className="text-sm text-muted-foreground">Veuillez vous réidentifier</p>
          </div>
        </div>
      )}
      {children}
    </SessionContext.Provider>
  );
}