import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { ImageIcon, Sparkles, Upload } from "lucide-react";
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
  
  // Nouveaux états
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" | "audio"; x: number; y: number } | null>(null);
  const [expandedApp, setExpandedApp] = useState<{ model: AIModel; x: number; y: number } | null>(null);
  const { options: modelOptions, setOptions: setModelOptions, hasSpecificOptions } = useModelOptions(selectedModel?.id);

  // Scroll en haut de page au chargement (Point 9)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("images");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const freeModelsCount = models.filter(m => m.isFree).length;

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

  const handleAppHover = (model: AIModel, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setExpandedApp({ model, x: rect.right + 10, y: rect.top });
  };

  const canGenerateNow = Boolean(selectedModel) && prompt.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-4">
        {/* Header */}
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

        {/* LAYOUT: 2/3 gauche + 1/3 droite (identique à VIDEO) */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          {/* Colonne principale */}
          <div className="space-y-4">
            {/* 1. FENÊTRE DE GÉNÉRATION */}
            <div
              className={cn(
                "panel-3d p-4 aspect-square max-h-[500px] flex items-center justify-center transition-all duration-300 cursor-pointer",
                isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {generatedContent ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={generatedContent} alt="Generated" className="max-w-full max-h-full object-contain rounded-lg" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                    onClick={(e) => { e.stopPropagation(); setGeneratedContent(null); }}
                  >
                    Nouvelle génération
                  </Button>
                </div>
              ) : uploadedImage ? (
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
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-[hsl(var(--primary))]/30 border-t-[hsl(var(--primary))] animate-spin" />
                  <p className="font-display text-lg">Génération en cours...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(320,100%,60%)]/20 to-[hsl(280,100%,65%)]/20 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-[hsl(320,100%,60%)]" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">Image source (optionnel)</p>
                    <p className="text-sm text-muted-foreground">Glissez ou cliquez</p>
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
              placeholder="Décrivez l'image... Ex: Paysage fantastique, style Ghibli, 4K"
              category="images"
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
                category="images"
                className="w-full"
              />

              {/* Options spécifiques au modèle (Point 11) */}
              {hasSpecificOptions && (
                <ModelSpecificOptions
                  model={selectedModel}
                  options={modelOptions}
                  onOptionsChange={setModelOptions}
                />
              )}

              {/* Options: Format et Qualité */}
              <div className="grid grid-cols-2 gap-3">
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
                          "text-xs px-2 py-1",
                          aspectRatio === ratio ? "btn-3d-pink" : "btn-3d"
                        )}
                      >
                        {ratio}
                      </Button>
                    ))}
                  </div>
                </div>

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
                          "flex-1 text-xs px-2 py-1",
                          quality === q ? "btn-3d-green" : "btn-3d"
                        )}
                      >
                        {q.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

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
            category="images"
            currentMedia={uploadedImage}
            onSelectMedia={(media) => {
              if (media.url) setUploadedImage(media.url);
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

      {/* Modals & Popups */}
      <MediaResultPopup
        isOpen={showResultPopup}
        onClose={() => setShowResultPopup(false)}
        mediaUrl={generatedContent}
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

export default GenerateImages;
