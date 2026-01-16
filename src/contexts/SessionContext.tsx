import React, { createContext, useContext, useState, useEffect } from "react";

interface Session {
  sessionId: string;
  username: string;
  isAdmin: boolean;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (sessionId: string, username: string, saveSession?: boolean) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      // Vérification double : LocalStorage (persistant) ou SessionStorage (temporaire)
      const sessionId = localStorage.getItem("aione_session_id") || sessionStorage.getItem("aione_session_id");
      const username = localStorage.getItem("aione_username") || sessionStorage.getItem("aione_username");

      if (sessionId && username) {
        setSession({
          sessionId,
          username,
          isAdmin: username.toLowerCase() === "mik",
        });
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = (sessionId: string, username: string, saveSession: boolean = false) => {
    // Si l'utilisateur veut "Se souvenir", on utilise LocalStorage, sinon SessionStorage
    const storage = saveSession ? localStorage : sessionStorage;

    storage.setItem("aione_session_id", sessionId);
    storage.setItem("aione_username", username);

    setSession({
      sessionId,
      username,
      isAdmin: username.toLowerCase() === "mik",
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("aione_session_id");
    localStorage.removeItem("aione_username");
    sessionStorage.removeItem("aione_session_id");
    sessionStorage.removeItem("aione_username");
    setSession(null);
    setIsAuthenticated(false);
    // On recharge la page pour réinitialiser l'état de l'application proprement
    window.location.href = "/";
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, isAuthenticated, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
