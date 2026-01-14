import { useState, useMemo } from "react";
import { 
  Key, ExternalLink, Check, X, Search, Plus, RefreshCw, 
  List, Grid3X3, Flame, Zap, Globe, ExternalLinkIcon,
  ChevronDown, ChevronUp, Image, Video, Music, Wand2, Box,
  MessageSquare, Sparkles
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { APIKeyValidationModal } from "@/components/APIKeyValidationModal";
import { AdultDisclaimerModal } from "@/components/AdultDisclaimerModal";
import { StatusLED } from "@/components/StatusLED";
import { VintageStamp } from "@/components/VintageStamp";
import { MultiCategoryIcons } from "@/components/CategoryIcon";
import { apiConfigs, aiModels, APIConfig, AIModel } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Platforms All-in-One
const allInOnePlatforms = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Accès à 100+ modèles avec une seule clé API",
    apiUrl: "https://openrouter.ai/keys",
    docsUrl: "https://openrouter.ai/docs",
    officialUrl: "https://openrouter.ai",
    modelsCount: "100+",
    badges: ["ALL-IN-ONE", "🔥"]
  },
  {
    id: "replicate",
    name: "Replicate",
    description: "Images, vidéos, audio, LLMs",
    apiUrl: "https://replicate.com/account/api-tokens",
    docsUrl: "https://replicate.com/docs",
    officialUrl: "https://replicate.com",
    modelsCount: "1000+",
    badges: ["ALL-IN-ONE"]
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Hub de modèles AI",
    apiUrl: "https://huggingface.co/settings/tokens",
    docsUrl: "https://huggingface.co/docs/api-inference",
    officialUrl: "https://huggingface.co",
    modelsCount: "10000+",
    badges: ["OPEN SOURCE"]
  },
  {
    id: "fal",
    name: "fal.ai",
    description: "Génération rapide FLUX, SD",
    apiUrl: "https://fal.ai/dashboard/keys",
    docsUrl: "https://fal.ai/docs",
    officialUrl: "https://fal.ai",
    modelsCount: "30+",
    badges: ["FAST"]
  },
  {
    id: "lmarena",
    name: "LM Arena",
    description: "Comparez les LLMs",
    apiUrl: "https://chat.lmsys.org",
    docsUrl: "https://lmsys.org",
    officialUrl: "https://chat.lmsys.org",
    modelsCount: "40+",
    badges: ["FREE", "BENCHMARK"]
  },
];

// Category definitions with colors
const categories = [
  { id: "activated", label: "APPLIS ACTIVÉES", icon: <Check className="h-6 w-6" />, color: "hsl(142,76%,50%)", bgClass: "bg-[hsl(142,76%,50%)]/20", textClass: "text-[hsl(142,76%,50%)]" },
  { id: "free", label: "GRATUITS", icon: <Sparkles className="h-6 w-6" />, color: "hsl(45,100%,55%)", bgClass: "bg-[hsl(45,100%,55%)]/20", textClass: "text-[hsl(45,100%,55%)]" },
  { id: "image-video", label: "IMAGE & VIDÉO", icon: <Video className="h-6 w-6" />, color: "hsl(280,100%,65%)", bgClass: "bg-[hsl(280,100%,65%)]/20", textClass: "text-[hsl(280,100%,65%)]" },
  { id: "images", label: "IMAGES", icon: <Image className="h-6 w-6" />, color: "hsl(320,100%,60%)", bgClass: "bg-[hsl(320,100%,60%)]/20", textClass: "text-[hsl(320,100%,60%)]" },
  { id: "retouch", label: "RETOUCHE", icon: <Wand2 className="h-6 w-6" />, color: "hsl(174,100%,50%)", bgClass: "bg-[hsl(174,100%,50%)]/20", textClass: "text-[hsl(174,100%,50%)]" },
  { id: "audio", label: "AUDIO", icon: <Music className="h-6 w-6" />, color: "hsl(45,100%,55%)", bgClass: "bg-[hsl(45,100%,55%)]/20", textClass: "text-[hsl(45,100%,55%)]" },
  { id: "3d", label: "3D", icon: <Box className="h-6 w-6" />, color: "hsl(142,76%,50%)", bgClass: "bg-[hsl(142,76%,50%)]/20", textClass: "text-[hsl(142,76%,50%)]" },
  { id: "llms", label: "LLMS", icon: <MessageSquare className="h-6 w-6" />, color: "hsl(174,100%,50%)", bgClass: "bg-[hsl(174,100%,50%)]/20", textClass: "text-[hsl(174,100%,50%)]" },
  { id: "uncensored", label: "ADULTES +18", icon: <Flame className="h-6 w-6" />, color: "hsl(25,100%,55%)", bgClass: "bg-[hsl(25,100%,55%)]/20", textClass: "text-[hsl(25,100%,55%)]" },
];

type ViewMode = "list" | "grid";
type CategoryFilter = string;

const APIKeys = () => {
  const { configuredAPIs, refetch } = useAPIStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [adultDisclaimerOpen, setAdultDisclaimerOpen] = useState(false);
  const [pendingAdultService, setPendingAdultService] = useState<string>("");
  const [showAllInOne, setShowAllInOne] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  // Get all unique API services from models
  const apiServices = useMemo(() => {
    const servicesMap = new Map<string, { 
      config: APIConfig; 
      modelsCount: number; 
      isConfigured: boolean;
      models: AIModel[];
      isAdult: boolean;
      categories: string[];
      isFree: boolean;
    }>();

    aiModels.forEach((model) => {
      const apiKeyName = model.apiKeyName || model.provider.toLowerCase().replace(/\s+/g, '');
      const isAdult = model.category === 'uncensored' || model.badges.includes('+18') || model.badges.includes('🔓');
      const isFree = model.isFree || model.apiStatus === 'free';
      
      const existing = servicesMap.get(apiKeyName);
      if (existing) {
        existing.modelsCount++;
        existing.models.push(model);
        if (isAdult) existing.isAdult = true;
        if (isFree) existing.isFree = true;
        if (!existing.categories.includes(model.category)) {
          existing.categories.push(model.category);
        }
      } else {
        const config = apiConfigs[apiKeyName] || {
          serviceName: model.provider,
          officialUrl: model.officialUrl,
          apiUrl: model.apiUrl,
          docsUrl: model.docsUrl,
          apiKeyPlaceholder: "Votre clé API...",
          instructions: `1. Visitez ${model.officialUrl}\n2. Créez un compte\n3. Générez une clé API`
        };
        
        servicesMap.set(apiKeyName, {
          config,
          modelsCount: 1,
          isConfigured: configuredAPIs.includes(apiKeyName.toLowerCase()),
          models: [model],
          isAdult,
          categories: [model.category],
          isFree,
        });
      }
    });

    return Array.from(servicesMap.entries())
      .map(([key, value]) => ({
        key,
        ...value,
        isConfigured: configuredAPIs.includes(key.toLowerCase()),
      }))
      .sort((a, b) => {
        if (a.isConfigured && !b.isConfigured) return -1;
        if (!a.isConfigured && b.isConfigured) return 1;
        return a.config.serviceName.localeCompare(b.config.serviceName);
      });
  }, [configuredAPIs]);

  // Filter by category and search
  const filteredServices = useMemo(() => {
    let filtered = apiServices;
    
    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((s) => {
        switch (selectedCategory) {
          case "activated": return s.isConfigured;
          case "free": return s.isFree;
          case "image-video": return s.categories.includes("images") || s.categories.includes("videos");
          case "images": return s.categories.includes("images");
          case "retouch": return s.categories.includes("retouch");
          case "audio": return s.categories.includes("audio");
          case "3d": return s.categories.includes("3d");
          case "llms": return s.categories.includes("llms");
          case "uncensored": return s.isAdult;
          default: return true;
        }
      });
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.config.serviceName.toLowerCase().includes(query) ||
          s.key.toLowerCase().includes(query) ||
          s.models.some((m) => m.name.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [apiServices, selectedCategory, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = apiServices.length;
    const configured = apiServices.filter((s) => s.isConfigured).length;
    const free = apiServices.filter((s) => s.isFree).length;
    const adult = apiServices.filter((s) => s.isAdult).length;
    return { total, configured, free, adult };
  }, [apiServices]);

  const handleOpenAPIKeyModal = (apiKeyName: string, isAdult: boolean = false) => {
    if (isAdult) {
      setPendingAdultService(apiKeyName);
      setAdultDisclaimerOpen(true);
    } else {
      setSelectedApiKeyName(apiKeyName);
      setApiKeyModalOpen(true);
    }
  };

  const handleAdultAccepted = () => {
    setAdultDisclaimerOpen(false);
    setSelectedApiKeyName(pendingAdultService);
    setApiKeyModalOpen(true);
    setPendingAdultService("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[280px] min-h-screen p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] glow-yellow">
                <Key className="h-10 w-10 text-black" />
              </div>
              <div>
                <h1 className="font-display text-4xl font-black gradient-text-yellow text-glow-yellow tracking-wider">
                  GESTION DES CLÉS API
                </h1>
                <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                  CONFIGUREZ VOS CLÉS POUR ACTIVER LES APPLICATIONS IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-xl border-2 border-[hsl(220,15%,25%)] overflow-hidden">
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-none px-5 py-3",
                    viewMode === "list" && "bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)]"
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-none px-5 py-3",
                    viewMode === "grid" && "bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)]"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-6 w-6" />
                </Button>
              </div>

              <Button
                onClick={() => refetch()}
                className="gap-3 btn-3d-cyan font-display text-base px-6 py-3 h-auto"
              >
                <RefreshCw className="h-5 w-5" />
                ACTUALISER
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-8">
            <Card className="px-6 py-4 panel-3d border-[hsl(174,100%,50%)]/30">
              <div className="flex items-center gap-3">
                <Globe className="h-7 w-7 text-[hsl(174,100%,50%)]" />
                <span className="font-display text-3xl font-black text-[hsl(174,100%,50%)]">{stats.total}</span>
                <span className="text-base text-muted-foreground font-display">SERVICES</span>
              </div>
            </Card>
            <Card className="px-6 py-4 panel-3d border-[hsl(142,76%,50%)]/30">
              <div className="flex items-center gap-3">
                <StatusLED isActive={true} size="lg" />
                <span className="font-display text-3xl font-black text-[hsl(142,76%,50%)]">{stats.configured}</span>
                <span className="text-base text-muted-foreground font-display">ACTIVÉES</span>
              </div>
            </Card>
            <Card className="px-6 py-4 panel-3d border-[hsl(45,100%,55%)]/30">
              <div className="flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-[hsl(45,100%,55%)]" />
                <span className="font-display text-3xl font-black text-[hsl(45,100%,55%)]">{stats.free}</span>
                <span className="text-base text-muted-foreground font-display">GRATUITS</span>
              </div>
            </Card>
            <Card className="px-6 py-4 panel-3d border-[hsl(25,100%,55%)]/30">
              <div className="flex items-center gap-3">
                <Flame className="h-7 w-7 text-[hsl(25,100%,55%)]" />
                <span className="font-display text-3xl font-black text-[hsl(25,100%,55%)]">{stats.adult}</span>
                <span className="text-base text-muted-foreground font-display">ADULTES</span>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-lg mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              id="api-search"
              name="api-search"
              placeholder="RECHERCHER UN SERVICE, MODÈLE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-3d pl-14 py-4 h-auto text-lg font-display tracking-wide"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "font-display text-base tracking-wider px-5 py-3 h-auto gap-2",
                selectedCategory === "all" ? "btn-3d-cyan" : "btn-3d"
              )}
            >
              <Globe className="h-5 w-5" />
              TOUS
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "font-display text-sm tracking-wider px-4 py-3 h-auto gap-2",
                  selectedCategory === cat.id 
                    ? `bg-[${cat.color}]/30 border-[${cat.color}] ${cat.textClass}` 
                    : "btn-3d"
                )}
                style={selectedCategory === cat.id ? {
                  background: `linear-gradient(180deg, ${cat.color}40 0%, ${cat.color}20 100%)`,
                  borderColor: cat.color,
                  boxShadow: `0 0 20px ${cat.color}40`
                } : undefined}
              >
                {cat.icon}
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* All-in-One Platforms Section */}
        <div className="mb-10">
          <button
            onClick={() => setShowAllInOne(!showAllInOne)}
            className="flex items-center gap-4 mb-6 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(280,100%,65%)]/20">
              <Zap className="h-6 w-6 text-[hsl(280,100%,65%)]" />
            </div>
            <h2 className="font-display text-2xl font-bold gradient-text-purple tracking-wider">
              PLATEFORMES ALL-IN-ONE
            </h2>
            <Badge variant="secondary" className="text-base px-3 py-1 font-display">
              {allInOnePlatforms.length}
            </Badge>
            {showAllInOne ? (
              <ChevronUp className="h-6 w-6 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-6 w-6 text-muted-foreground" />
            )}
          </button>

          {showAllInOne && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {allInOnePlatforms.map((platform) => (
                <Card
                  key={platform.id}
                  className="panel-3d p-5 border-[hsl(280,100%,65%)]/20 hover:border-[hsl(280,100%,65%)]/50 transition-all duration-300"
                >
                  <h3 className="font-display text-lg font-bold gradient-text-purple mb-2">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {platform.description}
                  </p>
                  <Badge variant="secondary" className="text-sm mb-3 font-display">
                    {platform.modelsCount}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 btn-3d-purple text-sm h-10 gap-2 font-display"
                      asChild
                    >
                      <a href={platform.apiUrl} target="_blank" rel="noopener noreferrer">
                        <Key className="h-4 w-4" />
                        OBTENIR
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* API Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredServices.map((service) => (
            <Card
              key={service.key}
              className={cn(
                "panel-3d p-5 flex flex-col transition-all duration-300 hover:scale-[1.02] relative",
                service.isConfigured 
                  ? "border-[hsl(142,76%,50%)]/40" 
                  : "border-[hsl(220,15%,25%)]",
                service.isAdult && "border-[hsl(25,100%,55%)]/40"
              )}
            >
              {/* LED Indicator - Top Right */}
              <div className="absolute top-3 right-3">
                <StatusLED isActive={service.isConfigured} size="md" />
              </div>

              {/* Vintage Stamp for activated */}
              {service.isConfigured && (
                <div className="absolute -top-2 -left-2 transform -rotate-12">
                  <VintageStamp text="OK" />
                </div>
              )}

              {/* Adult flame icon */}
              {service.isAdult && (
                <div className="absolute top-3 left-3">
                  <Flame className="h-6 w-6 text-[hsl(25,100%,55%)] animate-pulse" />
                </div>
              )}

              {/* Service Name */}
              <h3 className="font-display text-lg font-bold mt-8 mb-2 truncate">
                {service.config.serviceName}
              </h3>

              {/* Models Count */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-sm font-display">
                  {service.modelsCount} MODÈLES
                </Badge>
              </div>

              {/* Category Icons */}
              <div className="mb-4">
                <MultiCategoryIcons categories={service.categories} size="sm" />
              </div>

              {/* Free badge */}
              {service.isFree && (
                <Badge className="bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30 text-sm mb-3 font-display self-start">
                  ✨ GRATUIT
                </Badge>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-3">
                <Button
                  className={cn(
                    "flex-1 font-display text-sm h-12 gap-2",
                    service.isConfigured ? "btn-3d-green" : "btn-3d-cyan"
                  )}
                  onClick={() => handleOpenAPIKeyModal(service.key, service.isAdult)}
                >
                  <Plus className="h-5 w-5" />
                  {service.isConfigured ? "MODIFIER" : "AJOUTER"}
                </Button>
                <Button
                  variant="outline"
                  className="btn-3d h-12 w-12 p-0"
                  asChild
                >
                  <a href={service.config.apiUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl text-muted-foreground">
              AUCUN SERVICE TROUVÉ
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <APIKeyValidationModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
        onSuccess={() => refetch()}
      />

      <AdultDisclaimerModal
        isOpen={adultDisclaimerOpen}
        onClose={() => setAdultDisclaimerOpen(false)}
        onAccept={handleAdultAccepted}
        serviceName={pendingAdultService}
      />
    </div>
  );
};

export default APIKeys;
