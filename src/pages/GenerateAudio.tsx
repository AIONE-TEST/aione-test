import { useState, useMemo, useRef, useCallback } from "react";
import { Volume2, Sparkles, Music, Mic, Radio, Headphones, Upload, File, Download, Play, Pause, LayoutGrid, Gift, ShieldOff, Tag, Paperclip, SkipBack, SkipForward, Repeat, Shuffle, Volume1, VolumeX } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
import { APIKeyModal } from "@/components/APIKeyModal";
import { MediaResultPopup } from "@/components/MediaResultPopup";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { GenerateButton } from "@/components/GenerateButton";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const mediaTypes = [
  { id: "audio", label: "Audio", icon: <Music className="h-4 w-4" />, accept: "audio/*" },
  { id: "document", label: "Lyrics", icon: <File className="h-4 w-4" />, accept: ".txt,.doc,.docx" },
];

const genres = ["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Classical", "Ambient", "Cinematic"];
const moods = ["Énergique", "Calme", "Triste", "Joyeux", "Épique", "Mystérieux"];
const durations = ["15s", "30s", "60s", "120s", "240s"];

type AudioFilter = "all" | "services" | "free" | "uncensored";
type AudioMode = "text-to-music" | "voice-clone" | "tts" | "sfx";

const GenerateAudio = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const { getCreditsForService, getTotalCreditsForService, canGenerate: hasCreditsForService, useCredit } = useCredits();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState("audio");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [duration, setDuration] = useState("30s");
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<AudioFilter>("all");
  const [audioMode, setAudioMode] = useState<AudioMode>("text-to-music");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

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

  const freeModelsCount = filteredModels.filter(m => m.isFree).length;

  // Get credits for selected model
  const serviceName = selectedModel?.provider || "audio";
  const credits = getCreditsForService(serviceName, "standard");
  const totalCredits = getTotalCreditsForService(serviceName, "standard");
  const hasCredits = hasCreditsForService(serviceName, "standard");

  const filters: { id: AudioFilter; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Tous", icon: <LayoutGrid className="h-3 w-3" /> },
    { id: "services", label: "Actifs", icon: <Tag className="h-3 w-3" /> },
    { id: "free", label: "Gratuits", icon: <Gift className="h-3 w-3" /> },
    { id: "uncensored", label: "-18", icon: <ShieldOff className="h-3 w-3" /> },
  ];

  const modes: { id: AudioMode; label: string; icon: React.ReactNode }[] = [
    { id: "text-to-music", label: "TEXT TO MUSIC", icon: <Music className="h-4 w-4" /> },
    { id: "tts", label: "TEXT TO SPEECH", icon: <Mic className="h-4 w-4" /> },
    { id: "voice-clone", label: "VOICE CLONE", icon: <Radio className="h-4 w-4" /> },
    { id: "sfx", label: "SOUND FX", icon: <Headphones className="h-4 w-4" /> },
  ];

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim() || !hasCredits) return;
    
    setIsGenerating(true);
    await useCredit(serviceName, "standard");
    
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent("https://example.com/generated-audio.mp3");
      setShowResultPopup(true);
    }, 3000);
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

  const canGenerateNow = Boolean(selectedModel) && prompt.trim().length > 0;
  const currentMediaType = mediaTypes.find(m => m.id === selectedMediaType);

  // Simulated waveform bars
  const waveformBars = Array.from({ length: 60 }, (_, i) => ({
    height: Math.random() * 80 + 20,
    active: i < (progress / 100) * 60
  }));

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-4">
        {/* Header compact */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] glow-orange">
            <Volume2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-black" style={{
              background: "linear-gradient(135deg, hsl(25,100%,55%), hsl(45,100%,55%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              GÉNÉRATION MUSIQUE & VOIX
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-[hsl(25,100%,55%)] font-bold">{filteredModels.length}</span> modèles • <span className="text-[hsl(142,76%,50%)]">{freeModelsCount} gratuits</span>
            </p>
          </div>
          {/* Filtres compacts */}
          <div className="flex gap-1">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "gap-1 text-xs h-7 px-2",
                  activeFilter === filter.id ? "btn-3d-orange" : ""
                )}
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Mode Buttons - Style Suno */}
        <div className="flex gap-2 mb-4">
          {modes.map((mode) => (
            <Button
              key={mode.id}
              variant={audioMode === mode.id ? "default" : "outline"}
              onClick={() => setAudioMode(mode.id)}
              className={cn(
                "gap-2 font-display text-sm",
                audioMode === mode.id 
                  ? "btn-3d-orange" 
                  : "btn-3d hover:border-[hsl(25,100%,55%)]/50"
              )}
            >
              {mode.icon}
              {mode.label}
            </Button>
          ))}
        </div>

        {/* Layout unifié vertical - MÊME TAILLE QUE VIDEO */}
        <div className="flex flex-col gap-4 max-w-5xl mb-6">
          
          {/* Zone principale - Visualiseur Audio style Suno */}
          <div
            className={cn(
              "panel-3d p-6 min-h-[450px] aspect-[16/9] flex flex-col transition-all duration-300",
              isDragging && "border-[hsl(25,100%,55%)] bg-[hsl(25,100%,55%)]/5"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {isGenerating ? (
              /* Animation de génération */
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-[hsl(25,100%,55%)]/30 border-t-[hsl(25,100%,55%)] animate-spin" />
                  <Music className="h-10 w-10 text-[hsl(25,100%,55%)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="font-display text-xl text-foreground mb-2">Génération en cours...</p>
                  <p className="text-sm text-muted-foreground">Création de votre {audioMode === "text-to-music" ? "musique" : "audio"}</p>
                </div>
                {/* Animated waveform during generation */}
                <div className="flex items-end justify-center gap-1 h-16 w-full max-w-md">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-gradient-to-t from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] rounded-full animate-pulse"
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 50}ms`
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : generatedContent || uploadedAudio ? (
              /* Player style Suno */
              <div className="flex-1 flex flex-col">
                {/* Waveform visualization */}
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex items-end justify-center gap-[2px] h-full w-full max-w-3xl py-8">
                    {waveformBars.map((bar, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 rounded-full transition-all duration-150",
                          bar.active 
                            ? "bg-gradient-to-t from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)]" 
                            : "bg-muted-foreground/30"
                        )}
                        style={{ height: `${bar.height}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="px-6 pb-4">
                  {/* Progress bar */}
                  <div className="mb-4">
                    <Slider
                      value={[progress]}
                      onValueChange={(v) => setProgress(v[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0:{String(Math.floor(progress * 0.3)).padStart(2, '0')}</span>
                      <span>0:30</span>
                    </div>
                  </div>

                  {/* Playback controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Shuffle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        className="h-14 w-14 rounded-full btn-3d-orange"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2 w-32">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {volume[0] === 0 ? <VolumeX className="h-4 w-4" /> : <Volume1 className="h-4 w-4" />}
                      </Button>
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                    </div>

                    {/* Download */}
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>

                <audio ref={audioRef} src={generatedContent || uploadedAudio || undefined} className="hidden" />
              </div>
            ) : (
              /* Empty state - Upload zone */
              <div 
                className="flex-1 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => document.getElementById('file-upload-audio')?.click()}
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(25,100%,55%)]/20 to-[hsl(45,100%,55%)]/20 flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-[hsl(25,100%,55%)]" />
                </div>
                <p className="font-display text-xl text-foreground mb-2">
                  {audioMode === "voice-clone" ? "Importez un audio à cloner" : "Prêt à générer"}
                </p>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {audioMode === "voice-clone" 
                    ? "Glissez un fichier audio ou cliquez pour sélectionner"
                    : "Entrez votre prompt et sélectionnez un modèle pour commencer"
                  }
                </p>
                {audioMode === "voice-clone" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Formats: MP3, WAV, OGG, FLAC • Max 50MB
                  </p>
                )}
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

          {/* Zone Prompt */}
          <div className="panel-3d p-3">
            <div className="flex gap-2 items-start">
              <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  audioMode === "text-to-music" 
                    ? "Décrivez la musique... Ex: Musique épique orchestrale, style Hans Zimmer, avec violons et percussions"
                    : audioMode === "tts"
                    ? "Entrez le texte à convertir en voix..."
                    : audioMode === "sfx"
                    ? "Décrivez l'effet sonore... Ex: Explosion massive, tonnerre, pluie tropicale"
                    : "Entrez le texte à dire avec la voix clonée..."
                }
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

          {/* MODÈLES AI & OPTIONS */}
          <div className="panel-3d p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))]" />
              <span className="font-display text-sm font-bold">MODÈLES AI & OPTIONS</span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {/* Sélecteur de modèle */}
              <div>
                <label className="font-display text-xs text-muted-foreground mb-1 block">MOTEUR AI</label>
                <ModelSelector
                  models={filteredModels}
                  selectedModel={selectedModel}
                  onSelectModel={setSelectedModel}
                  category="audio"
                  className="w-full"
                />
              </div>

              {/* Genre (for music) */}
              {audioMode === "text-to-music" && (
                <div>
                  <label className="font-display text-xs text-muted-foreground mb-1 block">GENRE</label>
                  <div className="flex flex-wrap gap-1">
                    {genres.slice(0, 4).map((genre) => (
                      <Button
                        key={genre}
                        size="sm"
                        variant={selectedGenre === genre ? "default" : "outline"}
                        onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                        className={cn(
                          "h-7 px-2 text-xs",
                          selectedGenre === genre ? "btn-3d-orange" : "btn-3d"
                        )}
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mood (for music) */}
              {audioMode === "text-to-music" && (
                <div>
                  <label className="font-display text-xs text-muted-foreground mb-1 block">AMBIANCE</label>
                  <div className="flex flex-wrap gap-1">
                    {moods.slice(0, 3).map((mood) => (
                      <Button
                        key={mood}
                        size="sm"
                        variant={selectedMood === mood ? "default" : "outline"}
                        onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                        className={cn(
                          "h-7 px-2 text-xs",
                          selectedMood === mood ? "btn-3d-pink" : "btn-3d"
                        )}
                      >
                        {mood}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="font-display text-xs text-muted-foreground mb-1 block">DURÉE</label>
                <div className="flex gap-1">
                  {durations.slice(0, 4).map((d) => (
                    <Button
                      key={d}
                      size="sm"
                      variant={duration === d ? "default" : "outline"}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "flex-1 h-7 px-1 text-xs",
                        duration === d ? "btn-3d-green" : "btn-3d"
                      )}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
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

        {/* Grille des modèles */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Music className="h-5 w-5 text-[hsl(25,100%,55%)]" />
            <h2 className="font-display text-lg font-bold">MODÈLES AUDIO COMPATIBLES</h2>
            <Badge variant="outline" className="text-sm">{filteredModels.length}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredModels.map((model) => (
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
        mediaType="audio"
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

export default GenerateAudio;
