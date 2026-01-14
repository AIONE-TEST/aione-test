import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
