import { useState, useMemo, useCallback, useRef } from "react";
import { Wand2, Sparkles, Upload, Maximize, Brush, Eraser, Palette, ImagePlus, Layers, Scissors, Paperclip, ZoomIn, Download, Image, Video, Music } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { MediaResultPopup } from "@/components/MediaResultPopup";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { GenerateButton } from "@/components/GenerateButton";
import { AppTileCard } from "@/components/AppTileCard";
import { APIKeyModal } from "@/components/APIKeyModal";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RetouchTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const retouchTools: RetouchTool[] = [
  { id: "outpainting", name: "Outpainting", icon: <ImagePlus className="h-4 w-4" />, description: "Étendre l'image" },
  { id: "upscale", name: "Upscale", icon: <Maximize className="h-4 w-4" />, description: "4K/8K" },
  { id: "denoise", name: "Débruitage", icon: <Brush className="h-4 w-4" />, description: "Réduire bruit" },
  { id: "remove-bg", name: "Fond", icon: <Eraser className="h-4 w-4" />, description: "Supprimer" },
  { id: "enhance", name: "Améliorer", icon: <Sparkles className="h-4 w-4" />, description: "Auto" },
  { id: "colorize", name: "Coloriser", icon: <Palette className="h-4 w-4" />, description: "N&B" },
  { id: "restore", name: "Restaurer", icon: <Layers className="h-4 w-4" />, description: "Photos" },
  { id: "inpainting", name: "Inpainting", icon: <Scissors className="h-4 w-4" />, description: "Modifier" },
];

const mediaTypes = [
  { id: "image", label: "Image", icon: <Image className="h-4 w-4" />, accept: "image/*" },
  { id: "video", label: "Vidéo", icon: <Video className="h-4 w-4" />, accept: "video/*" },
  { id: "audio", label: "Audio", icon: <Music className="h-4 w-4" />, accept: "audio/*" },
];

const GenerateRetouch = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const { getCreditsForService, getTotalCreditsForService, canGenerate: hasCreditsForService, useCredit } = useCredits();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("upscale");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
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

  // Get credits for selected model
  const serviceName = selectedModel?.provider || "retouch";
  const credits = getCreditsForService(serviceName, "standard");
  const totalCredits = getTotalCreditsForService(serviceName, "standard");
  const hasCredits = hasCreditsForService(serviceName, "standard");

  const handleGenerate = async () => {
    if (!selectedModel || !uploadedImage || !hasCredits) return;
    
    setIsGenerating(true);
    
    // Use credit
    await useCredit(serviceName, "standard");
    
    setTimeout(() => {
      setIsGenerating(false);
      setResultImage(uploadedImage);
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

  const canGenerateNow = Boolean(selectedModel) && Boolean(uploadedImage);
  const currentMediaType = mediaTypes.find(m => m.id === selectedMediaType);

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

        {/* Layout unifié vertical - UNE SEULE fenêtre de génération */}
        <div className="flex flex-col gap-4 max-w-5xl mb-6">
          
          {/* Fenêtre de génération unifiée - même taille que VIDEO */}
          <div className="panel-3d p-6 min-h-[450px]">
            {/* Barre d'outils en haut */}
            <div className="flex flex-wrap gap-1 mb-4 pb-3 border-b border-border/50">
              {retouchTools.map((tool) => (
                <Button
                  key={tool.id}
                  size="sm"
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  onClick={() => setSelectedTool(tool.id)}
                  className={cn(
                    "gap-1.5 h-8 text-xs",
                    selectedTool === tool.id ? "btn-3d-cyan" : "btn-3d"
                  )}
                >
                  {tool.icon}
                  <span className="hidden sm:inline">{tool.name}</span>
                </Button>
              ))}
            </div>

            {/* Zone principale: Upload uniquement (comme VIDEO) */}
            <div className="flex-1 flex items-center justify-center mb-4">
              <div
                className={cn(
                  "w-full h-full aspect-[16/9] flex items-center justify-center transition-all duration-300 cursor-pointer rounded-xl border-2 border-dashed border-border/50",
                  isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload-retouch')?.click()}
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
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(174,100%,50%)]/20 to-[hsl(142,76%,50%)]/20 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground">Glissez une image/vidéo ici</p>
                      <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
                    </div>
                  </div>
                )}
                <input
                  id="file-upload-retouch"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </div>

          {/* Zone Prompt */}
          <div className="panel-3d p-3">
            <div className="flex gap-2 items-start">
              <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Instructions pour ${retouchTools.find(t => t.id === selectedTool)?.name}...`}
                className="input-3d min-h-[50px] text-sm resize-none flex-1"
              />
              <GenerateButton
                onClick={handleGenerate}
                isGenerating={isGenerating}
                canGenerate={canGenerateNow}
                hasCredits={hasCredits}
              />
            </div>
          </div>

          {/* MODÈLES AI & OPTIONS - Horizontal sous le prompt */}
          <div className="panel-3d p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))]" />
              <span className="font-display text-sm font-bold">MODÈLES AI & OPTIONS</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Sélecteur de modèle */}
              <div>
                <label className="font-display text-xs text-muted-foreground mb-1 block">MOTEUR AI</label>
                <ModelSelector
                  models={models}
                  selectedModel={selectedModel}
                  onSelectModel={setSelectedModel}
                  category="retouch"
                  className="w-full"
                />
              </div>

              {/* Type de média */}
              <div>
                <label className="font-display text-xs text-muted-foreground mb-1 block">MÉDIA</label>
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

              {/* Import rapide */}
              <div>
                <label className="font-display text-xs text-muted-foreground mb-1 block">IMPORTER</label>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="w-full h-8 btn-3d-purple gap-2"
                >
                  <Upload className="h-4 w-4" />
                  FICHIER
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={currentMediaType?.accept}
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {/* Credits Display */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <CreditsDisplay 
                credits={credits} 
                totalCredits={totalCredits} 
                serviceName={selectedModel?.name}
                compact
              />
            </div>
          </div>
        </div>

        {/* Models Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="font-display text-lg font-bold">OUTILS DE RETOUCHE</h2>
            <Badge variant="outline" className="text-sm">{models.length}</Badge>
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
