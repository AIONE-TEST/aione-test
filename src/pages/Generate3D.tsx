import { useState, useMemo } from "react";
import { Box, Sparkles, Zap } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { PromptEditor } from "@/components/PromptEditor";
import { GenerationCanvas } from "@/components/GenerationCanvas";
import { GenerationOptions, GenerationSettings } from "@/components/GenerationOptions";
import { ModelGrid } from "@/components/ModelGrid";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";

const Generate3D = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [options, setOptions] = useState<GenerationSettings>({
    mode: "text-to-content",
    aspectRatio: "1:1",
    quality: "standard",
  });

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("3d");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[280px] min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(142,76%,50%)]/20">
                <Box className="h-5 w-5 text-[hsl(142,76%,50%)]" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold" style={{
                  background: "linear-gradient(135deg, hsl(142,76%,50%), hsl(174,100%,50%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Génération 3D
                </h1>
                <p className="text-sm text-muted-foreground">
                  Créez des modèles 3D avec l'IA • <span className="text-[hsl(var(--primary))]">{models.length} modèles</span> disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Main Layout - Vertical */}
          <div className="flex flex-col gap-6 max-w-4xl mb-12">
            {/* Canvas */}
            <GenerationCanvas
              selectedModel={selectedModel}
              generatedContent={generatedContent}
              isGenerating={isGenerating}
              contentType="3d"
            />

            {/* Prompt Editor */}
            <PromptEditor
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              canGenerate={canGenerate}
              placeholder="Ex: Un personnage robot stylisé, low-poly, textures métalliques, pose dynamique"
            />

            {/* Model Selector */}
            <div className="panel-3d p-4 space-y-3">
              <label className="font-display text-sm text-[hsl(142,76%,50%)] tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                MOTEUR DE GÉNÉRATION
              </label>
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="3d"
                className="w-full"
              />
            </div>

            {/* Generation Options */}
            <GenerationOptions
              contentType="3d"
              options={options}
              onOptionsChange={setOptions}
            />

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="btn-3d-green h-14 text-xl font-bold gap-3 hover:scale-105 transition-transform disabled:opacity-50"
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

          {/* Models Section Title */}
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="font-display text-xl font-semibold">Tous les modèles 3D</h2>
            <span className="text-sm text-muted-foreground">({models.length})</span>
          </div>

          {/* Model Grid */}
          <ModelGrid
            models={models}
            category="3d"
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectModel={setSelectedModel}
          />
        </div>
      </main>
    </div>
  );
};

export default Generate3D;