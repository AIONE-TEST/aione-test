import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { AuthModal } from "@/components/auth/AuthModal";
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

const queryClient = new QueryClient();

// Get dev mode flag from localStorage
const getDevModeFromStorage = () => {
  try {
    return localStorage.getItem("AIONE_DEV_MODE") === "true";
  } catch {
    return false;
  }
};

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [devModeEnabled, setDevModeEnabled] = useState(getDevModeFromStorage());

  // Listen for dev mode changes from Account page
  useEffect(() => {
    const handleDevModeChange = (event: CustomEvent) => {
      setDevModeEnabled(event.detail);
    };
    window.addEventListener("devModeChanged", handleDevModeChange as EventListener);
    return () => {
      window.removeEventListener("devModeChanged", handleDevModeChange as EventListener);
    };
  }, []);

  // Show auth modal when dev mode enabled and not authenticated
  useEffect(() => {
    if (devModeEnabled && !loading && !user) {
      setShowAuthModal(true);
    }
  }, [devModeEnabled, loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[hsl(var(--primary))]/30 border-t-[hsl(var(--primary))] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display text-lg text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthModal
        isOpen={devModeEnabled && showAuthModal && !user}
        onClose={() => setShowAuthModal(false)}
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
