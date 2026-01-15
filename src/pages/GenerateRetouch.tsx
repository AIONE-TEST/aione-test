import { useState, useMemo, useCallback, useRef } from "react";
import { Wand2, Sparkles, Upload, Maximize, Brush, Eraser, Palette, ImagePlus, Layers, Scissors, ZoomIn, Download, Film } from "lucide-react";
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

interface RetouchTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const retouchTools: RetouchTool[] = [
  { id: "outpainting", name: "Outpainting", icon: <ImagePlus className="h-5 w-5" />, description: "Étendre l'image" },
  { id: "upscale", name: "Upscale 4K", icon: <Maximize className="h-5 w-5" />, description: "Résolution" },
  { id: "denoise", name: "Débruitage", icon: <Brush className="h-5 w-5" />, description: "Nettoyer" },
  { id: "remove-bg", name: "Fond", icon: <Eraser className="h-5 w-5" />, description: "Supprimer" },
  { id: "enhance", name: "Améliorer", icon: <Sparkles className="h-5 w-5" />, description: "Auto" },
  { id: "colorize", name: "Coloriser", icon: <Palette className="h-5 w-5" />, description: "N&B" },
  { id: "restore", name: "Restaurer", icon: <Layers className="h-5 w-5" />, description: "Photos" },
  { id: "inpainting", name: "Inpainting", icon: <Scissors className="h-5 w-5" />, description: "Modifier" },
];

const GenerateRetouch = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const { getCreditsForService, getTotalCreditsForService, canGenerate: hasCreditsForService, useCredit } = useCredits();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("upscale");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
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
    const categoryModels = getModelsByCategory("retouch");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const freeModelsCount = models.filter(m => m.isFree).length;

  const serviceName = selectedModel?.provider || "retouch";
  const credits = getCreditsForService(serviceName, "standard");
  const totalCredits = getTotalCreditsForService(serviceName, "standard");
  const hasCredits = hasCreditsForService(serviceName, "standard");

  const handleGenerate = async () => {
    if (!selectedModel || !uploadedImage || !hasCredits) return;
    
    setIsGenerating(true);
    await useCredit(serviceName, "standard");
    
    setTimeout(() => {
      setIsGenerating(false);
      setResultImage(uploadedImage);
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

  const canGenerateNow = Boolean(selectedModel) && Boolean(uploadedImage);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-4">
        {/* Header compact */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(174,100%,50%)] to-[hsl(142,76%,50%)] glow-cyan">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black gradient-text-cyan tracking-wider">
              RETOUCHE PHOTO / VIDÉO
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-[hsl(var(--primary))] font-bold">{models.length}</span> outils • <span className="text-[hsl(142,76%,50%)]">{freeModelsCount} gratuits</span>
            </p>
          </div>
        </div>

        {/* Tools Bar compact */}
        <div className="panel-3d p-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {retouchTools.map((tool) => (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTool(tool.id)}
                className={cn(
                  "gap-1 text-xs",
                  selectedTool === tool.id ? "btn-3d-cyan" : "btn-3d"
                )}
              >
                {tool.icon}
                {tool.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Layout: Vertical - Options sous le prompt */}
        <div className="w-full max-w-4xl space-y-3 mb-6">
          {/* Zone Upload (principale) - taille réduite */}
          <div
            className={cn(
              "panel-3d p-3 aspect-video flex items-center justify-center transition-all duration-300 cursor-pointer",
              isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
            )}
            style={{ maxHeight: "35vh" }}
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
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-[hsl(var(--primary))]/30 border-t-[hsl(var(--primary))] animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(174,100%,50%)]/20 to-[hsl(142,76%,50%)]/20 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-[hsl(174,100%,50%)]" />
                </div>
                <div>
                  <p className="font-display text-base text-foreground">Glissez une image ici</p>
                  <p className="text-xs text-muted-foreground">ou cliquez pour sélectionner</p>
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
            placeholder={`Instructions pour ${retouchTools.find(t => t.id === selectedTool)?.name}...`}
            category="retouch"
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
              category="retouch"
              className="w-full"
            />

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
            <Film className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="font-display text-lg font-bold">OUTILS DE RETOUCHE COMPATIBLES</h2>
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
        mediaUrl={resultImage}
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

export default GenerateRetouch;