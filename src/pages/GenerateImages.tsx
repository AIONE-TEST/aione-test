import { useState, useMemo } from "react";
import { ImageIcon, Sparkles, Zap, Upload, Palette, Maximize2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { PromptEditor } from "@/components/PromptEditor";
import { GenerationCanvas } from "@/components/GenerationCanvas";
import { GenerationOptions, GenerationSettings } from "@/components/GenerationOptions";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";

const GenerateImages = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
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
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent("https://placehold.co/1024x1024/1a1a2e/00d4aa?text=Generated+Image");
    }, 3000);
  };

  const canGenerate = Boolean(selectedModel) && prompt.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[200px] min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(320,100%,60%)] to-[hsl(280,100%,65%)] glow-pink">
            <ImageIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black gradient-text-pink tracking-wider">
              GÉNÉRATION D'IMAGES
            </h1>
            <p className="text-lg text-muted-foreground">
              <span className="text-[hsl(320,100%,60%)] font-bold">{models.length}</span> MODÈLES DISPONIBLES
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Button className="btn-3d-pink gap-2 text-base hover:scale-105 transition-transform">
            <ImageIcon className="h-5 w-5" />
            TEXT TO IMAGE
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <Upload className="h-5 w-5" />
            IMAGE TO IMAGE
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <Palette className="h-5 w-5" />
            INPAINTING
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <Maximize2 className="h-5 w-5" />
            UPSCALE
          </Button>
        </div>

        {/* Main Grid - Large Canvas */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 h-[calc(100vh-280px)]">
          {/* Left: Canvas (maximized) */}
          <div className="min-h-0">
            <GenerationCanvas
              selectedModel={selectedModel}
              generatedContent={generatedContent}
              isGenerating={isGenerating}
              contentType="image"
            />
          </div>

          {/* Right: Controls */}
          <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
            {/* Model Selector */}
            <div className="panel-3d p-4 space-y-3">
              <label className="font-display text-sm text-[hsl(320,100%,60%)] tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                MODÈLE IA
              </label>
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="images"
              />
            </div>

            {/* Prompt Editor */}
            <PromptEditor
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              canGenerate={canGenerate}
              placeholder="Ex: Un paysage fantastique avec des montagnes de cristal au coucher du soleil, style Ghibli..."
            />

            {/* Options */}
            <GenerationOptions
              contentType="image"
              options={options}
              onOptionsChange={setOptions}
            />

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="btn-3d-pink h-14 text-xl font-bold gap-3 hover:scale-105 transition-transform disabled:opacity-50"
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
        </div>
      </main>
    </div>
  );
};

export default GenerateImages;