import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Image, Video, MessageSquare, Music, Wand2, Box, 
  Zap, ArrowRight, Star
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { aiModels } from "@/data/aiModels";
import { PromoBanner } from "@/components/PromptBanner";

const categories = [
  { id: "llms", label: "LLMS", icon: MessageSquare, path: "/llms", color: "btn-3d-pink" },
  { id: "images", label: "IMAGES", icon: Image, path: "/images", color: "btn-3d-pink" },
  { id: "videos", label: "VIDÉOS", icon: Video, path: "/videos", color: "btn-3d-purple" },
  { id: "audio", label: "AUDIO", icon: Music, path: "/audio", color: "btn-3d-yellow" },
  { id: "retouch", label: "RETOUCH", icon: Wand2, path: "/retouch", color: "btn-3d-cyan" },
  { id: "3d", label: "3D", icon: Box, path: "/3d", color: "btn-3d-green" },
];

const Index = () => {
  // Scroll en haut de page (Point 9)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const stats = useMemo(() => {
    const total = aiModels.length;
    const free = aiModels.filter((m) => m.isFree).length;
    const categoriesSet = new Set(aiModels.map((m) => m.category));
    return { total, free, categories: categoriesSet.size };
  }, []);

  // Tâche 12: Afficher TOUS les modèles gratuits
  const freeModels = useMemo(() => 
    aiModels.filter((m) => m.isFree), 
  []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-6">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black gradient-text-pink text-glow-pink mb-3">
            AIONE
          </h1>
          <p className="font-display text-sm text-[hsl(174,100%,50%)] tracking-[0.3em] mb-6">
            AI GATEWAY
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="font-display text-[10px] text-muted-foreground">MODÈLES</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-[hsl(142,76%,50%)]">{stats.free}</p>
              <p className="font-display text-[10px] text-muted-foreground">GRATUITS</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-[hsl(320,100%,60%)]">{stats.categories}</p>
              <p className="font-display text-[10px] text-muted-foreground">CATÉGORIES</p>
            </div>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path}
              className={`${cat.color} flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-transform hover:scale-105`}
            >
              <cat.icon className="h-6 w-6" />
              <span className="font-display text-xs font-bold">{cat.label}</span>
            </Link>
          ))}
        </div>

        {/* Bannière publicitaire G2A/G2G/Kinguin */}
        <PromoBanner />

        {/* Free Models Section - TOUS les modèles gratuits (Tâche 12) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-[hsl(142,76%,50%)]" />
            <h2 className="font-display text-lg text-foreground">MODÈLES GRATUITS</h2>
            <span className="font-display text-xs text-muted-foreground">
              ({stats.free})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {freeModels.map((model) => (
              <div
                key={model.id}
                className="panel-3d p-4 space-y-2 hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xs text-foreground">{model.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{model.provider}</p>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold bg-[hsl(142,76%,50%)/0.2] text-[hsl(142,76%,50%)]">
                    <Zap className="h-2.5 w-2.5" />
                    FREE
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  {model.description}
                </p>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-[hsl(220,15%,18%)] text-muted-foreground uppercase">
                    {model.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[hsl(220,15%,20%)] text-center">
          <p className="font-display text-xs text-muted-foreground">
            <span className="gradient-text-pink">AIONE</span> - AI Gateway • © 2025
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
