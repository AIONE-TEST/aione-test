import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Image, Video, MessageSquare, Music, Wand2, Box, 
  Zap, ArrowRight, Star, AppWindow, Flame, Code, Check
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { aiModels, AIModel } from "@/data/aiModels";
import { sortModelsInCategory } from "@/utils/appSorting";
import { PromoBanner } from "@/components/PromptBanner";
import { AppTileCard } from "@/components/AppTileCard";
import { APIKeyModal } from "@/components/APIKeyModal";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categories = [
  { id: "llms", label: "LLMS", icon: MessageSquare, path: "/llms", color: "btn-3d-pink" },
  { id: "images", label: "IMAGES", icon: Image, path: "/images", color: "btn-3d-pink" },
  { id: "videos", label: "VIDÉOS", icon: Video, path: "/videos", color: "btn-3d-purple" },
  { id: "audio", label: "AUDIO", icon: Music, path: "/audio", color: "btn-3d-yellow" },
  { id: "retouch", label: "RETOUCH", icon: Wand2, path: "/retouch", color: "btn-3d-cyan" },
  { id: "3d", label: "3D", icon: Box, path: "/3d", color: "btn-3d-green" },
];

// Catégories pour l'affichage par section (même ordre que APPLIS IA)
const categoryConfigs = [
  { 
    id: "activated", 
    label: "APPLIS ACTIVÉES", 
    icon: <Check className="h-5 w-5" />, 
    color: "text-[hsl(142,76%,50%)]", 
    bgColor: "bg-[hsl(142,76%,50%)]/10", 
    borderColor: "border-[hsl(142,76%,50%)]/30",
  },
  { 
    id: "videos", 
    label: "VIDÉOS", 
    icon: <Video className="h-5 w-5" />, 
    color: "text-[hsl(280,100%,65%)]", 
    bgColor: "bg-[hsl(280,100%,65%)]/10", 
    borderColor: "border-[hsl(280,100%,65%)]/30",
  },
  { 
    id: "images", 
    label: "IMAGES", 
    icon: <Image className="h-5 w-5" />, 
    color: "text-[hsl(320,100%,60%)]", 
    bgColor: "bg-[hsl(320,100%,60%)]/10", 
    borderColor: "border-[hsl(320,100%,60%)]/30",
  },
  { 
    id: "retouch", 
    label: "RETOUCHES", 
    icon: <Wand2 className="h-5 w-5" />, 
    color: "text-[hsl(45,100%,55%)]", 
    bgColor: "bg-[hsl(45,100%,55%)]/10", 
    borderColor: "border-[hsl(45,100%,55%)]/30",
  },
  { 
    id: "adult", 
    label: "CONTENU ADULTE", 
    icon: <Flame className="h-5 w-5" />, 
    color: "text-[hsl(0,100%,60%)]", 
    bgColor: "bg-[hsl(0,100%,60%)]/10", 
    borderColor: "border-[hsl(0,100%,60%)]/30",
  },
  { 
    id: "audio", 
    label: "MUSIQUE", 
    icon: <Music className="h-5 w-5" />, 
    color: "text-[hsl(25,100%,55%)]", 
    bgColor: "bg-[hsl(25,100%,55%)]/10", 
    borderColor: "border-[hsl(25,100%,55%)]/30",
  },
  { 
    id: "llms", 
    label: "CHAT IA", 
    icon: <MessageSquare className="h-5 w-5" />, 
    color: "text-[hsl(200,100%,55%)]", 
    bgColor: "bg-[hsl(200,100%,55%)]/10", 
    borderColor: "border-[hsl(200,100%,55%)]/30",
  },
  { 
    id: "3d", 
    label: "3D", 
    icon: <Box className="h-5 w-5" />, 
    color: "text-[hsl(160,100%,50%)]", 
    bgColor: "bg-[hsl(160,100%,50%)]/10", 
    borderColor: "border-[hsl(160,100%,50%)]/30",
  },
  { 
    id: "code", 
    label: "CODAGE", 
    icon: <Code className="h-5 w-5" />, 
    color: "text-[hsl(210,100%,60%)]", 
    bgColor: "bg-[hsl(210,100%,60%)]/10", 
    borderColor: "border-[hsl(210,100%,60%)]/30",
  },
];

const Index = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");

  // Scroll en haut de page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // TOUS les modèles avec statut (même liste que APPLIS IA)
  const allModels = useMemo(() => {
    return getModelsWithStatus(aiModels);
  }, [getModelsWithStatus]);

  const stats = useMemo(() => {
    const total = allModels.length;
    const free = allModels.filter((m) => m.isFree).length;
    const categoriesSet = new Set(allModels.map((m) => m.category));
    return { total, free, categories: categoriesSet.size };
  }, [allModels]);

  // Grouper les modèles par catégorie (même ordre que APPLIS IA)
  const modelsByCategory = useMemo(() => {
    const grouped: Record<string, AIModel[]> = {};
    
    categoryConfigs.forEach(cat => {
      if (cat.id === "activated") {
        grouped[cat.id] = sortModelsInCategory(
          allModels.filter(m => m.apiStatus === "active" || m.isFree)
        );
      } else {
        grouped[cat.id] = sortModelsInCategory(
          allModels.filter(m => m.category === cat.id)
        );
      }
    });
    
    return grouped;
  }, [allModels]);

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

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

        {/* TOUS les modèles par catégorie (même ordre que APPLIS IA) */}
        <div className="space-y-6">
          {categoryConfigs.map((catConfig) => {
            const models = modelsByCategory[catConfig.id] || [];
            if (models.length === 0) return null;
            
            return (
              <div 
                key={catConfig.id}
                className={cn(
                  "rounded-xl p-4 border",
                  catConfig.bgColor,
                  catConfig.borderColor
                )}
              >
                {/* Section Title */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={catConfig.color}>{catConfig.icon}</span>
                  <h2 className={cn("font-display text-sm font-bold", catConfig.color)}>
                    {catConfig.label}
                  </h2>
                  <Badge className={cn("text-[10px]", catConfig.bgColor, catConfig.color)}>
                    {models.length}
                  </Badge>
                </div>

                {/* Models Grid - 5 par ligne */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {models.map((model) => (
                    <AppTileCard
                      key={model.id}
                      model={model}
                      viewMode="grid"
                      onOpenAPIKeyModal={handleOpenAPIKeyModal}
                      onClick={() => {}}
                      horizontal
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[hsl(220,15%,20%)] text-center">
          <p className="font-display text-xs text-muted-foreground">
            <span className="gradient-text-pink">AIONE</span> - AI Gateway • © 2025
          </p>
          <Link to="/cgu" className="text-xs text-muted-foreground hover:text-[hsl(174,100%,50%)] transition-colors">
            Conditions Générales d'Utilisation
          </Link>
        </footer>
      </main>

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
      />
    </div>
  );
};

export default Index;
