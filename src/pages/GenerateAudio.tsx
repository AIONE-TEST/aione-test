import { useState, useMemo, useRef, useCallback } from "react";
import { Volume2, Sparkles, Zap, Music, Mic, Radio, Headphones, Upload, File, Type, Download, Play, Pause, LayoutGrid, Gift, ShieldOff, Tag } from "lucide-react";
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
  { id: "audio", label: "Audio", icon: <Music className="h-5 w-5" />, accept: "audio/*" },
  { id: "document", label: "Document", icon: <File className="h-5 w-5" />, accept: ".pdf,.doc,.docx,.txt" },
];

const qualities = ["standard", "hd", "ultra"];
const durations = ["15s", "30s", "60s", "120s"];

type AudioFilter = "all" | "services" | "free" | "uncensored";

const GenerateAudio = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedMediaType, setSelectedMediaType] = useState("audio");
  const [quality, setQuality] = useState("standard");
  const [duration, setDuration] = useState("30s");
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<AudioFilter>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allModels = useMemo(() => {
    const categoryModels = getModelsByCategory("audio");
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

  const filters: { id: AudioFilter; label: string; icon: React.ReactNode }[] = [
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
    if (files.length > 0 && files[0].type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedAudio(event.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedAudio(event.target?.result as string);
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] glow-orange">
              <Volume2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black tracking-wider" style={{
                background: "linear-gradient(135deg, hsl(25,100%,55%), hsl(45,100%,55%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                GÉNÉRATION AUDIO & VOIX
              </h1>
              <p className="text-lg text-muted-foreground tracking-wide">
                Créez de la musique et des voix avec l'IA • <span className="text-[hsl(25,100%,55%)] font-bold">{filteredModels.length} modèles</span> disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "gap-2 text-sm font-semibold transition-all",
                activeFilter === filter.id 
                  ? "btn-3d-orange" 
                  : "hover:border-[hsl(25,100%,55%)]/50"
              )}
            >
              {filter.icon}
              {filter.label}
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-full text-xs",
                activeFilter === filter.id 
                  ? "bg-black/20 text-white" 
                  : "bg-muted text-muted-foreground"
              )}>
                {filterCounts[filter.id]}
              </span>
            </Button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Button className="btn-3d-orange gap-2 text-base hover:scale-105 transition-transform">
            <Music className="h-5 w-5" />
            TEXT TO MUSIC
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <Mic className="h-5 w-5" />
            TEXT TO SPEECH
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <Radio className="h-5 w-5" />
            VOICE CLONING
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <Headphones className="h-5 w-5" />
            SOUND EFFECTS
          </Button>
        </div>

        {/* Main Layout - ORDER: Source -> Result -> Prompt -> Engine */}
        <div className="flex flex-col gap-6 max-w-6xl mb-10">
          
          {/* 1. AUDIO SOURCE - En haut */}
          <div className="panel-3d p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xl font-bold text-foreground">AUDIO SOURCE (OPTIONNEL)</span>
              {uploadedAudio && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedAudio(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Changer
                </Button>
              )}
            </div>
            
            <div
              className={cn(
                "canvas-3d aspect-[3/1] flex items-center justify-center transition-all duration-300 cursor-pointer",
                isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-audio')?.click()}
            >
              {uploadedAudio ? (
                <div className="flex items-center gap-6 w-full px-8">
                  <Button
                    size="lg"
                    className="h-16 w-16 rounded-full btn-3d-orange"
                    onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-gradient-to-r from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)]" />
                    </div>
                  </div>
                  <audio src={uploadedAudio} className="hidden" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(25,100%,55%)]/20 to-[hsl(45,100%,55%)]/20 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-[hsl(25,100%,55%)]" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground mb-2">
                      Glissez-déposez un fichier audio ici
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou cliquez pour sélectionner (Voice Cloning)
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés : MP3, WAV, OGG, FLAC · Max 50MB
                  </p>
                </div>
              )}
              <input
                id="file-upload-audio"
                type="file"
                accept="audio/*"
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
            
            <div className="canvas-3d aspect-[3/1] flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-[hsl(25,100%,55%)]/30 border-t-[hsl(25,100%,55%)] animate-spin" />
                  <p className="font-display text-lg text-muted-foreground animate-pulse">
                    Génération en cours...
                  </p>
                </div>
              ) : generatedContent ? (
                <div className="flex items-center gap-6 w-full px-8">
                  <Button size="lg" className="h-16 w-16 rounded-full btn-3d-green">
                    <Play className="h-8 w-8" />
                  </Button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-[hsl(142,76%,50%)] to-[hsl(174,100%,50%)]" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                    <Music className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-display text-lg text-muted-foreground">
                    L'audio généré apparaîtra ici
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
              placeholder="Décrivez l'audio que vous souhaitez créer... Ex: Une musique épique orchestrale avec des choeurs, style Hans Zimmer"
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
                  className="btn-3d-orange text-lg px-8 py-6 font-display font-bold tracking-wider"
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
                models={filteredModels}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="audio"
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

            {/* Duration */}
            <div className="mb-4">
              <label className="font-display text-sm text-muted-foreground mb-2 block">
                DURÉE
              </label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={duration === d ? "default" : "outline"}
                    onClick={() => setDuration(d)}
                    className={duration === d ? "btn-3d-pink" : "btn-3d"}
                  >
                    {d}
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
                    {q.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Options supplémentaires */}
            <div className="pt-4 border-t border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Format de sortie</span>
                <span className="font-bold text-foreground">MP3, WAV, FLAC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Durée max</span>
                <span className="font-bold text-foreground">5 minutes</span>
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
            <Volume2 className="h-6 w-6 text-[hsl(25,100%,55%)]" />
            <h2 className="font-display text-2xl font-bold">TOUS LES MODÈLES AUDIO</h2>
            <Badge variant="outline" className="text-base px-3">
              {filteredModels.length}
            </Badge>
          </div>

          <ModelGrid
            models={filteredModels}
            category="audio"
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectModel={setSelectedModel}
          />
        </div>
      </main>
    </div>
  );
};

export default GenerateAudio;