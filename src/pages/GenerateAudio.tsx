import { useState, useMemo, useRef, useCallback } from "react";
import { Volume2, Sparkles, Music, Mic, Radio, Headphones, Upload, Play, Pause, Download, Film } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
import { APIKeyModal } from "@/components/APIKeyModal";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { PromptEditorEnhanced } from "@/components/PromptEditorEnhanced";
import { ViewModeToggle } from "@/components/ViewModeToggle";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const canGenerateNow = Boolean(selectedModel) && prompt.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-4">
        {/* Header compact */}
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

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <Button size="sm" className="btn-3d-orange gap-1 text-xs">
            <Music className="h-4 w-4" /> MUSIQUE
          </Button>
          <Button size="sm" className="btn-3d gap-1 text-xs">
            <Mic className="h-4 w-4" /> VOIX
          </Button>
          <Button size="sm" className="btn-3d gap-1 text-xs">
            <Radio className="h-4 w-4" /> CLONAGE
          </Button>
          <Button size="sm" className="btn-3d gap-1 text-xs">
            <Headphones className="h-4 w-4" /> EFFETS
          </Button>
        </div>

        {/* Layout: Vertical - Options sous le prompt */}
        <div className="w-full max-w-4xl space-y-3 mb-6">
          {/* Zone Upload (principale) - taille réduite */}
          <div
            className={cn(
              "panel-3d p-3 aspect-video flex items-center justify-center transition-all duration-300 cursor-pointer",
              isDragging && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
            )}
            style={{ maxHeight: "35vh" }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedAudio ? (
              <div className="flex items-center gap-4 w-full px-6">
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full btn-3d-orange"
                  onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)]" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70"
                  onClick={(e) => { e.stopPropagation(); setUploadedAudio(null); }}
                >
                  Changer
                </Button>
              </div>
            ) : generatedContent ? (
              <div className="flex items-center gap-4 w-full px-6">
                <Button size="icon" className="h-12 w-12 rounded-full btn-3d-green">
                  <Play className="h-6 w-6" />
                </Button>
                <div className="flex-1 h-2 bg-muted rounded-full" />
                <Button size="icon" variant="ghost" className="h-10 w-10">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            ) : isGenerating ? (
              <div className="h-12 w-12 rounded-full border-4 border-[hsl(25,100%,55%)]/30 border-t-[hsl(25,100%,55%)] animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(25,100%,55%)]/20 to-[hsl(45,100%,55%)]/20 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-[hsl(25,100%,55%)]" />
                </div>
                <div>
                  <p className="font-display text-base text-foreground">Audio source (optionnel)</p>
                  <p className="text-xs text-muted-foreground">Glissez ou cliquez</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Prompt avec aide */}
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
              category="audio"
              className="w-full"
            />

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
                      "flex-1 text-xs h-8",
                      duration === d ? "btn-3d-orange" : "btn-3d"
                    )}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            {/* Credits */}
            <CreditsDisplay 
              credits={credits} 
              totalCredits={totalCredits} 
              serviceName={selectedModel?.name}
              compact
            />
          </div>
        </div>

        {/* Grille des modèles */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Film className="h-5 w-5 text-[hsl(25,100%,55%)]" />
            <h2 className="font-display text-lg font-bold">MODÈLES AUDIO COMPATIBLES</h2>
            <Badge variant="outline" className="text-sm">{models.length}</Badge>
            <div className="ml-auto">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
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