import { useState, useMemo, useRef, useCallback } from "react";
import { ImageIcon, Sparkles, Upload, Film } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
import { MediaResultPopup } from "@/components/MediaResultPopup";
import { APIKeyModal } from "@/components/APIKeyModal";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { PromptEditorEnhanced } from "@/components/PromptEditorEnhanced";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const aspectRatios = ["1:1", "4:3", "3:4", "9:16", "16:9", "21:9"];
const qualities = ["standard", "hd", "ultra"];

const GenerateImages = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const { getCreditsForService, getTotalCreditsForService, canGenerate: hasCreditsForService, useCredit } = useCredits();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [quality, setQuality] = useState("standard");
  const [isDragging, setIsDragging] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("images");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const freeModelsCount = models.filter(m => m.isFree).length;

  // Get credits for selected model
  const serviceName = selectedModel?.provider || "image";
  const credits = getCreditsForService(serviceName, quality);
  const totalCredits = getTotalCreditsForService(serviceName, quality);
  const hasCredits = hasCreditsForService(serviceName, quality);

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim() || !hasCredits) return;
    
    setIsGenerating(true);
    await useCredit(serviceName, quality);
    
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent("https://placehold.co/1024x1024/1a1a2e/00d4aa?text=Generated+Image");
      setShowResultPopup(true);
    }, 3000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const canGenerateNow = Boolean(selectedModel) && prompt.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-4">
        {/* Header compact */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(320,100%,60%)] to-[hsl(280,100%,65%)] glow-pink">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black gradient-text-pink tracking-wider">
              GÉNÉRATION D'IMAGES
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-[hsl(var(--primary))] font-bold">{models.length}</span> modèles • <span className="text-[hsl(142,76%,50%)]">{freeModelsCount} gratuits</span>
            </p>
          </div>
        </div>

        {/* Layout: Vertical - Options sous le prompt */}
        <div className="w-full max-w-6xl space-y-3 mb-6">
          {/* Zone Upload (principale) */}
          <div
            className={cn(
              "panel-3d p-4 aspect-video flex items-center justify-center transition-all duration-300 cursor-pointer",
              isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
            )}
            style={{ maxHeight: "60vh" }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedImage ? (
              <div className="relative w-full h-full">
                <img src={uploadedImage} alt="Source" className="w-full h-full object-contain" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(320,100%,60%)]/20 to-[hsl(280,100%,65%)]/20 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-[hsl(320,100%,60%)]" />
                </div>
                <div>
                  <p className="font-display text-base text-foreground">Image source (optionnel)</p>
                  <p className="text-xs text-muted-foreground">Glissez ou cliquez</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Prompt avec aide intégrée */}
          <PromptEditorEnhanced
            prompt={prompt}
            onPromptChange={setPrompt}
            negativePrompt={negativePrompt}
            onNegativePromptChange={setNegativePrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            canGenerate={canGenerateNow}
            hasCredits={hasCredits}
            placeholder="Décrivez l'image... Ex: Paysage fantastique, style Ghibli, 4K"
            category="images"
          />

          {/* Options sous le prompt */}
          <div className="panel-3d p-3 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))]" />
              <span className="font-display text-sm font-bold">MODÈLES AI</span>
            </div>

            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              category="images"
              className="w-full"
            />

            {/* Format + Qualité en ligne */}
            <div className="grid grid-cols-2 gap-3">
              {/* Format avec icônes */}
              <div>
                <label className="font-display text-xs text-muted-foreground block mb-1">FORMAT</label>
                <div className="flex flex-wrap gap-1">
                  {aspectRatios.map((ratio) => (
                    <Button
                      key={ratio}
                      size="sm"
                      variant={aspectRatio === ratio ? "default" : "outline"}
                      onClick={() => setAspectRatio(ratio)}
                      className={cn(
                        "text-xs px-2 py-1 h-8 flex-col gap-0.5",
                        aspectRatio === ratio ? "btn-3d-pink" : "btn-3d"
                      )}
                    >
                      <div className={cn(
                        "border border-current rounded-sm",
                        ratio === "1:1" && "w-3 h-3",
                        ratio === "4:3" && "w-3 h-2.5",
                        ratio === "3:4" && "w-2.5 h-3",
                        ratio === "9:16" && "w-2 h-3",
                        ratio === "16:9" && "w-4 h-2",
                        ratio === "21:9" && "w-5 h-2"
                      )} />
                      <span className="text-[10px]">{ratio}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Qualité */}
              <div>
                <label className="font-display text-xs text-muted-foreground block mb-1">QUALITÉ</label>
                <div className="flex gap-1">
                  {qualities.map((q) => (
                    <Button
                      key={q}
                      size="sm"
                      variant={quality === q ? "default" : "outline"}
                      onClick={() => setQuality(q)}
                      className={cn(
                        "flex-1 text-xs px-2 py-1 h-8",
                        quality === q ? "btn-3d-green" : "btn-3d"
                      )}
                    >
                      {q.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Credits Display */}
            <CreditsDisplay 
              credits={credits} 
              totalCredits={totalCredits} 
              serviceName={selectedModel?.name}
              compact
            />
          </div>
        </div>

        {/* Grille des modèles */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Film className="h-5 w-5 text-[hsl(320,100%,60%)]" />
            <h2 className="font-display text-lg font-bold">MODÈLES IMAGES COMPATIBLES</h2>
            <Badge variant="outline" className="text-sm">{models.length}</Badge>
            <div className="ml-auto">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {models.map((model) => (
              <AppTileCard
                key={model.id}
                model={model}
                viewMode="grid"
                horizontal
                onOpenAPIKeyModal={handleOpenAPIKeyModal}
                onClick={() => setSelectedModel(model)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Result Popup */}
      <MediaResultPopup
        isOpen={showResultPopup}
        onClose={() => setShowResultPopup(false)}
        mediaUrl={generatedContent}
        mediaType="image"
      />

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
      />
    </div>
  );
};

export default GenerateImages;