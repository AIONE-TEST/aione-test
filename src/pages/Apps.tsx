import { useState, useMemo } from "react";
import { AppWindow, Sparkles, ExternalLink, Key, Check, Zap, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelGrid } from "@/components/ModelGrid";
import { AIModel, aiModels, apiConfigs } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APIKeyModal } from "@/components/APIKeyModal";
import { getModelLogo } from "@/data/modelLogos";
import { Card } from "@/components/ui/card";

const Apps = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get all models grouped by category
  const allModels = useMemo(() => {
    return getModelsWithStatus(aiModels);
  }, [getModelsWithStatus]);

  const categories = [
    { id: "all", label: "Toutes", count: allModels.length },
    { id: "images", label: "Images", count: allModels.filter(m => m.category === "images").length },
    { id: "videos", label: "Vidéos", count: allModels.filter(m => m.category === "videos").length },
    { id: "llms", label: "LLMs", count: allModels.filter(m => m.category === "llms").length },
    { id: "audio", label: "Audio", count: allModels.filter(m => m.category === "audio").length },
    { id: "3d", label: "3D", count: allModels.filter(m => m.category === "3d").length },
    { id: "retouch", label: "Retouche", count: allModels.filter(m => m.category === "retouch").length },
    { id: "code", label: "Code", count: allModels.filter(m => m.category === "code").length },
  ];

  const filteredModels = useMemo(() => {
    if (selectedCategory === "all") return allModels;
    return allModels.filter(m => m.category === selectedCategory);
  }, [allModels, selectedCategory]);

  const stats = useMemo(() => {
    const free = filteredModels.filter(m => m.isFree).length;
    const active = filteredModels.filter(m => m.apiStatus === "active").length;
    const inactive = filteredModels.filter(m => !m.isFree && m.apiStatus === "inactive").length;
    return { free, active, inactive };
  }, [filteredModels]);

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-40 min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(174,100%,50%)]/20">
                <AppWindow className="h-5 w-5 text-[hsl(174,100%,50%)]" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold gradient-text-cyan">
                  Applications IA No-Code
                </h1>
                <p className="text-sm text-muted-foreground">
                  Toutes les applications IA disponibles • <span className="text-[hsl(var(--primary))]">{filteredModels.length} applications</span>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Card className="px-4 py-2 bg-[hsl(142,76%,50%)]/10 border-[hsl(142,76%,50%)]/30">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[hsl(142,76%,50%)]" />
                  <span className="text-sm font-medium text-[hsl(142,76%,50%)]">{stats.free} Gratuits</span>
                </div>
              </Card>
              <Card className="px-4 py-2 bg-[hsl(174,100%,50%)]/10 border-[hsl(174,100%,50%)]/30">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[hsl(174,100%,50%)]" />
                  <span className="text-sm font-medium text-[hsl(174,100%,50%)]">{stats.active} Actifs</span>
                </div>
              </Card>
              <Card className="px-4 py-2 bg-muted/50 border-border/50">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{stats.inactive} Non configurés</span>
                </div>
              </Card>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id 
                    ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30 hover:bg-[hsl(var(--primary))]/30" 
                    : ""}
                >
                  {cat.label}
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {cat.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Models Grid */}
          <ModelGrid
            models={filteredModels}
            category={selectedCategory as any}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </main>

      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
      />
    </div>
  );
};

export default Apps;
