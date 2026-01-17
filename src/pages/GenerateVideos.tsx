import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Video, Sparkles, Camera, Film, Upload, Image, File } from "lucide-react";
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

const mediaTypes = [
  { id: "image", label: "Image", icon: <Image className="h-4 w-4" />, accept: "image/*" },
  { id: "video", label: "Vidéo", icon: <Video className="h-4 w-4" />, accept: "video/*" },
  { id: "document", label: "Doc", icon: <File className="h-4 w-4" />, accept: ".pdf,.doc,.docx,.txt" },
];

const aspectRatios = ["1:1", "4:3", "9:16", "16:9"];
const qualities = ["720p", "1080p", "4K"];

const GenerateVideos = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const { getCreditsForService, getTotalCreditsForService, canGenerate: hasCreditsForService, useCredit } = useCredits();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("1080p");
  const [isDragging, setIsDragging] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Nouveaux états pour les fonctionnalités demandées
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" | "audio"; x: number; y: number } | null>(null);
  const [expandedApp, setExpandedApp] = useState<{ model: AIModel; x: number; y: number } | null>(null);
  const { options: modelOptions, setOptions: setModelOptions, hasSpecificOptions } = useModelOptions(selectedModel?.id);

  // Scroll en haut de page au chargement
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("videos");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const freeModelsCount = models.filter(m => m.isFree).length;

  const serviceName = selectedModel?.provider || "video";
  const credits = getCreditsForService(serviceName, quality);
  const totalCredits = getTotalCreditsForService(serviceName, quality);
  const hasCredits = hasCreditsForService(serviceName, quality);

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim() || !hasCredits) return;
    
    setIsGenerating(true);
    await useCredit(serviceName, quality);
    
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent("https://example.com/generated-video.mp4");
      setShowResultPopup(true);
    }, 3000);
  };

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
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

  // Gestion du survol des applis AI
  const handleAppHover = (model: AIModel, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setExpandedApp({ model, x: rect.right + 10, y: rect.top });
  };

  const canGenerateNow = Boolean(selectedModel) && prompt.trim().length > 0;
  const currentMediaType = mediaTypes.find(m => m.id === selectedMediaType);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-4">
        {/* Header compact */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] glow-purple">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black gradient-text-pink tracking-wider">
              GÉNÉRATION VIDÉO
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-[hsl(var(--primary))] font-bold">{models.length}</span> modèles • <span className="text-[hsl(142,76%,50%)]">{freeModelsCount} gratuits</span>
            </p>
          </div>
        </div>

        {/* NOUVEAU LAYOUT: 2/3 gauche (générateur) + 1/3 droite (historique) */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          {/* Colonne principale - 2/3 */}
          <div className="space-y-4">
            {/* 1. FENÊTRE DE GÉNÉRATION (Upload/Preview) - Principale */}
            <div
              className={cn(
                "panel-3d p-4 aspect-video flex items-center justify-center transition-all duration-300 cursor-pointer",
                isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-videos')?.click()}
            >
              {generatedContent ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video 
                    src={generatedContent} 
                    controls 
                    className="max-w-full max-h-full rounded-lg"
                  />
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
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)]/20 to-[hsl(320,100%,60%)]/20 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-[hsl(280,100%,65%)]" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">Glissez une image ici</p>
                    <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
                  </div>
                </div>
              )}
              <input
                id="file-upload-videos"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* 2. FENÊTRE DU PROMPT - Même largeur */}
            <PromptEditorEnhanced
              prompt={prompt}
              onPromptChange={setPrompt}
              negativePrompt={negativePrompt}
              onNegativePromptChange={setNegativePrompt}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              canGenerate={canGenerateNow}
              hasCredits={hasCredits}
              placeholder="Décrivez la vidéo... Ex: Château steampunk, cinématique 4K"
              category="videos"
            />

            {/* 3. FENÊTRE DES MODÈLES AI - Même largeur, même style */}
            <div className="panel-3d p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))]" />
                  <span className="font-display text-sm font-bold">MODÈLES AI</span>
                  <Badge variant="outline" className="text-xs">{models.length}</Badge>
                </div>
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>

              {/* Sélecteur de modèle compact */}
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="videos"
                className="w-full"
              />

              {/* Options selon modèle sélectionné (Point 11) */}
              {hasSpecificOptions && (
                <ModelSpecificOptions
                  model={selectedModel}
                  options={modelOptions}
                  onOptionsChange={setModelOptions}
                />
              )}

              {/* Options rapides: Type, Format, Qualité */}
              <div className="grid grid-cols-3 gap-3">
                {/* Type de média */}
                <div>
                  <label className="font-display text-xs text-muted-foreground block mb-1">TYPE</label>
                  <div className="flex gap-1">
                    {mediaTypes.map((type) => (
                      <Button
                        key={type.id}
                        size="sm"
                        variant={selectedMediaType === type.id ? "default" : "outline"}
                        onClick={() => setSelectedMediaType(type.id)}
                        className={cn(
                          "flex-1 h-8 text-xs gap-1",
                          selectedMediaType === type.id ? "btn-3d-cyan" : "btn-3d"
                        )}
                      >
                        {type.icon}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="font-display text-xs text-muted-foreground block mb-1">FORMAT</label>
                  <div className="flex gap-1">
                    {aspectRatios.map((ratio) => (
                      <Button
                        key={ratio}
                        size="sm"
                        variant={aspectRatio === ratio ? "default" : "outline"}
                        onClick={() => setAspectRatio(ratio)}
                        className={cn(
                          "flex-1 h-8 px-1 text-[10px]",
                          aspectRatio === ratio ? "btn-3d-pink" : "btn-3d"
                        )}
                      >
                        {ratio}
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
                          "flex-1 h-8 px-1 text-[10px]",
                          quality === q ? "btn-3d-green" : "btn-3d"
                        )}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Credits */}
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

          {/* Colonne droite - Historique (1/3) */}
          <MediaHistoryPanel
            category="videos"
            currentMedia={uploadedImage}
            onSelectMedia={(media) => {
              if (media.url) setUploadedImage(media.url);
            }}
            onPreviewMedia={(media) => {
              if (media.url) {
                setPreviewMedia({
                  url: media.url,
                  type: media.type as "image" | "video" | "audio",
                  x: window.innerWidth / 4,
                  y: window.innerHeight / 4
                });
              }
            }}
          />
        </div>
      </main>

      {/* Popup Résultat */}
      <MediaResultPopup
        isOpen={showResultPopup}
        onClose={() => setShowResultPopup(false)}
        mediaUrl={generatedContent}
        mediaType="video"
        prompt={prompt}
        model={selectedModel?.name}
      />

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
      />

      {/* Preview flottante au survol média (Point 5) */}
      <FloatingMediaPreview
        isOpen={!!previewMedia}
        mediaUrl={previewMedia?.url}
        mediaType={previewMedia?.type}
        position={previewMedia ? { x: previewMedia.x, y: previewMedia.y } : undefined}
        onClose={() => setPreviewMedia(null)}
      />

      {/* Appli étendue au survol (Point 6-7) */}
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

export default GenerateVideos;
