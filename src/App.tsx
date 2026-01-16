import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { UsernameModal } from "@/components/UsernameModal";
import Index from "./pages/Index";
import LLMs from "./pages/LLMs";
import GenerateImages from "./pages/GenerateImages";
import GenerateVideos from "./pages/GenerateVideos";
import GenerateAudio from "./pages/GenerateAudio";
import Generate3D from "./pages/Generate3D";
import GenerateRetouch from "./pages/GenerateRetouch";
import Apps from "./pages/Apps";
import APIKeys from "./pages/APIKeys";
import Account from "./pages/Account";
import Tutorials from "./pages/Tutorials";
import Coding from "./pages/Coding";
import NotFound from "./pages/NotFound";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

// Composant Diode Alerte Admin
const AdminAlert = () => {
  const { session } = useSession();
  const [hasAlerts, setHasAlerts] = useState(false);

  useEffect(() => {
    if (!session?.isAdmin) return;

    const checkAlerts = async () => {
      const { count } = await supabase
        .from("admin_alerts")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      setHasAlerts(!!count && count > 0);
    };
    checkAlerts();

    const channel = supabase
      .channel("admin-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_alerts" }, () => {
        setHasAlerts(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  if (!hasAlerts || !session?.isAdmin) return null;

  return (
    <div className="fixed top-4 right-20 z-[10000] flex items-center gap-2 bg-red-900/80 px-3 py-1 rounded-full border border-red-500 animate-pulse cursor-pointer">
      <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
      <span className="text-white text-xs font-bold font-orbitron">ALERTE ADMIN</span>
    </div>
  );
};

function AppContent() {
  const { isLoading, isAuthenticated, login } = useSession();
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Gestion de l'ouverture automatique au clic
  useEffect(() => {
    const handleInteraction = (e: Event) => {
      // On ignore si c'est déjà authentifié ou si la modal est ouverte
      if (!isLoading && !isAuthenticated && !showUsernameModal) {
        setShowUsernameModal(true);
      }
    };

    if (!isAuthenticated && !isLoading) {
      // Délai pour éviter conflit immédiat
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

  const handleLoginSuccess = (sessionId: string, username: string) => {
    login(sessionId, username);
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
      <AdminAlert />
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={handleLoginSuccess}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<LLMs />} />
          <Route path="/llms" element={<LLMs />} />
          <Route path="/images" element={<GenerateImages />} />
          <Route path="/videos" element={<GenerateVideos />} />
          <Route path="/audio" element={<GenerateAudio />} />
          <Route path="/3d" element={<Generate3D />} />
          <Route path="/retouch" element={<GenerateRetouch />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/keys" element={<APIKeys />} />
          <Route path="/apis" element={<APIKeys />} />
          <Route path="/account" element={<Account />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/coding" element={<Coding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
