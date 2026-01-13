import { useState, useMemo } from "react";
import { Image } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { PromptEditor } from "@/components/PromptEditor";
import { GenerationCanvas } from "@/components/GenerationCanvas";
import { GenerationOptions, GenerationSettings } from "@/components/GenerationOptions";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";

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

      <main className="ml-[140px] min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[hsl(320,100%,60%)/0.2]">
            <Image className="h-5 w-5 text-[hsl(320,100%,60%)]" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            GÉNÉRATION D'IMAGES
          </h1>
          <span className="font-display text-xs text-[hsl(174,100%,50%)]">
            {models.length} MODÈLES
          </span>
        </div>

        {/* Main Grid - Large Canvas */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 h-[calc(100vh-120px)]">
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
            <div className="space-y-2">
              <label className="font-display text-xs text-[hsl(215,20%,60%)] tracking-wider">
                MODÈLE
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
              placeholder="Ex: Un paysage fantastique avec des montagnes de cristal au coucher du soleil, style Ghibli"
            />

            {/* Options */}
            <GenerationOptions
              contentType="image"
              options={options}
              onOptionsChange={setOptions}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateImages;
