import { useState, useMemo, useCallback } from "react";
import { AppWindow, Sparkles, ExternalLink, Key, Check, Zap, Flame, Search, LayoutGrid, List, Image, Video, MessageSquare, Music, Wand2, Box, Code } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { AIModel, aiModels, apiConfigs, AICategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APIKeyModal } from "@/components/APIKeyModal";
import { AdultDisclaimerModal } from "@/components/AdultDisclaimerModal";
import { getModelLogo } from "@/data/modelLogos";
import { StatusLED } from "@/components/StatusLED";
import { VintageStamp } from "@/components/VintageStamp";
import { cn } from "@/lib/utils";

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const categoryConfigs: CategoryConfig[] = [
  { id: "all", label: "TOUS", icon: <AppWindow className="h-5 w-5" />, color: "text-[hsl(174,100%,50%)]", bgColor: "bg-[hsl(174,100%,50%)]/10", borderColor: "border-[hsl(174,100%,50%)]/30" },
  { id: "activated", label: "APIS CLÉS OK", icon: <Check className="h-5 w-5" />, color: "text-[hsl(142,76%,50%)]", bgColor: "bg-[hsl(142,76%,50%)]/10", borderColor: "border-[hsl(142,76%,50%)]/30" },
  { id: "images", label: "IMAGES", icon: <Image className="h-5 w-5" />, color: "text-[hsl(320,100%,60%)]", bgColor: "bg-[hsl(320,100%,60%)]/10", borderColor: "border-[hsl(320,100%,60%)]/30" },
  { id: "videos", label: "VIDÉOS", icon: <Video className="h-5 w-5" />, color: "text-[hsl(280,100%,65%)]", bgColor: "bg-[hsl(280,100%,65%)]/10", borderColor: "border-[hsl(280,100%,65%)]/30" },
  { id: "llms", label: "LLMS", icon: <MessageSquare className="h-5 w-5" />, color: "text-[hsl(45,100%,55%)]", bgColor: "bg-[hsl(45,100%,55%)]/10", borderColor: "border-[hsl(45,100%,55%)]/30" },
  { id: "audio", label: "AUDIO", icon: <Music className="h-5 w-5" />, color: "text-[hsl(25,100%,55%)]", bgColor: "bg-[hsl(25,100%,55%)]/10", borderColor: "border-[hsl(25,100%,55%)]/30" },
  { id: "retouch", label: "RETOUCHE", icon: <Wand2 className="h-5 w-5" />, color: "text-[hsl(174,100%,50%)]", bgColor: "bg-[hsl(174,100%,50%)]/10", borderColor: "border-[hsl(174,100%,50%)]/30" },
  { id: "code", label: "CODE", icon: <Code className="h-5 w-5" />, color: "text-[hsl(210,100%,60%)]", bgColor: "bg-[hsl(210,100%,60%)]/10", borderColor: "border-[hsl(210,100%,60%)]/30" },
  { id: "uncensored", label: "SANS CENSURE", icon: <Flame className="h-5 w-5" />, color: "text-[hsl(0,100%,60%)]", bgColor: "bg-[hsl(0,100%,60%)]/10", borderColor: "border-[hsl(0,100%,60%)]/30" },
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
    
    ["images", "videos", "llms", "audio", "retouch", "code", "uncensored"].forEach(cat => {
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
    // Refetch immédiatement les APIs configurées
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

          {/* Category Filters */}
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

        {/* Models Grid */}
        <div className={cn(
          "gap-4",
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" 
            : "flex flex-col"
        )}>
          {filteredModels.map((model) => (
            <AppModelCard
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

interface AppModelCardProps {
  model: AIModel;
  viewMode: "grid" | "list";
  onOpenAPIKeyModal: (apiKeyName: string) => void;
  onClick: () => void;
}

function AppModelCard({ model, viewMode, onOpenAPIKeyModal, onClick }: AppModelCardProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getModelLogo(model.id, model.provider);
  const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;
  const isActive = model.apiStatus === "active" || model.isFree;
  const isUncensored = model.category === "uncensored";

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      images: "text-[hsl(320,100%,60%)]",
      videos: "text-[hsl(280,100%,65%)]",
      llms: "text-[hsl(45,100%,55%)]",
      audio: "text-[hsl(25,100%,55%)]",
      retouch: "text-[hsl(174,100%,50%)]",
      "3d": "text-[hsl(142,76%,50%)]",
      code: "text-[hsl(210,100%,60%)]",
      uncensored: "text-[hsl(0,100%,60%)]",
    };
    return colors[category] || "text-muted-foreground";
  };

  if (viewMode === "list") {
    return (
      <div 
        className="panel-3d p-4 flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all duration-300"
        onClick={onClick}
      >
        <StatusLED isActive={isActive} size="lg" />
        
        <div className="h-12 w-12 rounded-xl bg-muted/50 border border-border/50 overflow-hidden shrink-0">
          {!imageError ? (
            <img
              src={logoUrl}
              alt={model.provider}
              className="h-full w-full object-contain p-2"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground font-display">
              {model.provider.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold truncate tracking-wider">{model.name}</h3>
            {isUncensored && <Flame className="h-4 w-4 text-[hsl(0,100%,60%)]" />}
          </div>
          <p className="text-sm text-muted-foreground truncate font-display">{model.provider}</p>
        </div>

        <div className="flex items-center gap-2">
          {model.isFree && (
            <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 font-display">
              FREE
            </Badge>
          )}
          <Badge variant="outline" className={cn("font-display", getCategoryColor(model.category))}>
            {model.category.toUpperCase()}
          </Badge>
          {model.price && !model.isFree && (
            <span className="text-sm text-[hsl(45,100%,55%)] font-display">{model.price}</span>
          )}
        </div>

        {!isActive && model.apiKeyName && (
          <Button
            size="sm"
            className="btn-3d-orange gap-2 font-display tracking-wider"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAPIKeyModal(model.apiKeyName!);
            }}
          >
            <Key className="h-4 w-4" />
            {model.isFree ? "AJOUTER" : "ACHETER"}
          </Button>
        )}

        {isActive && <VintageStamp />}
      </div>
    );
  }

  // GRID VIEW - Cartes réduites avec logo en haut à droite
  return (
    <div 
      className={cn(
        "panel-3d p-3 flex flex-col cursor-pointer hover:scale-[1.02] transition-all duration-300 relative overflow-hidden",
        !isActive && "opacity-80"
      )}
      onClick={onClick}
      style={{ minHeight: "180px" }}
    >
      {/* Status LED - Top left */}
      <div className="absolute top-2 left-2">
        <StatusLED isActive={isActive} />
      </div>

      {/* Logo - Top right */}
      <div className="absolute top-2 right-2 h-10 w-10 rounded-lg bg-muted/70 border border-border/50 overflow-hidden">
        {!imageError ? (
          <img
            src={logoUrl}
            alt={model.provider}
            className="h-full w-full object-contain p-1"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground font-display">
            {model.provider.charAt(0)}
          </div>
        )}
      </div>

      {/* Flame for uncensored */}
      {isUncensored && (
        <div className="absolute top-14 right-2">
          <Flame className="h-4 w-4 text-[hsl(0,100%,60%)] animate-pulse" />
        </div>
      )}

      {/* Vintage Stamp for active */}
      {isActive && (
        <div className="absolute bottom-12 right-1">
          <VintageStamp />
        </div>
      )}

      {/* Content - Centered */}
      <div className="pt-10 flex flex-col items-center text-center flex-1">
        {/* Name */}
        <h3 className="font-display text-sm font-bold text-foreground mb-1 line-clamp-2 tracking-wider leading-tight">
          {model.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2 font-display">{model.provider}</p>

        {/* Category Badge */}
        <Badge variant="outline" className={cn("text-[10px] mb-2 font-display", getCategoryColor(model.category))}>
          {model.category.toUpperCase()}
        </Badge>

        {/* Free/Price Badge */}
        {model.isFree ? (
          <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-[10px] font-display">
            FREE
          </Badge>
        ) : model.price && (
          <span className="text-[10px] text-[hsl(45,100%,55%)] font-display">{model.price}</span>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-border/30">
        {model.isFree ? (
          <Button
            size="sm"
            className="w-full h-8 text-xs font-bold btn-3d-orange gap-1.5 hover:scale-105 transition-transform font-display tracking-wider"
            onClick={(e) => {
              e.stopPropagation();
              if (model.apiKeyName) onOpenAPIKeyModal(model.apiKeyName);
            }}
          >
            <Zap className="h-3 w-3" />
            AJOUTER
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full h-8 text-xs font-bold btn-3d-purple gap-1.5 hover:scale-105 transition-transform font-display tracking-wider"
            onClick={(e) => {
              e.stopPropagation();
              if (model.apiKeyName) onOpenAPIKeyModal(model.apiKeyName);
            }}
          >
            <Key className="h-3 w-3" />
            ACHETER
          </Button>
        )}
      </div>
    </div>
  );
}

export default Apps;