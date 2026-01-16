import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { UsernameModal } from "@/components/UsernameModal";
import Index from "./pages/Index";
import Account from "./pages/Account";
import Apps from "./pages/Apps";
import Chat from "./pages/Chat";
import Coding from "./pages/Coding";
import Generate3D from "./pages/Generate3D";
import GenerateAudio from "./pages/GenerateAudio";
import GenerateImages from "./pages/GenerateImages";
import GenerateRetouch from "./pages/GenerateRetouch";
import GenerateVideos from "./pages/GenerateVideos";
import LLMs from "./pages/LLMs";
import Tutorials from "./pages/Tutorials";
import APIKeys from "./pages/APIKeys";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminAlert = () => {
  return null;
};

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
      <AdminAlert />
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={handleLoginSuccess}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/account" element={<Account />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/coding" element={<Coding />} />
          <Route path="/3d" element={<Generate3D />} />
          <Route path="/audio" element={<GenerateAudio />} />
          <Route path="/images" element={<GenerateImages />} />
          <Route path="/retouch" element={<GenerateRetouch />} />
          <Route path="/videos" element={<GenerateVideos />} />
          <Route path="/llms" element={<LLMs />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/api-keys" element={<APIKeys />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;
