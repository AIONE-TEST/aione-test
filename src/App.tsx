import { useState, useEffect } from "react";
// ... imports existants ...
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { UsernameModal } from "@/components/UsernameModal";
import Index from "./pages/Index";
// ... autres imports ...
import Account from "./pages/Account";
import { supabase } from "@/integrations/supabase/client";

// ... Code AdminAlert existant ... (Ne pas modifier)
const AdminAlert = () => {
  /* ... Code diode ... */ return null;
}; // Je raccourcis ici pour la lisibilité, gardez votre code AdminAlert

function AppContent() {
  const { isLoading, isAuthenticated, login } = useSession();
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!isLoading && !isAuthenticated && !showUsernameModal) {
        setShowUsernameModal(true);
      }
    };

    if (!isAuthenticated && !isLoading) {
      const timer = setTimeout(() => {
        window.addEventListener("click", handleInteraction);
        window.addEventListener("keydown", handleInteraction);
      }, 500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };
    }
  }, [isLoading, isAuthenticated, showUsernameModal]);

  // CORRECTION MAJEURE ICI : Prise en compte du paramètre 'remember'
  const handleLoginSuccess = (sessionId: string, username: string, remember: boolean) => {
    login(sessionId, username, remember);
    setShowUsernameModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-500 font-orbitron animate-pulse">SYSTEM LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminAlert /> {/* Assurez-vous que la définition de AdminAlert est bien dans le fichier */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={handleLoginSuccess}
      />
      <BrowserRouter>
        <Routes>
          {/* ... Toutes vos routes existantes ... */}
          <Route path="/" element={<Index />} />
          <Route path="/account" element={<Account />} />
          {/* ... etc ... */}
        </Routes>
      </BrowserRouter>
    </>
  );
}
// ... Export default App ...
export default App; // (Gardez la structure wrapper existante)
