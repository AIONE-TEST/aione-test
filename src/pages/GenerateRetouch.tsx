import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Wand2, Sparkles, Upload, Maximize, Brush, Eraser, Palette, ImagePlus, Layers, Scissors, ZoomIn, Download } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
import { MediaResultPopup } from "@/components/MediaResultPopup";
import { APIKeyModal } from "@/components/APIKeyModal";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { PromptEditorEnhanced } from "@/components/PromptEditorEnhanced";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { MediaHistoryPanel } from "@/components/MediaHistoryPanel";
import { FloatingMediaPreview } from "@/components/FloatingMediaPreview";
import { AppTileCardExpanded } from "@/components/AppTileCardExpanded";
import { ModelSpecificOptions, useModelOptions } from "@/components/ModelSpecificOptions";
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

  // Nouveaux états
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" | "audio"; x: number; y: number } | null>(null);
  const [expandedApp, setExpandedApp] = useState<{ model: AIModel; x: number; y: number } | null>(null);
  const { options: modelOptions, setOptions: setModelOptions, hasSpecificOptions } = useModelOptions(selectedModel?.id);

  // Scroll en haut (Point 9)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
        setResultImage(null);
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
        setResultImage(null);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleAppHover = (model: AIModel, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setExpandedApp({ model, x: rect.right + 10, y: rect.top });
  };

  const canGenerateNow = Boolean(selectedModel) && Boolean(uploadedImage);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-4">
        {/* Header */}
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

        {/* Tools Bar */}
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

        {/* LAYOUT: 2/3 + 1/3 */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          {/* Colonne principale */}
          <div className="space-y-4">
            {/* 1. FENÊTRE UNIQUE - Source + Résultat (Point 10: fusionner 2 fenêtres en 1) */}
            <div
              className={cn(
                "panel-3d p-4 aspect-video flex items-center justify-center transition-all duration-300 cursor-pointer relative",
                isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploadedImage && fileInputRef.current?.click()}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-[hsl(var(--primary))]/30 border-t-[hsl(var(--primary))] animate-spin" />
                  <p className="font-display text-lg">Traitement en cours...</p>
                </div>
              ) : resultImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={resultImage} alt="Result" className="max-w-full max-h-full object-contain rounded-lg" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-black/50 hover:bg-black/70"
                      onClick={(e) => { e.stopPropagation(); setResultImage(null); }}
                    >
                      Refaire
                    </Button>
                  </div>
                  {/* Comparaison avant/après */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded">
                    <span className="text-[10px] font-display">RÉSULTAT</span>
                    <Badge className="text-[8px]">{selectedTool.toUpperCase()}</Badge>
                  </div>
                </div>
              ) : uploadedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={uploadedImage} alt="Source" className="max-w-full max-h-full object-contain rounded-lg" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                    onClick={(e) => { e.stopPropagation(); setUploadedImage(null); fileInputRef.current?.click(); }}
                  >
                    Changer
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded">
                    <span className="text-[10px] font-display">SOURCE</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(174,100%,50%)]/20 to-[hsl(142,76%,50%)]/20 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-[hsl(174,100%,50%)]" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">Glissez une image à retoucher</p>
                    <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* 2. FENÊTRE DU PROMPT */}
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

            {/* 3. FENÊTRE DES MODÈLES AI */}
            <div className="panel-3d p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))]" />
                  <span className="font-display text-sm font-bold">MODÈLES AI</span>
                  <Badge variant="outline" className="text-xs">{models.length}</Badge>
                </div>
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>

              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="retouch"
                className="w-full"
              />

              {hasSpecificOptions && (
                <ModelSpecificOptions
                  model={selectedModel}
                  options={modelOptions}
                  onOptionsChange={setModelOptions}
                />
              )}

              <CreditsDisplay 
                credits={credits} 
                totalCredits={totalCredits} 
                serviceName={selectedModel?.name}
                compact
              />

              {/* Grille des modèles */}
              <div className={cn(
                viewMode === "list" 
                  ? "flex flex-col gap-2" 
                  : "grid grid-cols-2 lg:grid-cols-3 gap-3"
              )}>
                {models.map((model) => (
                  <div
                    key={model.id}
                    onMouseEnter={(e) => handleAppHover(model, e)}
                    onMouseLeave={() => setExpandedApp(null)}
                  >
                    <AppTileCard
                      model={model}
                      viewMode={viewMode}
                      horizontal
                      onOpenAPIKeyModal={handleOpenAPIKeyModal}
                      onClick={() => setSelectedModel(model)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite - Historique */}
          <MediaHistoryPanel
            category="retouch"
            currentMedia={uploadedImage}
            onSelectMedia={(media) => {
              if (media.url) {
                setUploadedImage(media.url);
                setResultImage(null);
              }
            }}
            onPreviewMedia={(media) => {
              if (media.url) {
                setPreviewMedia({
                  url: media.url,
                  type: "image",
                  x: window.innerWidth / 4,
                  y: window.innerHeight / 4
                });
              }
            }}
          />
        </div>
      </main>

      {/* Modals */}
      <MediaResultPopup
        isOpen={showResultPopup}
        onClose={() => setShowResultPopup(false)}
        mediaUrl={resultImage}
        mediaType="image"
      />

      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
      />

      <FloatingMediaPreview
        isOpen={!!previewMedia}
        mediaUrl={previewMedia?.url}
        mediaType={previewMedia?.type}
        position={previewMedia ? { x: previewMedia.x, y: previewMedia.y } : undefined}
        onClose={() => setPreviewMedia(null)}
      />

      {expandedApp && (
        <AppTileCardExpanded
          model={expandedApp.model}
          isOpen={true}
          position={{ x: expandedApp.x, y: expandedApp.y }}
          onClose={() => setExpandedApp(null)}
          onOpenAPIKeyModal={handleOpenAPIKeyModal}
          onClick={() => {
            setSelectedModel(expandedApp.model);
            setExpandedApp(null);
          }}
        />
      )}
    </div>
  );
};

export default GenerateRetouch;
