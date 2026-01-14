import { useState, useMemo, useCallback, useRef } from "react";
import { Wand2, Sparkles, Upload, Maximize, Brush, Eraser, Palette, ImagePlus, Layers, Scissors, ZoomIn, Download, Type, Image, Video, File, Archive, Music } from "lucide-react";
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

interface RetouchTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const retouchTools: RetouchTool[] = [
  { id: "outpainting", name: "Outpainting", icon: <ImagePlus className="h-5 w-5" />, description: "Étendre l'image au-delà de ses bords" },
  { id: "upscale", name: "Upscale 4K/8K", icon: <Maximize className="h-5 w-5" />, description: "Augmenter la résolution" },
  { id: "denoise", name: "Débruitage", icon: <Brush className="h-5 w-5" />, description: "Réduire le bruit" },
  { id: "remove-bg", name: "Suppression de Fond", icon: <Eraser className="h-5 w-5" />, description: "Retirer l'arrière-plan" },
  { id: "enhance", name: "Améliorer", icon: <Sparkles className="h-5 w-5" />, description: "Amélioration automatique" },
  { id: "colorize", name: "Coloriser", icon: <Palette className="h-5 w-5" />, description: "Coloriser les images N&B" },
  { id: "restore", name: "Restaurer", icon: <Layers className="h-5 w-5" />, description: "Restaurer les anciennes photos" },
  { id: "inpainting", name: "Inpainting", icon: <Scissors className="h-5 w-5" />, description: "Modifier des zones spécifiques" },
];

const mediaTypes = [
  { id: "image", label: "Image", icon: <Image className="h-5 w-5" />, accept: "image/*" },
  { id: "video", label: "Vidéo", icon: <Video className="h-5 w-5" />, accept: "video/*" },
  { id: "audio", label: "Audio", icon: <Music className="h-5 w-5" />, accept: "audio/*" },
  { id: "document", label: "Document", icon: <File className="h-5 w-5" />, accept: ".pdf,.doc,.docx,.txt" },
  { id: "archive", label: "Archive", icon: <Archive className="h-5 w-5" />, accept: ".zip,.rar,.7z" },
];

const GenerateRetouch = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("upscale");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("retouch");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const freeModelsCount = models.filter(m => m.isFree).length;

  const handleGenerate = async () => {
    if (!selectedModel || !uploadedImage) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setResultImage(uploadedImage);
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

  const canGenerate = Boolean(selectedModel) && Boolean(uploadedImage);

  const currentMediaType = mediaTypes.find(m => m.id === selectedMediaType);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(174,100%,50%)] to-[hsl(142,76%,50%)] glow-cyan">
              <Wand2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black gradient-text-cyan tracking-wider">
                RETOUCHE PHOTO / VIDÉO
              </h1>
              <p className="text-lg text-muted-foreground tracking-wide">
                Upscaling 4K/8K · Débruitage · Suppression fond · Restauration · <span className="text-[hsl(var(--primary))] font-bold">{models.length} outils</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tools Bar */}
        <div className="panel-3d p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span className="font-display text-lg font-bold">OUTILS</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {retouchTools.map((tool) => (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "outline"}
                onClick={() => setSelectedTool(tool.id)}
                className={cn(
                  "gap-2 transition-all duration-300",
                  selectedTool === tool.id ? "btn-3d-cyan scale-105" : "btn-3d hover:scale-102"
                )}
              >
                {tool.icon}
                <span className="font-display text-sm">{tool.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Layout - ORDER: Source -> Result -> Prompt -> Engine */}
        <div className="flex flex-col gap-6 max-w-6xl mb-10">
          
          {/* 1. IMAGE SOURCE - En haut */}
          <div className="panel-3d p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xl font-bold text-foreground">IMAGE SOURCE</span>
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
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Source" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(174,100%,50%)]/20 to-[hsl(142,76%,50%)]/20 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground mb-2">
                      Glissez-déposez une image ici
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou cliquez pour sélectionner
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés : PNG, JPG, WEBP · Max 50MB · Jusqu'à 8192x8192
                  </p>
                </div>
              )}
              <input
                id="file-upload"
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
              {resultImage && (
                <Button variant="ghost" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
              )}
            </div>
            
            <div className="canvas-3d aspect-video flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-[hsl(var(--primary))]/30 border-t-[hsl(var(--primary))] animate-spin" />
                  <p className="font-display text-lg text-muted-foreground animate-pulse">
                    Traitement en cours...
                  </p>
                </div>
              ) : resultImage ? (
                <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                    <ZoomIn className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="font-display text-lg text-muted-foreground">
                    Le résultat apparaîtra ici
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez un outil et lancez la retouche
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
              placeholder={`Instructions de retouche pour ${retouchTools.find(t => t.id === selectedTool)?.name}... Ex: Améliorer la netteté, corriger les couleurs, supprimer les imperfections.`}
              className="input-3d min-h-[100px] text-lg resize-none mb-4"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-base px-3 py-1">
                  {freeModelsCount} GRATUITS
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {!uploadedImage && (
                  <span className="text-sm text-muted-foreground">
                    Uploadez une image pour activer la génération
                  </span>
                )}
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className="btn-3d-cyan text-lg px-8 py-6 font-display font-bold tracking-wider"
                >
                  {isGenerating ? "TRAITEMENT..." : "GÉNÉRER"}
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
                MOTEUR DE RETOUCHE AI
              </label>
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="retouch"
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

            {/* Options supplémentaires */}
            <div className="pt-4 border-t border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Résolution max</span>
                <span className="font-bold text-foreground">8192x8192</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Formats supportés</span>
                <span className="font-bold text-foreground">PNG, JPG, WEBP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quota restant</span>
                <span className="font-bold text-[hsl(142,76%,50%)]">50 générations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Wand2 className="h-6 w-6 text-[hsl(var(--primary))]" />
            <h2 className="font-display text-2xl font-bold">TOUS LES OUTILS DE RETOUCHE</h2>
            <Badge variant="outline" className="text-base px-3">
              {models.length}
            </Badge>
          </div>

          <ModelGrid
            models={models}
            category="retouch"
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectModel={setSelectedModel}
          />
        </div>
      </main>
    </div>
  );
};

export default GenerateRetouch;