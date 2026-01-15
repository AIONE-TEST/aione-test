import { useState, useMemo, useRef, useCallback } from "react";
import { Video, Sparkles, Camera, Film, Upload, Image, File, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
import { MediaResultPopup } from "@/components/MediaResultPopup";
import { APIKeyModal } from "@/components/APIKeyModal";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { PromptEditorEnhanced } from "@/components/PromptEditorEnhanced";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { GenerationHistoryThumbnails } from "@/components/GenerationHistoryThumbnails";
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
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
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

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("videos");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const freeModelsCount = models.filter(m => m.isFree).length;

  // Get credits for selected model
  const serviceName = selectedModel?.provider || "video";
  const credits = getCreditsForService(serviceName, quality);
  const totalCredits = getTotalCreditsForService(serviceName, quality);
  const hasCredits = hasCreditsForService(serviceName, quality);

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim() || !hasCredits) return;
    
    setIsGenerating(true);
    
    // Use credit
    await useCredit(serviceName, quality);
    
    setTimeout(() => {
      setIsGenerating(false);
      // Simulated result for demo
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
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFiles(prev => [...prev, event.target?.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFiles(prev => [...prev, event.target?.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
            onClick={() => document.getElementById('file-upload-videos')?.click()}
          >
            {uploadedFiles.length > 0 ? (
              <div className="relative w-full h-full p-2">
                <div className="grid grid-cols-4 gap-2 h-full">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={file} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {uploadedFiles.length < 10 && (
                    <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-[hsl(var(--primary))]/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)]/20 to-[hsl(320,100%,60%)]/20 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-[hsl(280,100%,65%)]" />
                </div>
                <div>
                  <p className="font-display text-base text-foreground">Glissez vos fichiers ici</p>
                  <p className="text-xs text-muted-foreground">Multi-upload supporté (max 10)</p>
                </div>
              </div>
            )}
            <input
              id="file-upload-videos"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Icônes de type sous la zone d'upload */}
          <div className="flex justify-center gap-4">
            {mediaTypes.map((type) => (
              <div
                key={type.id}
                className={cn(
                  "flex flex-col items-center gap-1 cursor-pointer transition-all",
                  selectedMediaType === type.id ? "text-[hsl(var(--primary))]" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setSelectedMediaType(type.id)}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all",
                  selectedMediaType === type.id ? "bg-[hsl(var(--primary))]/20" : "bg-muted/50"
                )}>
                  {type.icon}
                </div>
                <span className="text-xs font-medium">{type.label}</span>
              </div>
            ))}
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
            placeholder="Décrivez la vidéo... Ex: Château steampunk, cinématique 4K"
            category="videos"
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
              category="videos"
              className="w-full"
            />

            {/* Format + Qualité en ligne */}
            <div className="grid grid-cols-2 gap-3">
              {/* Format avec icônes */}
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
                        "flex-1 h-8 px-1 text-xs flex-col gap-0.5",
                        aspectRatio === ratio ? "btn-3d-pink" : "btn-3d"
                      )}
                    >
                      <div className={cn(
                        "border border-current rounded-sm",
                        ratio === "1:1" && "w-3 h-3",
                        ratio === "4:3" && "w-3 h-2.5",
                        ratio === "9:16" && "w-2 h-3",
                        ratio === "16:9" && "w-4 h-2"
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
                        "flex-1 h-8 px-1 text-xs",
                        quality === q ? "btn-3d-green" : "btn-3d"
                      )}
                    >
                      {q}
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

          {/* Historique des générations */}
          <GenerationHistoryThumbnails type="video" />
        </div>

        {/* Grille des modèles */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Film className="h-5 w-5 text-[hsl(280,100%,65%)]" />
            <h2 className="font-display text-lg font-bold">MODÈLES VIDÉO COMPATIBLES</h2>
            <Badge variant="outline" className="text-sm">{models.length}</Badge>
            <div className="ml-auto">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>

          {/* Grid avec le même style que APPLIS IA */}
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
    </div>
  );
};

export default GenerateVideos;
