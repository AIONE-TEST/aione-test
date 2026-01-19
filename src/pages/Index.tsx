import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Image, Video, MessageSquare, Music, Wand2, Box, 
  Zap, ArrowRight, Star, Infinity, Clock
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { aiModels, AICategory, categoryLabels, getModelsByCategory, getUnlimitedFreeModels, getLimitedFreeModels } from "@/data/aiModels";

const categories = [
  { id: "llms", label: "LLMS", icon: MessageSquare, path: "/llms", color: "btn-3d-pink" },
  { id: "images", label: "IMAGES", icon: Image, path: "/images", color: "btn-3d-pink" },
  { id: "videos", label: "VIDÉOS", icon: Video, path: "/videos", color: "btn-3d-purple" },
  { id: "audio", label: "AUDIO", icon: Music, path: "/audio", color: "btn-3d-yellow" },
  { id: "retouch", label: "RETOUCH", icon: Wand2, path: "/retouch", color: "btn-3d-cyan" },
  { id: "3d", label: "3D", icon: Box, path: "/3d", color: "btn-3d-green" },
];

// Ordre des catégories tel que dans "applis ia"
const categoryOrder: AICategory[] = ["videos", "images", "retouch", "adult", "audio", "llms", "3d", "code"];

// Couleurs des sections par catégorie
const categoryColors: Record<AICategory, { bg: string; border: string; text: string; badge: string }> = {
  videos: { bg: "bg-[hsl(280,100%,65%)]/5", border: "border-[hsl(280,100%,65%)]/30", text: "text-[hsl(280,100%,65%)]", badge: "bg-[hsl(280,100%,65%)]/20" },
  images: { bg: "bg-[hsl(320,100%,60%)]/5", border: "border-[hsl(320,100%,60%)]/30", text: "text-[hsl(320,100%,60%)]", badge: "bg-[hsl(320,100%,60%)]/20" },
  retouch: { bg: "bg-[hsl(174,100%,50%)]/5", border: "border-[hsl(174,100%,50%)]/30", text: "text-[hsl(174,100%,50%)]", badge: "bg-[hsl(174,100%,50%)]/20" },
  adult: { bg: "bg-[hsl(0,70%,50%)]/5", border: "border-[hsl(0,70%,50%)]/30", text: "text-[hsl(0,70%,50%)]", badge: "bg-[hsl(0,70%,50%)]/20" },
  audio: { bg: "bg-[hsl(25,100%,55%)]/5", border: "border-[hsl(25,100%,55%)]/30", text: "text-[hsl(25,100%,55%)]", badge: "bg-[hsl(25,100%,55%)]/20" },
  llms: { bg: "bg-[hsl(210,100%,60%)]/5", border: "border-[hsl(210,100%,60%)]/30", text: "text-[hsl(210,100%,60%)]", badge: "bg-[hsl(210,100%,60%)]/20" },
  "3d": { bg: "bg-[hsl(142,76%,50%)]/5", border: "border-[hsl(142,76%,50%)]/30", text: "text-[hsl(142,76%,50%)]", badge: "bg-[hsl(142,76%,50%)]/20" },
  code: { bg: "bg-[hsl(45,100%,50%)]/5", border: "border-[hsl(45,100%,50%)]/30", text: "text-[hsl(45,100%,50%)]", badge: "bg-[hsl(45,100%,50%)]/20" },
};

const Index = () => {
  const stats = useMemo(() => {
    const total = aiModels.length;
    const free = aiModels.filter((m) => m.isFree).length;
    const unlimited = aiModels.filter((m) => m.freeType === "unlimited").length;
    const categoriesSet = new Set(aiModels.map((m) => m.category));
    return { total, free, unlimited, categories: categoriesSet.size };
  }, []);

  // Modèles gratuits illimités (en premier)
  const unlimitedFreeModels = useMemo(() => getUnlimitedFreeModels(), []);
  
  // Modèles gratuits limités (en second)
  const limitedFreeModels = useMemo(() => getLimitedFreeModels(), []);

  // Grouper les modèles par catégorie (non-free inclus)
  const modelsByCategory = useMemo(() => {
    const result: Record<AICategory, typeof aiModels> = {} as any;
    for (const cat of categoryOrder) {
      result[cat] = getModelsByCategory(cat);
    }
    return result;
  }, []);

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
              <p className="font-display text-3xl font-bold text-[hsl(142,76%,50%)]">{stats.unlimited}</p>
              <p className="font-display text-[10px] text-muted-foreground">ILLIMITÉS</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-[hsl(45,100%,50%)]">{stats.free}</p>
              <p className="font-display text-[10px] text-muted-foreground">GRATUITS</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-[hsl(320,100%,60%)]">{stats.categories}</p>
              <p className="font-display text-[10px] text-muted-foreground">CATÉGORIES</p>
            </div>
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

        {/* 1. MODÈLES GRATUITS + ILLIMITÉS - Toujours en premier */}
        <div className="space-y-4 mb-8 p-4 rounded-xl border bg-[hsl(142,76%,50%)]/5 border-[hsl(142,76%,50%)]/30">
          <div className="flex items-center gap-3">
            <Infinity className="h-5 w-5 text-[hsl(142,76%,50%)]" />
            <h2 className="font-display text-lg font-bold text-[hsl(142,76%,50%)]">MODÈLES GRATUITS + ILLIMITÉS</h2>
            <span className="font-display text-xs text-muted-foreground">
              ({unlimitedFreeModels.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {unlimitedFreeModels.map((model) => (
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
                    <Infinity className="h-2.5 w-2.5" />
                    ILLIMITÉ
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

        {/* 2. MODÈLES GRATUITS / LIMITÉS - En second */}
        <div className="space-y-4 mb-8 p-4 rounded-xl border bg-[hsl(45,100%,50%)]/5 border-[hsl(45,100%,50%)]/30">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[hsl(45,100%,50%)]" />
            <h2 className="font-display text-lg font-bold text-[hsl(45,100%,50%)]">MODÈLES GRATUITS / LIMITÉS</h2>
            <span className="font-display text-xs text-muted-foreground">
              ({limitedFreeModels.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {limitedFreeModels.map((model) => (
              <div
                key={model.id}
                className="panel-3d p-4 space-y-2 hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xs text-foreground">{model.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{model.provider}</p>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold bg-[hsl(45,100%,50%)/0.2] text-[hsl(45,100%,50%)]">
                    <Zap className="h-2.5 w-2.5" />
                    FREE TIER
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

        {/* All Categories Sections - identique au style "modèles gratuits" */}
        {categoryOrder.map((cat) => {
          const models = modelsByCategory[cat];
          if (!models || models.length === 0) return null;
          
          const colors = categoryColors[cat];
          const label = categoryLabels[cat];

          return (
            <div key={cat} className={`space-y-4 mb-8 p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
              <div className="flex items-center gap-3">
                <h2 className={`font-display text-lg font-bold ${colors.text}`}>{label}</h2>
                <span className="font-display text-xs text-muted-foreground">
                  ({models.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="panel-3d p-4 space-y-2 hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-xs text-foreground">{model.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{model.provider}</p>
                      </div>
                      {model.isFree ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold bg-[hsl(142,76%,50%)/0.2] text-[hsl(142,76%,50%)]">
                          <Zap className="h-2.5 w-2.5" />
                          FREE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-[hsl(25,100%,55%)]/20 text-[hsl(25,100%,55%)]">
                          {model.price || "PREMIUM"}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {model.description}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {model.badges.slice(0, 3).map((badge, i) => (
                        <span key={i} className={`px-1.5 py-0.5 rounded text-[8px] ${colors.badge} ${colors.text}`}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

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
