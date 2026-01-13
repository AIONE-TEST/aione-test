import { useState, useMemo } from "react";
import { Image, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { PromptEditor } from "@/components/PromptEditor";
import { GenerationCanvas } from "@/components/GenerationCanvas";
import { GenerationOptions, GenerationSettings } from "@/components/GenerationOptions";
import { ModelGrid } from "@/components/ModelGrid";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";

const GenerateImages = () => {
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
    const categoryModels = getModelsByCategory("images");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulation - à remplacer par l'appel API réel
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent("https://placehold.co/1024x1024/1a1a2e/00d4aa?text=Generated+Image");
    }, 3000);
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

      <main className="ml-40 min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(320,100%,60%)]/20">
                <Image className="h-5 w-5 text-[hsl(320,100%,60%)]" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold gradient-text-pink">
                  Génération d'Images
                </h1>
                <p className="text-sm text-muted-foreground">
                  Créez des images avec l'IA • <span className="text-[hsl(var(--primary))]">{models.length} modèles</span> disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Generation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left: Canvas */}
            <div className="space-y-4">
              <GenerationCanvas
                selectedModel={selectedModel}
                generatedContent={generatedContent}
                isGenerating={isGenerating}
                contentType="image"
              />
            </div>

            {/* Right: Controls */}
            <div className="space-y-4">
              {/* Model Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Modèle</label>
                <ModelSelector
                  models={models}
                  selectedModel={selectedModel}
                  onSelectModel={setSelectedModel}
                  category="images"
                  className="w-full"
                />
              </div>

              {/* Prompt Editor */}
              <PromptEditor
                prompt={prompt}
                onPromptChange={setPrompt}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                canGenerate={canGenerate}
                placeholder="Ex: Un paysage fantastique avec des montagnes de cristal au coucher du soleil, style Ghibli, très détaillé"
              />

              {/* Generation Options */}
              <GenerationOptions
                contentType="image"
                options={options}
                onOptionsChange={setOptions}
              />
            </div>
          </div>

          {/* Models Section Title */}
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="font-display text-xl font-semibold">Tous les modèles d'images</h2>
            <span className="text-sm text-muted-foreground">({models.length})</span>
          </div>

          {/* Model Grid */}
          <ModelGrid
            models={models}
            category="images"
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectModel={setSelectedModel}
          />
        </div>
      </main>
    </div>
  );
};

export default GenerateImages;
