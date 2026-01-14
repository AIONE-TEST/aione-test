import { useState, useMemo, useRef, useCallback } from "react";
import { Video, Sparkles, Camera, Film, Type, Upload, Image, File } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
import { MediaResultPopup } from "@/components/MediaResultPopup";
import { APIKeyModal } from "@/components/APIKeyModal";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim()) return;
    
    setIsGenerating(true);
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

  const canGenerate = Boolean(selectedModel) && prompt.trim().length > 0;
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

        {/* Layout: 2 colonnes - Upload à gauche, Options à droite */}
        <div className="grid grid-cols-[1fr_300px] gap-4 mb-6">
          {/* Colonne gauche - Zone Upload + Prompt */}
          <div className="space-y-3">
            {/* Zone Upload (principale) */}
            <div
              className={cn(
                "panel-3d p-4 aspect-[16/9] flex items-center justify-center transition-all duration-300 cursor-pointer",
                isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-videos')?.click()}
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

            {/* Prompt compact */}
            <div className="panel-3d p-3">
              <div className="flex gap-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Décrivez la vidéo... Ex: Château steampunk, cinématique 4K"
                  className="input-3d min-h-[50px] text-sm resize-none flex-1"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className="btn-3d-purple px-6 font-display font-bold h-auto"
                >
                  {isGenerating ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "GÉNÉRER"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Colonne droite - Options compactes */}
          <div className="panel-3d p-3 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))]" />
              <span className="font-display text-sm font-bold">MOTEUR</span>
            </div>

            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              category="videos"
              className="w-full"
            />

            {/* Type de média */}
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
                  {type.label}
                </Button>
              ))}
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
                      "flex-1 h-7 px-2 text-xs",
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
                      "flex-1 h-7 px-2 text-xs",
                      quality === q ? "btn-3d-green" : "btn-3d"
                    )}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quota */}
            <div className="flex justify-between text-xs pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Quota restant</span>
              <span className="font-bold text-[hsl(142,76%,50%)]">50 / 100</span>
            </div>
          </div>
        </div>

        {/* Grille des modèles */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Film className="h-5 w-5 text-[hsl(280,100%,65%)]" />
            <h2 className="font-display text-lg font-bold">MODÈLES VIDÉO COMPATIBLES</h2>
            <Badge variant="outline" className="text-sm">{models.length}</Badge>
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
