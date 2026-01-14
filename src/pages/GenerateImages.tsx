import { useState, useMemo, useRef, useCallback } from "react";
import { ImageIcon, Sparkles, Zap, Upload, Type, Download, Image, Video, File, LayoutGrid, Gift, ShieldOff, Tag } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { ModelGrid } from "@/components/ModelGrid";
import { MediaResultPopup } from "@/components/MediaResultPopup";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusLED } from "@/components/StatusLED";
import { cn } from "@/lib/utils";

const mediaTypes = [
  { id: "image", label: "Image", icon: <Image className="h-5 w-5" />, accept: "image/*" },
  { id: "document", label: "Document", icon: <File className="h-5 w-5" />, accept: ".pdf,.doc,.docx,.txt" },
];

const aspectRatios = ["1:1", "4:3", "3:4", "9:16", "16:9", "21:9"];
const qualities = ["standard", "hd", "ultra"];

type ImageFilter = "all" | "services" | "free" | "uncensored";

const GenerateImages = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [quality, setQuality] = useState("standard");
  const [isDragging, setIsDragging] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ImageFilter>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allModels = useMemo(() => {
    const categoryModels = getModelsByCategory("images");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const filteredModels = useMemo(() => {
    switch (activeFilter) {
      case "services":
        return allModels.filter(m => m.apiStatus === "active");
      case "free":
        return allModels.filter(m => m.isFree || m.apiStatus === "free");
      case "uncensored":
        return allModels.filter(m => 
          m.badges.some(b => b.toLowerCase().includes("uncensored") || b.toLowerCase().includes("nsfw") || b === "18+") ||
          m.name.toLowerCase().includes("uncensored")
        );
      default:
        return allModels;
    }
  }, [allModels, activeFilter]);

  const filterCounts = useMemo(() => ({
    all: allModels.length,
    services: allModels.filter(m => m.apiStatus === "active").length,
    free: allModels.filter(m => m.isFree || m.apiStatus === "free").length,
    uncensored: allModels.filter(m => 
      m.badges.some(b => b.toLowerCase().includes("uncensored") || b.toLowerCase().includes("nsfw") || b === "18+") ||
      m.name.toLowerCase().includes("uncensored")
    ).length,
  }), [allModels]);

  const freeModelsCount = filteredModels.filter(m => m.isFree).length;

  const filters: { id: ImageFilter; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Catégories", icon: <LayoutGrid className="h-4 w-4" /> },
    { id: "services", label: "Services", icon: <Tag className="h-4 w-4" /> },
    { id: "free", label: "Gratuits", icon: <Gift className="h-4 w-4" /> },
    { id: "uncensored", label: "Sans Censure", icon: <ShieldOff className="h-4 w-4" /> },
  ];

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim()) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent("https://placehold.co/1024x1024/1a1a2e/00d4aa?text=Generated+Image");
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const canGenerate = Boolean(selectedModel) && prompt.trim().length > 0;
  const currentMediaType = mediaTypes.find(m => m.id === selectedMediaType);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(320,100%,60%)] to-[hsl(280,100%,65%)] glow-pink">
              <ImageIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black gradient-text-pink tracking-wider">
                GÉNÉRATION D'IMAGES
              </h1>
              <p className="text-lg text-muted-foreground tracking-wide">
                Créez des images uniques avec l'IA • <span className="text-[hsl(var(--primary))] font-bold">{filteredModels.length} modèles</span> disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout - ORDER: Source -> Result -> Prompt -> Engine */}
        <div className="flex flex-col gap-6 max-w-6xl mb-10">
          
          {/* 1. IMAGE SOURCE - En haut */}
          <div className="panel-3d p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xl font-bold text-foreground">IMAGE SOURCE (OPTIONNEL)</span>
              {uploadedImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedImage(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Changer
                </Button>
              )}
            </div>
            
            <div
              className={cn(
                "canvas-3d aspect-video flex items-center justify-center transition-all duration-300 cursor-pointer",
                isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-images')?.click()}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Source" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(320,100%,60%)]/20 to-[hsl(280,100%,65%)]/20 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-[hsl(320,100%,60%)]" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground mb-2">
                      Glissez-déposez une image ici
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou cliquez pour sélectionner (Image-to-Image)
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés : PNG, JPG, WEBP · Max 50MB
                  </p>
                </div>
              )}
              <input
                id="file-upload-images"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* 2. ÉDITEUR DE PROMPT - Compact */}
          <div className="panel-3d p-4">
            <div className="flex items-center gap-2 mb-2">
              <Type className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="font-display text-sm font-bold">PROMPT</span>
            </div>
            
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez l'image... Ex: Paysage fantastique, montagnes de cristal, style Ghibli"
              className="input-3d min-h-[60px] text-base resize-none mb-3"
            />

            <div className="flex items-center justify-between">
              <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-sm px-2 py-0.5">
                {freeModelsCount} GRATUITS
              </Badge>
              
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="btn-3d-pink text-base px-6 py-4 font-display font-bold"
              >
                {isGenerating ? "GÉNÉRATION..." : "GÉNÉRER"}
              </Button>
            </div>
          </div>

          {/* 3. MOTEUR DE GÉNÉRATION & OPTIONS - Compact */}
          <div className="panel-3d p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))]" />
              <span className="font-display text-sm font-bold">MOTEUR & OPTIONS</span>
            </div>

            {/* Grid compact: Modèle + Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Sélecteur de modèle */}
              <div>
                <label className="font-display text-xs text-muted-foreground mb-2 block">MOTEUR AI</label>
                <ModelSelector
                  models={filteredModels}
                  selectedModel={selectedModel}
                  onSelectModel={setSelectedModel}
                  category="images"
                  className="w-full"
                />
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <StatusLED isActive={!!selectedModel} />
                  <span className="text-muted-foreground truncate">
                    {selectedModel ? selectedModel.name : "Aucun modèle"}
                  </span>
                </div>
              </div>

              {/* Options rapides */}
              <div className="space-y-3">
                {/* Import média compact */}
                <div>
                  <label className="font-display text-xs text-muted-foreground mb-1 block">MÉDIA</label>
                  <div className="flex gap-1">
                    {mediaTypes.map((type) => (
                      <Button
                        key={type.id}
                        size="sm"
                        variant={selectedMediaType === type.id ? "default" : "outline"}
                        onClick={() => setSelectedMediaType(type.id)}
                        className={cn("p-2", selectedMediaType === type.id ? "btn-3d-cyan" : "btn-3d")}
                      >
                        {type.icon}
                      </Button>
                    ))}
                    <Button
                      onClick={handleImportClick}
                      size="sm"
                      className="btn-3d-purple p-2 flex-1"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={currentMediaType?.accept}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Format compact */}
                <div>
                  <label className="font-display text-xs text-muted-foreground mb-1 block">FORMAT</label>
                  <div className="flex flex-wrap gap-1">
                    {aspectRatios.slice(0, 4).map((ratio) => (
                      <Button
                        key={ratio}
                        size="sm"
                        variant={aspectRatio === ratio ? "default" : "outline"}
                        onClick={() => setAspectRatio(ratio)}
                        className={cn("text-xs px-2 py-1", aspectRatio === ratio ? "btn-3d-pink" : "btn-3d")}
                      >
                        {ratio}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Qualité compact */}
                <div>
                  <label className="font-display text-xs text-muted-foreground mb-1 block">QUALITÉ</label>
                  <div className="flex gap-1">
                    {qualities.map((q) => (
                      <Button
                        key={q}
                        size="sm"
                        variant={quality === q ? "default" : "outline"}
                        onClick={() => setQuality(q)}
                        className={cn("text-xs px-2 py-1 flex-1", quality === q ? "btn-3d-green" : "btn-3d")}
                      >
                        {q.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Infos compactes */}
            <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <span className="text-muted-foreground block">Max</span>
                <span className="font-bold text-foreground">4K</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Formats</span>
                <span className="font-bold text-foreground">PNG/JPG</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Quota</span>
                <span className="font-bold text-[hsl(142,76%,50%)]">50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="h-6 w-6 text-[hsl(320,100%,60%)]" />
            <h2 className="font-display text-2xl font-bold">TOUS LES MODÈLES D'IMAGES</h2>
            <Badge variant="outline" className="text-base px-3">
              {filteredModels.length}
            </Badge>
          </div>

          <ModelGrid
            models={filteredModels}
            category="images"
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectModel={setSelectedModel}
          />
        </div>
      </main>

      {/* Result Popup */}
      <MediaResultPopup
        isOpen={showResultPopup}
        onClose={() => setShowResultPopup(false)}
        mediaUrl={generatedContent}
        mediaType="image"
      />
    </div>
  );
};

export default GenerateImages;