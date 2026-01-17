import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
  const { session, isLoading, isAuthenticated, login, updateActivity } = useSession();
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // TÂCHE 17 & 18: Popup hidden by default, opens on action
  const handleLoginRequired = useCallback(() => {
    if (!isAuthenticated) {
      setShowUsernameModal(true);
    }
  }, [isAuthenticated]);

  // Track clicks on interactive elements - TÂCHE 18
  useEffect(() => {
    if (isAuthenticated) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]');
      
      // Check if it's not the close button of the modal itself
      const isCloseButton = target.closest('[data-close-modal]');
      
      if (isInteractive && !showUsernameModal && !isCloseButton) {
        setShowUsernameModal(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isAuthenticated, showUsernameModal]);

  // Update activity on user interaction
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleActivity = () => updateActivity();
    const events = ['mousedown', 'keydown', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateActivity]);

  const handleLoginSuccess = (sessionId: string, username: string) => {
    login(sessionId, username);
    setShowUsernameModal(false);
  };

  // TÂCHE 18: Close modal handler
  const handleCloseModal = () => {
    setShowUsernameModal(false);
  };

  if (isLoading) {
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
      {/* TÂCHE 17 & 19: Modal doesn't block view, visible behind */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={handleCloseModal}
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
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </LanguageProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
