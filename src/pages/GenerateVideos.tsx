import { useState, useMemo } from "react";
import { Video, Sparkles, Camera, Film, Type, Upload, Zap } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { GenerationCanvas } from "@/components/GenerationCanvas";
import { ModelGrid } from "@/components/ModelGrid";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusLED } from "@/components/StatusLED";

const GenerateVideos = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mode, setMode] = useState<"text-to-video" | "image-to-video">("text-to-video");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("1080p");

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("videos");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const freeModelsCount = models.filter(m => m.isFree).length;

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim()) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 5000);
  };

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const canGenerate = Boolean(selectedModel) && prompt.trim().length > 0;

  const aspectRatios = ["1:1", "4:3", "3:4", "9:16", "16:9", "21:9"];
  const qualities = ["480p", "720p", "1080p", "4K", "8K"];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[280px] min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] glow-purple">
              <Camera className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black gradient-text-pink tracking-wider">
                GÉNÉRATION DE VIDÉOS
              </h1>
              <p className="text-lg text-muted-foreground tracking-wide">
                Créez des vidéos uniques avec l'IA • <span className="text-[hsl(var(--primary))] font-bold">{models.length} modèles</span> disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout - Vertical */}
        <div className="flex flex-col gap-6 max-w-4xl mb-10">
          {/* Canvas */}
          <div className="panel-3d p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <StatusLED isActive={!!selectedModel} size="lg" />
                <span className="font-display text-xl font-bold text-foreground">
                  {selectedModel ? "PRÊT À GÉNÉRER" : "SÉLECTIONNEZ UN MODÈLE"}
                </span>
              </div>
              {selectedModel && (
                <Badge className="bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30 text-sm px-4 py-1">
                  {selectedModel.name}
                </Badge>
              )}
            </div>
            
            <GenerationCanvas
              selectedModel={selectedModel}
              generatedContent={generatedContent}
              isGenerating={isGenerating}
              contentType="video"
            />
          </div>

          {/* Prompt Editor */}
          <div className="panel-3d p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="font-display text-lg font-bold">ÉDITEUR DE PROMPT</span>
            </div>
            
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez la vidéo que vous souhaitez créer... Ex: Un château steampunk avec des engrenages dorés, cinématique 4K"
              className="input-3d min-h-[120px] text-lg resize-none mb-4"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-base px-3 py-1">
                  {freeModelsCount} GRATUITS
                </Badge>
                {canGenerate && (
                  <span className="text-[hsl(142,76%,50%)] font-display text-sm">
                    50 générations restantes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Model Selector & Options */}
          <div className="panel-3d p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[hsl(var(--secondary))]" />
              <span className="font-display text-lg font-bold">MOTEUR DE GÉNÉRATION & OPTIONS</span>
            </div>

            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              category="videos"
              className="w-full mb-6"
            />

            {/* Mode Selection */}
            <div className="space-y-4">
              <div>
                <label className="font-display text-sm text-muted-foreground mb-2 block">
                  MODE DE GÉNÉRATION
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={mode === "text-to-video" ? "default" : "outline"}
                    onClick={() => setMode("text-to-video")}
                    className={mode === "text-to-video" ? "btn-3d-cyan" : "btn-3d"}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Texte → Vidéo
                  </Button>
                  <Button
                    variant={mode === "image-to-video" ? "default" : "outline"}
                    onClick={() => setMode("image-to-video")}
                    className={mode === "image-to-video" ? "btn-3d-purple" : "btn-3d"}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Image → Vidéo
                  </Button>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="font-display text-sm text-muted-foreground mb-2 block">
                  FORMATS
                </label>
                <div className="flex flex-wrap gap-2">
                  {aspectRatios.map((ratio) => (
                    <Button
                      key={ratio}
                      size="sm"
                      variant={aspectRatio === ratio ? "default" : "outline"}
                      onClick={() => setAspectRatio(ratio)}
                      className={aspectRatio === ratio ? "btn-3d-pink" : "btn-3d"}
                    >
                      {ratio}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="font-display text-sm text-muted-foreground mb-2 block">
                  QUALITÉ
                </label>
                <div className="flex flex-wrap gap-2">
                  {qualities.map((q) => (
                    <Button
                      key={q}
                      size="sm"
                      variant={quality === q ? "default" : "outline"}
                      onClick={() => setQuality(q)}
                      className={quality === q ? "btn-3d-green" : "btn-3d"}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Résolution max</span>
                  <span className="font-bold text-foreground">1920x1080</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Types d'entrée</span>
                  <span className="font-bold text-foreground">TEXT / IMAGE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="btn-3d-cyan h-14 text-xl font-bold gap-3 hover:scale-105 transition-transform"
          >
            {isGenerating ? (
              <>
                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                GÉNÉRATION...
              </>
            ) : (
              <>
                <Zap className="h-6 w-6" />
                GÉNÉRER
              </>
            )}
          </Button>
        </div>

        {/* Models Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Film className="h-6 w-6 text-[hsl(var(--primary))]" />
            <h2 className="font-display text-2xl font-bold">TOUS LES MODÈLES</h2>
            <Badge variant="outline" className="text-base px-3">
              {models.length}
            </Badge>
          </div>

          <ModelGrid
            models={models}
            category="videos"
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectModel={setSelectedModel}
          />
        </div>
      </main>
    </div>
  );
};

export default GenerateVideos;