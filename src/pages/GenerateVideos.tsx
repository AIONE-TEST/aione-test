import { useState, useMemo, useRef, useCallback } from "react";
import { Video, Sparkles, Camera, Film, Type, Upload, Zap, Image, File, Download, ZoomIn } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { ModelGrid } from "@/components/ModelGrid";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusLED } from "@/components/StatusLED";
import { cn } from "@/lib/utils";

const mediaTypes = [
  { id: "image", label: "Image", icon: <Image className="h-5 w-5" />, accept: "image/*" },
  { id: "video", label: "Vidéo", icon: <Video className="h-5 w-5" />, accept: "video/*" },
  { id: "document", label: "Document", icon: <File className="h-5 w-5" />, accept: ".pdf,.doc,.docx,.txt" },
];

const aspectRatios = ["1:1", "4:3", "3:4", "9:16", "16:9", "21:9"];
const qualities = ["480p", "720p", "1080p", "4K"];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }, 5000);
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

      <main className="ml-[280px] min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] glow-purple">
              <Camera className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black gradient-text-pink tracking-wider">
                GÉNÉRATION DE VIDÉOS
              </h1>
              <p className="text-lg text-muted-foreground tracking-wide">
                Créez des vidéos uniques avec l'IA • <span className="text-[hsl(var(--primary))] font-bold">{models.length} modèles</span> disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout - ORDER: Source -> Result -> Prompt -> Engine */}
        <div className="flex flex-col gap-6 max-w-6xl mb-10">
          
          {/* 1. IMAGE SOURCE - En haut */}
          <div className="panel-3d p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xl font-bold text-foreground">IMAGE SOURCE (IMAGE-TO-VIDEO)</span>
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
              onClick={() => document.getElementById('file-upload-videos')?.click()}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Source" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)]/20 to-[hsl(320,100%,60%)]/20 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-[hsl(280,100%,65%)]" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground mb-2">
                      Glissez-déposez une image ici
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou cliquez pour sélectionner (Image-to-Video)
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés : PNG, JPG, WEBP · Max 50MB
                  </p>
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
          </div>

          {/* 2. RÉSULTAT - En dessous */}
          <div className="panel-3d p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xl font-bold text-foreground">RÉSULTAT</span>
              {generatedContent && (
                <Button variant="ghost" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
              )}
            </div>
            
            <div className="canvas-3d aspect-video flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-[hsl(280,100%,65%)]/30 border-t-[hsl(280,100%,65%)] animate-spin" />
                  <p className="font-display text-lg text-muted-foreground animate-pulse">
                    Génération en cours...
                  </p>
                </div>
              ) : generatedContent ? (
                <video src={generatedContent} controls className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                    <ZoomIn className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="font-display text-lg text-muted-foreground">
                    La vidéo générée apparaîtra ici
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Entrez un prompt et lancez la génération
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. ÉDITEUR DE PROMPT - En dessous */}
          <div className="panel-3d p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="font-display text-lg font-bold">ÉDITEUR DE PROMPT</span>
            </div>
            
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez la vidéo que vous souhaitez créer... Ex: Un château steampunk avec des engrenages dorés, cinématique 4K"
              className="input-3d min-h-[100px] text-lg resize-none mb-4"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-base px-3 py-1">
                  {freeModelsCount} GRATUITS
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className="btn-3d-purple text-lg px-8 py-6 font-display font-bold tracking-wider"
                >
                  {isGenerating ? "GÉNÉRATION..." : "GÉNÉRER"}
                </Button>
              </div>
            </div>
          </div>

          {/* 4. MOTEUR DE GÉNÉRATION & OPTIONS - En bas */}
          <div className="panel-3d p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[hsl(var(--secondary))]" />
              <span className="font-display text-lg font-bold">MOTEUR DE GÉNÉRATION & OPTIONS</span>
            </div>

            {/* Gros bouton d'import média */}
            <div className="mb-6">
              <label className="font-display text-sm text-muted-foreground mb-3 block">
                IMPORTER UN MÉDIA
              </label>
              
              {/* Sélection type de média */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mediaTypes.map((type) => (
                  <Button
                    key={type.id}
                    size="sm"
                    variant={selectedMediaType === type.id ? "default" : "outline"}
                    onClick={() => setSelectedMediaType(type.id)}
                    className={cn(
                      "gap-2",
                      selectedMediaType === type.id ? "btn-3d-cyan" : "btn-3d"
                    )}
                  >
                    {type.icon}
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Bouton d'import */}
              <Button
                onClick={handleImportClick}
                className="w-full h-16 btn-3d-purple gap-3 text-lg font-display font-bold tracking-wider"
              >
                <Upload className="h-6 w-6" />
                IMPORTER {currentMediaType?.label.toUpperCase()}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={currentMediaType?.accept}
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Sélecteur de modèle */}
            <div className="mb-6">
              <label className="font-display text-sm text-muted-foreground mb-3 block">
                MOTEUR DE GÉNÉRATION AI
              </label>
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="videos"
                className="w-full"
              />

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <StatusLED isActive={!!selectedModel} />
                  <span className="text-muted-foreground">
                    {selectedModel ? selectedModel.name : "Aucun modèle sélectionné"}
                  </span>
                </div>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="mb-4">
              <label className="font-display text-sm text-muted-foreground mb-2 block">
                FORMATS
              </label>
              <div className="flex flex-wrap gap-2">
                {aspectRatios.map((ratio) => (
                  <Button
                    key={ratio}
                    size="sm"
                    variant={aspectRatio === ratio ? "default" : "outline"}
                    onClick={() => setAspectRatio(ratio)}
                    className={aspectRatio === ratio ? "btn-3d-pink" : "btn-3d"}
                  >
                    {ratio}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="mb-4">
              <label className="font-display text-sm text-muted-foreground mb-2 block">
                QUALITÉ
              </label>
              <div className="flex flex-wrap gap-2">
                {qualities.map((q) => (
                  <Button
                    key={q}
                    size="sm"
                    variant={quality === q ? "default" : "outline"}
                    onClick={() => setQuality(q)}
                    className={quality === q ? "btn-3d-green" : "btn-3d"}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            {/* Options supplémentaires */}
            <div className="pt-4 border-t border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Résolution max</span>
                <span className="font-bold text-foreground">1920x1080</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Types d'entrée</span>
                <span className="font-bold text-foreground">TEXT / IMAGE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quota restant</span>
                <span className="font-bold text-[hsl(142,76%,50%)]">50 générations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Models Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Film className="h-6 w-6 text-[hsl(280,100%,65%)]" />
            <h2 className="font-display text-2xl font-bold">TOUS LES MODÈLES VIDÉO</h2>
            <Badge variant="outline" className="text-base px-3">
              {models.length}
            </Badge>
          </div>

          <ModelGrid
            models={models}
            category="videos"
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectModel={setSelectedModel}
          />
        </div>
      </main>
    </div>
  );
};

export default GenerateVideos;