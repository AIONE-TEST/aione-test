import { useState, useMemo } from "react";
import { 
  Key, ExternalLink, Check, X, Search, Plus, RefreshCw, 
  List, Grid3X3, Flame, Zap, Globe, ExternalLinkIcon,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { APIKeyValidationModal } from "@/components/APIKeyValidationModal";
import { AdultDisclaimerModal } from "@/components/AdultDisclaimerModal";
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
    description: "Accès à 100+ modèles avec une seule clé API. GPT-4, Claude, Llama, etc.",
    apiUrl: "https://openrouter.ai/keys",
    docsUrl: "https://openrouter.ai/docs",
    officialUrl: "https://openrouter.ai",
    modelsCount: "100+",
    badges: ["ALL-IN-ONE", "🔥", "RECOMMENDED"]
  },
  {
    id: "together",
    name: "Together AI",
    description: "Infrastructure IA avec accès à des dizaines de modèles open source.",
    apiUrl: "https://api.together.xyz/settings/api-keys",
    docsUrl: "https://docs.together.ai",
    officialUrl: "https://together.ai",
    modelsCount: "50+",
    badges: ["ALL-IN-ONE", "FAST"]
  },
  {
    id: "replicate",
    name: "Replicate",
    description: "Plateforme de modèles ML. Images, vidéos, audio, LLMs.",
    apiUrl: "https://replicate.com/account/api-tokens",
    docsUrl: "https://replicate.com/docs",
    officialUrl: "https://replicate.com",
    modelsCount: "1000+",
    badges: ["ALL-IN-ONE", "VERSATILE"]
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Hub de modèles AI. Accès API à des milliers de modèles.",
    apiUrl: "https://huggingface.co/settings/tokens",
    docsUrl: "https://huggingface.co/docs/api-inference",
    officialUrl: "https://huggingface.co",
    modelsCount: "10000+",
    badges: ["ALL-IN-ONE", "OPEN SOURCE"]
  },
  {
    id: "fal",
    name: "fal.ai",
    description: "Génération d'images et vidéos rapide. FLUX, SD, vidéo.",
    apiUrl: "https://fal.ai/dashboard/keys",
    docsUrl: "https://fal.ai/docs",
    officialUrl: "https://fal.ai",
    modelsCount: "30+",
    badges: ["ALL-IN-ONE", "FAST", "MEDIA"]
  },
  {
    id: "lmarena",
    name: "LM Arena (Chatbot Arena)",
    description: "Comparez les LLMs en temps réel. Benchmark communautaire.",
    apiUrl: "https://chat.lmsys.org",
    docsUrl: "https://lmsys.org",
    officialUrl: "https://chat.lmsys.org",
    modelsCount: "40+",
    badges: ["BENCHMARK", "FREE", "COMPARE"]
  },
  {
    id: "mammouth",
    name: "Mammouth AI",
    description: "Plateforme française multi-modèles. Interface unifiée.",
    apiUrl: "https://mammouth.ai",
    docsUrl: "https://mammouth.ai/docs",
    officialUrl: "https://mammouth.ai",
    modelsCount: "20+",
    badges: ["FRENCH", "🇫🇷", "ALL-IN-ONE"]
  },
  {
    id: "poe",
    name: "Poe (Quora)",
    description: "Accès à GPT-4, Claude, Gemini et plus via une interface unique.",
    apiUrl: "https://poe.com",
    docsUrl: "https://poe.com/about",
    officialUrl: "https://poe.com",
    modelsCount: "15+",
    badges: ["CHAT", "MULTI-MODEL"]
  },
];

type ViewMode = "list" | "grid";

const APIKeys = () => {
  const { configuredAPIs, refetch } = useAPIStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [adultDisclaimerOpen, setAdultDisclaimerOpen] = useState(false);
  const [pendingAdultService, setPendingAdultService] = useState<string>("");
  const [showAllInOne, setShowAllInOne] = useState(true);

  // Get all unique API services from models - INCLUDING ALL of them
  const apiServices = useMemo(() => {
    const servicesMap = new Map<string, { 
      config: APIConfig; 
      modelsCount: number; 
      isConfigured: boolean;
      models: AIModel[];
      isAdult: boolean;
      categories: string[];
    }>();

    // Go through ALL models and collect their API requirements
    aiModels.forEach((model) => {
      const apiKeyName = model.apiKeyName || model.provider.toLowerCase().replace(/\s+/g, '');
      const isAdult = model.category === 'uncensored' || model.badges.includes('+18') || model.badges.includes('🔓');
      
      const existing = servicesMap.get(apiKeyName);
      if (existing) {
        existing.modelsCount++;
        existing.models.push(model);
        if (isAdult) existing.isAdult = true;
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
          instructions: `1. Visitez ${model.officialUrl}\n2. Créez un compte\n3. Générez une clé API\n4. Collez-la ici`
        };
        
        servicesMap.set(apiKeyName, {
          config,
          modelsCount: 1,
          isConfigured: configuredAPIs.includes(apiKeyName.toLowerCase()),
          models: [model],
          isAdult,
          categories: [model.category],
        });
      }
    });

    // Sort: configured first, then alphabetically
    return Array.from(servicesMap.entries())
      .map(([key, value]) => ({
        key,
        ...value,
        isConfigured: configuredAPIs.includes(key.toLowerCase()),
      }))
      .sort((a, b) => {
        // Configured first
        if (a.isConfigured && !b.isConfigured) return -1;
        if (!a.isConfigured && b.isConfigured) return 1;
        // Then by name
        return a.config.serviceName.localeCompare(b.config.serviceName);
      });
  }, [configuredAPIs]);

  // Filter by search
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return apiServices;
    const query = searchQuery.toLowerCase();
    return apiServices.filter(
      (s) =>
        s.config.serviceName.toLowerCase().includes(query) ||
        s.key.toLowerCase().includes(query) ||
        s.models.some((m) => m.name.toLowerCase().includes(query)) ||
        s.categories.some((c) => c.toLowerCase().includes(query))
    );
  }, [apiServices, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = apiServices.length;
    const configured = apiServices.filter((s) => s.isConfigured).length;
    const notConfigured = total - configured;
    const adult = apiServices.filter((s) => s.isAdult).length;
    return { total, configured, notConfigured, adult };
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      images: "text-[hsl(320,100%,60%)]",
      videos: "text-[hsl(280,100%,65%)]",
      llms: "text-[hsl(174,100%,50%)]",
      audio: "text-[hsl(45,100%,55%)]",
      retouch: "text-[hsl(320,100%,60%)]",
      "3d": "text-[hsl(142,76%,50%)]",
      code: "text-[hsl(215,100%,60%)]",
      uncensored: "text-[hsl(25,100%,55%)]",
    };
    return colors[category] || "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[160px] min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] glow-yellow">
                <Key className="h-7 w-7 text-black" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-black gradient-text-yellow text-glow-yellow tracking-wide">
                  GESTION DES CLÉS API
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configurez vos clés pour activer toutes les applications IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg border border-[hsl(220,15%,25%)] overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none px-3",
                    viewMode === "list" && "bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)]"
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none px-3",
                    viewMode === "grid" && "bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)]"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={() => refetch()}
                className="gap-2 btn-3d font-display text-xs"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Card className="px-4 py-3 panel-3d border-[hsl(174,100%,50%)]/30">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[hsl(174,100%,50%)]" />
                <span className="font-display text-lg font-bold text-[hsl(174,100%,50%)]">{stats.total}</span>
                <span className="text-xs text-muted-foreground">Services</span>
              </div>
            </Card>
            <Card className="px-4 py-3 panel-3d border-[hsl(142,76%,50%)]/30">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[hsl(142,76%,50%)]" />
                <span className="font-display text-lg font-bold text-[hsl(142,76%,50%)]">{stats.configured}</span>
                <span className="text-xs text-muted-foreground">Activées</span>
              </div>
            </Card>
            <Card className="px-4 py-3 panel-3d border-[hsl(215,20%,50%)]/30">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-muted-foreground" />
                <span className="font-display text-lg font-bold">{stats.notConfigured}</span>
                <span className="text-xs text-muted-foreground">Non configurées</span>
              </div>
            </Card>
            <Card className="px-4 py-3 panel-3d border-[hsl(25,100%,55%)]/30">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-[hsl(25,100%,55%)]" />
                <span className="font-display text-lg font-bold text-[hsl(25,100%,55%)]">{stats.adult}</span>
                <span className="text-xs text-muted-foreground">Adultes</span>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service, modèle, catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-3d pl-12 font-display"
            />
          </div>
        </div>

        {/* All-in-One Platforms Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowAllInOne(!showAllInOne)}
            className="flex items-center gap-3 mb-4 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(280,100%,65%)]/20">
              <Zap className="h-4 w-4 text-[hsl(280,100%,65%)]" />
            </div>
            <h2 className="font-display text-lg font-bold gradient-text-purple">
              PLATEFORMES ALL-IN-ONE
            </h2>
            <Badge variant="secondary" className="text-xs">
              {allInOnePlatforms.length} plateformes
            </Badge>
            {showAllInOne ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showAllInOne && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {allInOnePlatforms.map((platform) => (
                <Card
                  key={platform.id}
                  className="panel-3d p-4 border-[hsl(280,100%,65%)]/20 hover:border-[hsl(280,100%,65%)]/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-sm font-bold gradient-text-purple">
                      {platform.name}
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {platform.modelsCount}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {platform.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {platform.badges.map((badge) => (
                      <Badge
                        key={badge}
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 border-[hsl(280,100%,65%)]/30 text-[hsl(280,100%,65%)]"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 btn-3d-purple text-[10px] h-7 gap-1"
                      asChild
                    >
                      <a href={platform.apiUrl} target="_blank" rel="noopener noreferrer">
                        <Key className="h-3 w-3" />
                        Obtenir
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-3d text-[10px] h-7"
                      asChild
                    >
                      <a href={platform.officialUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* API Services */}
        {viewMode === "list" ? (
          <div className="space-y-2">
            {filteredServices.map((service) => (
              <Card
                key={service.key}
                className={cn(
                  "panel-3d p-4 flex items-center justify-between gap-4 transition-all duration-300",
                  service.isConfigured 
                    ? "border-[hsl(142,76%,50%)]/30" 
                    : "border-[hsl(220,15%,25%)]",
                  service.isAdult && "border-[hsl(25,100%,55%)]/30"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Indicator */}
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    service.isConfigured 
                      ? "bg-[hsl(142,76%,50%)]/20" 
                      : "bg-[hsl(220,15%,20%)]"
                  )}>
                    {service.isAdult ? (
                      <Flame className="h-5 w-5 text-[hsl(25,100%,55%)]" />
                    ) : service.isConfigured ? (
                      <Check className="h-5 w-5 text-[hsl(142,76%,50%)]" />
                    ) : (
                      <Key className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-sm font-bold truncate">
                        {service.config.serviceName}
                      </h3>
                      {service.isConfigured && (
                        <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-[10px]">
                          ACTIVE
                        </Badge>
                      )}
                      {service.isAdult && (
                        <Badge className="bg-[hsl(25,100%,55%)]/20 text-[hsl(25,100%,55%)] border-[hsl(25,100%,55%)]/30 text-[10px] gap-1">
                          <Flame className="h-3 w-3" />
                          +18
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{service.modelsCount} modèle{service.modelsCount > 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span className="flex gap-1">
                        {service.categories.slice(0, 3).map((cat) => (
                          <span key={cat} className={getCategoryColor(cat)}>
                            {cat}
                          </span>
                        ))}
                        {service.categories.length > 3 && (
                          <span>+{service.categories.length - 3}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="btn-3d text-xs h-8 gap-1"
                    asChild
                  >
                    <a href={service.config.apiUrl} target="_blank" rel="noopener noreferrer">
                      <Key className="h-3.5 w-3.5" />
                      Clé
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="btn-3d text-xs h-8"
                    asChild
                  >
                    <a href={service.config.docsUrl} target="_blank" rel="noopener noreferrer">
                      Docs
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className={cn(
                      "font-display text-xs h-8 gap-1",
                      service.isConfigured ? "btn-3d-green" : "btn-3d-cyan"
                    )}
                    onClick={() => handleOpenAPIKeyModal(service.key, service.isAdult)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {service.isConfigured ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredServices.map((service) => (
              <Card
                key={service.key}
                className={cn(
                  "panel-3d p-4 flex flex-col transition-all duration-300 hover:scale-[1.02]",
                  service.isConfigured 
                    ? "border-[hsl(142,76%,50%)]/30" 
                    : "border-[hsl(220,15%,25%)]",
                  service.isAdult && "border-[hsl(25,100%,55%)]/30"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    service.isConfigured 
                      ? "bg-[hsl(142,76%,50%)]/20" 
                      : "bg-[hsl(220,15%,20%)]"
                  )}>
                    {service.isAdult ? (
                      <Flame className="h-5 w-5 text-[hsl(25,100%,55%)]" />
                    ) : service.isConfigured ? (
                      <Check className="h-5 w-5 text-[hsl(142,76%,50%)]" />
                    ) : (
                      <Key className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {service.modelsCount}
                  </Badge>
                </div>

                {/* Name */}
                <h3 className="font-display text-sm font-bold mb-1 truncate">
                  {service.config.serviceName}
                </h3>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {service.categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className={cn("text-[10px]", getCategoryColor(cat))}
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Status Badge */}
                {service.isConfigured ? (
                  <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-[10px] mb-3">
                    ✓ ACTIVE
                  </Badge>
                ) : service.isAdult ? (
                  <Badge className="bg-[hsl(25,100%,55%)]/20 text-[hsl(25,100%,55%)] border-[hsl(25,100%,55%)]/30 text-[10px] mb-3 gap-1">
                    <Flame className="h-3 w-3" /> +18
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] mb-3 text-muted-foreground">
                    Non configurée
                  </Badge>
                )}

                {/* Actions */}
                <div className="flex gap-1 mt-auto">
                  <Button
                    size="sm"
                    className="flex-1 btn-3d-cyan text-[10px] h-7 gap-1"
                    onClick={() => handleOpenAPIKeyModal(service.key, service.isAdult)}
                  >
                    <Plus className="h-3 w-3" />
                    {service.isConfigured ? "Edit" : "Add"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="btn-3d text-[10px] h-7"
                    asChild
                  >
                    <a href={service.config.apiUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="font-display text-lg text-muted-foreground">
              Aucun service trouvé
            </p>
            <p className="text-sm text-muted-foreground">
              Essayez un autre terme de recherche
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
