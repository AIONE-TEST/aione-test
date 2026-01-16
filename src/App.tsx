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

const queryClient = new QueryClient();

function AppContent() {
  const { isLoading, isAuthenticated, login } = useSession();
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isLoading && !isAuthenticated && !showUsernameModal) {
        setShowUsernameModal(true);
      }
    };

    if (!isAuthenticated && !isLoading) {
      window.addEventListener("click", handleFirstInteraction);
      window.addEventListener("keydown", handleFirstInteraction);
    }

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [isLoading, isAuthenticated, showUsernameModal]);

  const handleLoginSuccess = (sessionId: string, username: string) => {
    login(sessionId, username);
    setShowUsernameModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-500 font-orbitron">AIONE INITIALIZATION...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
