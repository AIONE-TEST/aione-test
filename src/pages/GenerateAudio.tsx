import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Volume2, Sparkles, Music, Mic, Radio, Headphones, Upload, Play, Pause, Download } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
import { APIKeyModal } from "@/components/APIKeyModal";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { PromptEditorEnhanced } from "@/components/PromptEditorEnhanced";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { MediaHistoryPanel } from "@/components/MediaHistoryPanel";
import { FloatingMediaPreview } from "@/components/FloatingMediaPreview";
import { AppTileCardExpanded } from "@/components/AppTileCardExpanded";
import { ModelSpecificOptions, useModelOptions } from "@/components/ModelSpecificOptions";
import { SunoMusicInterface } from "@/components/SunoMusicInterface";
import { InfoTooltip } from "@/components/InfoTooltip";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const durations = ["15s", "30s", "60s", "120s"];

const GenerateAudio = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const { getCreditsForService, getTotalCreditsForService, canGenerate: hasCreditsForService, useCredit } = useCredits();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [duration, setDuration] = useState("30s");
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [audioMode, setAudioMode] = useState<"music" | "voice" | "clone" | "effects">("music");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nouveaux états
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" | "audio"; x: number; y: number } | null>(null);
  const [expandedApp, setExpandedApp] = useState<{ model: AIModel; x: number; y: number } | null>(null);
  const { options: modelOptions, setOptions: setModelOptions, hasSpecificOptions } = useModelOptions(selectedModel?.id);

  // Scroll en haut (Point 9)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("audio");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const freeModelsCount = models.filter(m => m.isFree).length;

  const serviceName = selectedModel?.provider || "audio";
  const credits = getCreditsForService(serviceName, "standard");
  const totalCredits = getTotalCreditsForService(serviceName, "standard");
  const hasCredits = hasCreditsForService(serviceName, "standard");

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim() || !hasCredits) return;
    
    setIsGenerating(true);
    await useCredit(serviceName, "standard");
    
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent("generated-audio.mp3");
    }, 4000);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] glow-orange">
            <Volume2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black tracking-wider" style={{
              background: "linear-gradient(135deg, hsl(25,100%,55%), hsl(45,100%,55%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              GÉNÉRATION AUDIO & VOIX
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-[hsl(25,100%,55%)] font-bold">{models.length}</span> modèles • <span className="text-[hsl(142,76%,50%)]">{freeModelsCount} gratuits</span>
            </p>
          </div>
        </div>

        {/* Quick Actions avec icônes INFO */}
        <div className="flex gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              className={cn("gap-1 text-xs", audioMode === "music" ? "btn-3d-orange" : "btn-3d")}
              onClick={() => setAudioMode("music")}
            >
              <Music className="h-4 w-4" /> MUSIQUE
            </Button>
            <InfoTooltip 
              title="Mode Musique"
              description="Génère des morceaux de musique complets avec mélodie, rythme et instruments."
              example="Musique épique orchestrale style Hans Zimmer"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              className={cn("gap-1 text-xs", audioMode === "voice" ? "btn-3d-orange" : "btn-3d")}
              onClick={() => setAudioMode("voice")}
            >
              <Mic className="h-4 w-4" /> VOIX
            </Button>
            <InfoTooltip 
              title="Mode Voix"
              description="Synthèse vocale text-to-speech avec différentes voix et langues."
              example="Voix masculine grave en français"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              className={cn("gap-1 text-xs", audioMode === "clone" ? "btn-3d-orange" : "btn-3d")}
              onClick={() => setAudioMode("clone")}
            >
              <Radio className="h-4 w-4" /> CLONAGE
            </Button>
            <InfoTooltip 
              title="Mode Clonage"
              description="Clone une voix à partir d'un échantillon audio pour créer une réplique."
              example="Uploadez un audio de 30s minimum"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              className={cn("gap-1 text-xs", audioMode === "effects" ? "btn-3d-orange" : "btn-3d")}
              onClick={() => setAudioMode("effects")}
            >
              <Headphones className="h-4 w-4" /> EFFETS
            </Button>
            <InfoTooltip 
              title="Mode Effets"
              description="Génère des effets sonores et bruitages pour vos projets."
              example="Bruit de pluie, explosion, pas sur gravier"
            />
          </div>
        </div>

        {/* LAYOUT: 2/3 + 1/3 */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          {/* Colonne principale */}
          <div className="space-y-4">
            {/* 1. INTERFACE SUNO MUSIC - Style waveform */}
            <SunoMusicInterface
              audioUrl={generatedContent || undefined}
              title={prompt.slice(0, 50) || "Nouvelle piste"}
              artist="AIONE Music Generator"
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />

            {/* Zone d'upload audio source (pour clonage/remix) */}
            {(audioMode === "clone" || uploadedAudio) && (
              <div
                className={cn(
                  "panel-3d p-4 flex items-center gap-4 transition-all duration-300",
                  isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedAudio ? (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] flex items-center justify-center">
                        <Music className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Audio source chargé</p>
                        <p className="text-xs text-muted-foreground">Prêt pour le clonage/remix</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); setUploadedAudio(null); }}
                      >
                        Supprimer
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Importer un audio source</p>
                        <p className="text-xs text-muted-foreground">Pour clonage vocal ou remix</p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}

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
              placeholder="Décrivez l'audio... Ex: Musique épique orchestrale, style Hans Zimmer"
              category="audio"
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
                category="audio"
                className="w-full"
              />

              {hasSpecificOptions && (
                <ModelSpecificOptions
                  model={selectedModel}
                  options={modelOptions}
                  onOptionsChange={setModelOptions}
                />
              )}

              {/* Durée */}
              <div>
                <label className="font-display text-xs text-muted-foreground block mb-1">DURÉE</label>
                <div className="flex gap-1">
                  {durations.map((d) => (
                    <Button
                      key={d}
                      size="sm"
                      variant={duration === d ? "default" : "outline"}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "flex-1 text-xs",
                        duration === d ? "btn-3d-orange" : "btn-3d"
                      )}
                    >
                      {d}
                    </Button>
                  ))}
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
            category="audio"
            currentMedia={uploadedAudio}
            onSelectMedia={(media) => {
              if (media.url) setUploadedAudio(media.url);
            }}
            onPreviewMedia={(media) => {
              if (media.url) {
                setPreviewMedia({
                  url: media.url,
                  type: "audio",
                  x: window.innerWidth / 4,
                  y: window.innerHeight / 4
                });
              }
            }}
          />
        </div>
      </main>

      {/* Modals */}
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

export default GenerateAudio;
