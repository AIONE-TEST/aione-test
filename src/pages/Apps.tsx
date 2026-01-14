import { useState, useMemo, useCallback } from "react";
import { AppWindow, Sparkles, Key, Check, Zap, Flame, Search, LayoutGrid, List, Image, Video, MessageSquare, Music, Wand2, Box, Code } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { AIModel, aiModels } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APIKeyModal } from "@/components/APIKeyModal";
import { AdultDisclaimerModal } from "@/components/AdultDisclaimerModal";
import { AppTileCard } from "@/components/AppTileCard";
import { cn } from "@/lib/utils";

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

// 8 catégories distinctes avec couleurs différentes
const categoryConfigs: CategoryConfig[] = [
  { id: "all", label: "TOUS", icon: <AppWindow className="h-6 w-6" />, color: "text-[hsl(174,100%,50%)]", bgColor: "bg-[hsl(174,100%,50%)]/10", borderColor: "border-[hsl(174,100%,50%)]/30" },
  { id: "activated", label: "APPLIS OK", icon: <Check className="h-6 w-6" />, color: "text-[hsl(142,76%,50%)]", bgColor: "bg-[hsl(142,76%,50%)]/10", borderColor: "border-[hsl(142,76%,50%)]/30" },
  { id: "videos", label: "VIDÉOS", icon: <Video className="h-6 w-6" />, color: "text-[hsl(280,100%,65%)]", bgColor: "bg-[hsl(280,100%,65%)]/10", borderColor: "border-[hsl(280,100%,65%)]/30" },
  { id: "images", label: "IMAGES", icon: <Image className="h-6 w-6" />, color: "text-[hsl(320,100%,60%)]", bgColor: "bg-[hsl(320,100%,60%)]/10", borderColor: "border-[hsl(320,100%,60%)]/30" },
  { id: "retouch", label: "RETOUCHES", icon: <Wand2 className="h-6 w-6" />, color: "text-[hsl(45,100%,55%)]", bgColor: "bg-[hsl(45,100%,55%)]/10", borderColor: "border-[hsl(45,100%,55%)]/30" },
  { id: "uncensored", label: "SANS CENSURE", icon: <Flame className="h-6 w-6" />, color: "text-[hsl(0,100%,60%)]", bgColor: "bg-[hsl(0,100%,60%)]/10", borderColor: "border-[hsl(0,100%,60%)]/30" },
  { id: "audio", label: "AUDIO", icon: <Music className="h-6 w-6" />, color: "text-[hsl(25,100%,55%)]", bgColor: "bg-[hsl(25,100%,55%)]/10", borderColor: "border-[hsl(25,100%,55%)]/30" },
  { id: "code", label: "CODE", icon: <Code className="h-6 w-6" />, color: "text-[hsl(210,100%,60%)]", bgColor: "bg-[hsl(210,100%,60%)]/10", borderColor: "border-[hsl(210,100%,60%)]/30" },
];

const Apps = () => {
  const { getModelsWithStatus, refetch } = useAPIStatus();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [adultModalOpen, setAdultModalOpen] = useState(false);
  const [pendingAdultModel, setPendingAdultModel] = useState<AIModel | null>(null);

  // Get ALL models including those from API Keys
  const allModels = useMemo(() => {
    return getModelsWithStatus(aiModels);
  }, [getModelsWithStatus]);

  const filteredModels = useMemo(() => {
    let result = allModels;

    // Search filter
    if (searchQuery) {
      result = result.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory === "activated") {
      result = result.filter(m => m.apiStatus === "active" || m.isFree);
    } else if (selectedCategory === "uncensored") {
      result = result.filter(m => m.category === "uncensored");
    } else if (selectedCategory !== "all") {
      result = result.filter(m => m.category === selectedCategory);
    }

    // Sort: activated first, then free, then others
    return result.sort((a, b) => {
      if ((a.apiStatus === "active" || a.isFree) && !(b.apiStatus === "active" || b.isFree)) return -1;
      if (!(a.apiStatus === "active" || a.isFree) && (b.apiStatus === "active" || b.isFree)) return 1;
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return 0;
    });
  }, [allModels, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: allModels.length,
      free: allModels.filter(m => m.isFree).length,
      active: allModels.filter(m => m.apiStatus === "active" || m.isFree).length,
      uncensored: allModels.filter(m => m.category === "uncensored").length,
    };
  }, [allModels]);

  const getCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allModels.length,
      activated: allModels.filter(m => m.apiStatus === "active" || m.isFree).length,
    };
    
    ["images", "videos", "audio", "retouch", "code", "uncensored"].forEach(cat => {
      counts[cat] = allModels.filter(m => m.category === cat).length;
    });
    
    return counts;
  }, [allModels]);

  const handleOpenAPIKeyModal = useCallback((apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  }, []);

  // Callback pour rafraîchir instantanément après activation
  const handleAPIKeySuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleModelClick = (model: AIModel) => {
    if (model.category === "uncensored") {
      setPendingAdultModel(model);
      setAdultModalOpen(true);
    }
  };

  const handleAdultConfirm = () => {
    setAdultModalOpen(false);
    setPendingAdultModel(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[280px] min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(174,100%,50%)] to-[hsl(280,100%,65%)] glow-cyan">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black gradient-text-cyan tracking-wider">
                MEGA API COLLECTION
              </h1>
              <p className="text-lg text-muted-foreground tracking-wide">
                <span className="text-[hsl(var(--primary))] font-bold">{stats.total}</span> SERVICES
              </p>
            </div>
          </div>

          <div className="panel-3d p-6 mb-6">
            <h2 className="font-display text-2xl font-bold text-center mb-4 gradient-text-pink tracking-wider">
              LA PLUS GRANDE BIBLIOTHÈQUE AI
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-6">
              Accédez à <span className="text-[hsl(var(--primary))] font-bold">{stats.total}+</span> générateurs AI. <span className="text-[hsl(142,76%,50%)] font-bold">{stats.free}+</span> gratuits.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="panel-3d p-4 text-center">
                <span className="font-display text-3xl font-black text-[hsl(var(--primary))]">{stats.total}</span>
                <p className="text-sm text-muted-foreground mt-1 font-display tracking-wider">SERVICES</p>
              </div>
              <div className="panel-3d p-4 text-center">
                <span className="font-display text-3xl font-black text-[hsl(142,76%,50%)]">{stats.free}+</span>
                <p className="text-sm text-muted-foreground mt-1 font-display tracking-wider">GRATUITS</p>
              </div>
              <div className="panel-3d p-4 text-center">
                <span className="font-display text-3xl font-black text-[hsl(25,100%,55%)]">{stats.uncensored}</span>
                <p className="text-sm text-muted-foreground mt-1 font-display tracking-wider">SANS CENSURE</p>
              </div>
              <div className="panel-3d p-4 text-center">
                <span className="font-display text-3xl font-black text-[hsl(280,100%,65%)]">{categoryConfigs.length - 2}</span>
                <p className="text-sm text-muted-foreground mt-1 font-display tracking-wider">CATÉGORIES</p>
              </div>
            </div>
          </div>

          {/* Search & View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="RECHERCHER UN SERVICE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-3d pl-10 text-base font-display tracking-wider"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "btn-3d-cyan" : "btn-3d"}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "btn-3d-cyan" : "btn-3d"}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            <Badge className="bg-muted text-muted-foreground border-border text-base px-4 py-2 font-display tracking-wider">
              {filteredModels.length} RÉSULTATS
            </Badge>
          </div>

          {/* 8 Category Filters with distinct colors */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categoryConfigs.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = getCategoryCounts[cat.id] || 0;
              
              return (
                <Button
                  key={cat.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "gap-2 transition-all duration-300 font-display tracking-wider",
                    isSelected 
                      ? cn("scale-105", cat.bgColor, cat.color, cat.borderColor)
                      : "btn-3d hover:scale-102"
                  )}
                >
                  <span className={isSelected ? "" : cat.color}>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <Badge variant="secondary" className="ml-1 h-6 px-2 font-display">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Models Grid - Using AppTileCard */}
        <div className={cn(
          "gap-4",
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" 
            : "flex flex-col"
        )}>
          {filteredModels.map((model) => (
            <AppTileCard
              key={model.id}
              model={model}
              viewMode={viewMode}
              onOpenAPIKeyModal={handleOpenAPIKeyModal}
              onClick={() => handleModelClick(model)}
            />
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground tracking-wider">
              AUCUN RÉSULTAT TROUVÉ
            </p>
          </div>
        )}
      </main>

      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
        onSuccess={handleAPIKeySuccess}
      />

      <AdultDisclaimerModal
        isOpen={adultModalOpen}
        onClose={() => setAdultModalOpen(false)}
        onAccept={handleAdultConfirm}
        serviceName={pendingAdultModel?.name || ""}
      />
    </div>
  );
};

export default Apps;