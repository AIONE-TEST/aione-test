import { useState, useMemo, useCallback } from "react";
import { AppWindow, Sparkles, Key, Check, Zap, Flame, Search, LayoutGrid, List, Image, Video, MessageSquare, Music, Wand2, Box, Code } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SessionTimer } from "@/components/SessionTimer";
import { AIModel, aiModels } from "@/data/aiModels";
import { sortAIModels, sortModelsInCategory } from "@/utils/appSorting";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APIKeyModal } from "@/components/APIKeyModal";
import { AdultDisclaimerModal } from "@/components/AdultDisclaimerModal";
import { AppDetailModal } from "@/components/AppDetailModal";
import { AppTileCard } from "@/components/AppTileCard";
import { cn } from "@/lib/utils";

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  sectionBg: string;
}

// 8 catégories distinctes avec couleurs différentes et sections
const categoryConfigs: CategoryConfig[] = [
  { 
    id: "all", 
    label: "TOUS", 
    icon: <AppWindow className="h-6 w-6" />, 
    color: "text-[hsl(174,100%,50%)]", 
    bgColor: "bg-[hsl(174,100%,50%)]/10", 
    borderColor: "border-[hsl(174,100%,50%)]/30",
    sectionBg: "bg-gradient-to-br from-[hsl(174,100%,20%)]/20 to-[hsl(174,100%,10%)]/30"
  },
  { 
    id: "activated", 
    label: "APPLIS ACTIVÉES", 
    icon: <Check className="h-6 w-6" />, 
    color: "text-[hsl(142,76%,50%)]", 
    bgColor: "bg-[hsl(142,76%,50%)]/10", 
    borderColor: "border-[hsl(142,76%,50%)]/30",
    sectionBg: "bg-gradient-to-br from-[hsl(142,76%,20%)]/20 to-[hsl(142,76%,10%)]/30"
  },
  { 
    id: "videos", 
    label: "VIDÉOS", 
    icon: <Video className="h-6 w-6" />, 
    color: "text-[hsl(280,100%,65%)]", 
    bgColor: "bg-[hsl(280,100%,65%)]/10", 
    borderColor: "border-[hsl(280,100%,65%)]/30",
    sectionBg: "bg-gradient-to-br from-[hsl(280,100%,25%)]/20 to-[hsl(280,100%,15%)]/30"
  },
  { 
    id: "images", 
    label: "IMAGES", 
    icon: <Image className="h-6 w-6" />, 
    color: "text-[hsl(320,100%,60%)]", 
    bgColor: "bg-[hsl(320,100%,60%)]/10", 
    borderColor: "border-[hsl(320,100%,60%)]/30",
    sectionBg: "bg-gradient-to-br from-[hsl(320,100%,25%)]/20 to-[hsl(320,100%,15%)]/30"
  },
  { 
    id: "retouch", 
    label: "RETOUCHES", 
    icon: <Wand2 className="h-6 w-6" />, 
    color: "text-[hsl(45,100%,55%)]", 
    bgColor: "bg-[hsl(45,100%,55%)]/10", 
    borderColor: "border-[hsl(45,100%,55%)]/30",
    sectionBg: "bg-gradient-to-br from-[hsl(45,100%,25%)]/20 to-[hsl(45,100%,15%)]/30"
  },
  { 
    id: "adult", 
    label: "CONTENU ADULTE", 
    icon: <Flame className="h-6 w-6" />, 
    color: "text-[hsl(0,100%,60%)]", 
    bgColor: "bg-[hsl(0,100%,60%)]/10", 
    borderColor: "border-[hsl(0,100%,60%)]/30",
    sectionBg: "bg-gradient-to-br from-[hsl(0,100%,20%)]/20 to-[hsl(0,100%,10%)]/30"
  },
  { 
    id: "audio", 
    label: "MUSIQUE", 
    icon: <Music className="h-6 w-6" />, 
    color: "text-[hsl(25,100%,55%)]", 
    bgColor: "bg-[hsl(25,100%,55%)]/10", 
    borderColor: "border-[hsl(25,100%,55%)]/30",
    sectionBg: "bg-gradient-to-br from-[hsl(25,100%,25%)]/20 to-[hsl(25,100%,15%)]/30"
  },
  { 
    id: "code", 
    label: "CODAGE", 
    icon: <Code className="h-6 w-6" />, 
    color: "text-[hsl(210,100%,60%)]", 
    bgColor: "bg-[hsl(210,100%,60%)]/10", 
    borderColor: "border-[hsl(210,100%,60%)]/30",
    sectionBg: "bg-gradient-to-br from-[hsl(210,100%,25%)]/20 to-[hsl(210,100%,15%)]/30"
  },
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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailModel, setSelectedDetailModel] = useState<AIModel | null>(null);

  // Get ALL models including those from API Keys
  const allModels = useMemo(() => {
    return getModelsWithStatus(aiModels);
  }, [getModelsWithStatus]);

  // Get category config excluding "all" and "activated" for display
  const displayCategories = useMemo(() => {
    return categoryConfigs.filter(c => c.id !== "all" && c.id !== "activated");
  }, []);

  // Group models by category for sectioned view
  const modelsByCategory = useMemo(() => {
    const grouped: Record<string, AIModel[]> = {};
    
    displayCategories.forEach(cat => {
      let models = allModels.filter(m => m.category === cat.id);
      
      // Apply search filter
      if (searchQuery) {
        models = models.filter(m => 
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.provider.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Sort with priority: video, image, retouch, audio, llms, then unlimited/free first
      models = sortModelsInCategory(models);
      
      grouped[cat.id] = models;
    });
    
    // Also add activated
    let activatedModels = allModels.filter(m => m.apiStatus === "active" || m.isFree);
    if (searchQuery) {
      activatedModels = activatedModels.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    grouped["activated"] = activatedModels;
    
    return grouped;
  }, [allModels, displayCategories, searchQuery]);

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
    } else if (selectedCategory !== "all") {
      result = result.filter(m => m.category === selectedCategory);
    }

    // Sort with priority: video, image, retouch, audio, llms, then unlimited/free first
    return sortAIModels(result);
  }, [allModels, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: allModels.length,
      free: allModels.filter(m => m.isFree).length,
      active: allModels.filter(m => m.apiStatus === "active" || m.isFree).length,
      adult: allModels.filter(m => m.category === "adult").length,
    };
  }, [allModels]);

  const getCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allModels.length,
      activated: allModels.filter(m => m.apiStatus === "active" || m.isFree).length,
    };
    
    ["images", "videos", "audio", "retouch", "code", "adult"].forEach(cat => {
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
    if (model.category === "adult") {
      setPendingAdultModel(model);
      setAdultModalOpen(true);
    } else {
      // Ouvrir le modal de détails pour les apps non-adultes
      setSelectedDetailModel(model);
      setDetailModalOpen(true);
    }
  };

  const handleAdultConfirm = () => {
    setAdultModalOpen(false);
    if (pendingAdultModel) {
      setSelectedDetailModel(pendingAdultModel);
      setDetailModalOpen(true);
    }
    setPendingAdultModel(null);
  };

  // Get current category config
  const currentCategoryConfig = categoryConfigs.find(c => c.id === selectedCategory) || categoryConfigs[0];

  // Render a category section
  const renderCategorySection = (catConfig: CategoryConfig, models: AIModel[]) => {
    if (models.length === 0) return null;
    
    return (
      <div 
        key={catConfig.id}
        className={cn(
          "rounded-2xl p-6 mb-6 border-2",
          catConfig.sectionBg,
          catConfig.borderColor
        )}
      >
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-6">
          <span className={catConfig.color}>
            {catConfig.icon}
          </span>
          <h2 className={cn(
            "font-display text-2xl font-black tracking-wider",
            catConfig.color
          )}>
            {catConfig.label}
          </h2>
          <Badge className={cn(
            "font-display",
            catConfig.bgColor,
            catConfig.color
          )}>
            {models.length} APPLIS
          </Badge>
        </div>

        {/* Models Grid - Max 4 per row, horizontal cards */}
        <div className={cn(
          viewMode === "list" 
            ? "flex flex-col gap-3" 
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        )}>
          {models.map((model) => (
            <AppTileCard
              key={model.id}
              model={model}
              viewMode={viewMode}
              onOpenAPIKeyModal={handleOpenAPIKeyModal}
              onClick={() => handleModelClick(model)}
              horizontal
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-6">
        {/* Header with Session Timer */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
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
            
            {/* Session Timer */}
            <SessionTimer />
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
                <span className="font-display text-3xl font-black text-[hsl(0,100%,55%)]">{stats.adult}</span>
                <p className="text-sm text-muted-foreground mt-1 font-display tracking-wider">CONTENU ADULTE</p>
              </div>
              <div className="panel-3d p-4 text-center">
                <span className="font-display text-3xl font-black text-[hsl(280,100%,65%)]">{displayCategories.length}</span>
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
              {selectedCategory === "all" ? allModels.length : filteredModels.length} RÉSULTATS
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

        {/* Content Area - Vertical Scrolling */}
        <div className="space-y-6 overflow-y-auto">
          {selectedCategory === "all" ? (
            // TOUS selected: Show all categories in separate colored sections
            <>
              {/* First show activated apps */}
              {modelsByCategory["activated"]?.length > 0 && (
                renderCategorySection(
                  categoryConfigs.find(c => c.id === "activated")!,
                  modelsByCategory["activated"]
                )
              )}
              
              {/* Then show each category separately */}
              {displayCategories.map(catConfig => (
                renderCategorySection(catConfig, modelsByCategory[catConfig.id] || [])
              ))}
            </>
          ) : (
            // Specific category selected
            <div className={cn(
              "rounded-2xl p-6 mb-6 border-2",
              currentCategoryConfig.sectionBg,
              currentCategoryConfig.borderColor
            )}>
              {/* Section Title */}
              <div className="flex items-center gap-3 mb-6">
                <span className={currentCategoryConfig.color}>
                  {currentCategoryConfig.icon}
                </span>
                <h2 className={cn(
                  "font-display text-2xl font-black tracking-wider",
                  currentCategoryConfig.color
                )}>
                  {currentCategoryConfig.label}
                </h2>
                <Badge className={cn(
                  "font-display",
                  currentCategoryConfig.bgColor,
                  currentCategoryConfig.color
                )}>
                  {filteredModels.length} APPLIS
                </Badge>
              </div>

              {/* Models Grid - Max 4 per row, horizontal cards */}
              <div className={cn(
                viewMode === "list" 
                  ? "flex flex-col gap-3" 
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              )}>
                {filteredModels.map((model) => (
                  <AppTileCard
                    key={model.id}
                    model={model}
                    viewMode={viewMode}
                    onOpenAPIKeyModal={handleOpenAPIKeyModal}
                    onClick={() => handleModelClick(model)}
                    horizontal
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
            </div>
          )}
        </div>
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

      <AppDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        model={selectedDetailModel}
      />
    </div>
  );
};

export default Apps;