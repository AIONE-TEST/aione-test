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
  login: (sessionId: string, username: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const sessionId = localStorage.getItem("aione_session_id");
      const username = localStorage.getItem("aione_username");

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

  const login = (sessionId: string, username: string) => {
    localStorage.setItem("aione_session_id", sessionId);
    localStorage.setItem("aione_username", username);

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
    setSession(null);
    setIsAuthenticated(false);
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
