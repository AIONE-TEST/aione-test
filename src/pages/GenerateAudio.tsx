import { useState, useMemo, useRef, useCallback } from "react";
import { Volume2, Sparkles, Music, Mic, Radio, Headphones, Upload, Play, Pause, Download, Film, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
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

const durations = ["15s", "30s", "60s", "120s"];

const GenerateAudio = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const { getCreditsForService, getTotalCreditsForService, canGenerate: hasCreditsForService, useCredit } = useCredits();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; data: string }[]>([]);
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
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => file.type.startsWith('audio/'));
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFiles(prev => [...prev, { name: file.name, data: event.target?.result as string }].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFiles(prev => [...prev, { name: file.name, data: event.target?.result as string }].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedFiles.length > 0 ? (
              <div className="relative w-full h-full p-2">
                <div className="flex flex-col gap-2 h-full overflow-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <Button
                        size="icon"
                        className="h-10 w-10 rounded-full btn-3d-orange shrink-0"
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                          <div className="h-full w-1/3 bg-gradient-to-r from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)]" />
                        </div>
                      </div>
                      <button
                        className="p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors shrink-0"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {uploadedFiles.length < 10 && (
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-[hsl(var(--primary))]/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">Ajouter plus de fichiers</span>
                    </div>
                  )}
                </div>
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
                  <p className="font-display text-base text-foreground">Glissez vos fichiers audio ici</p>
                  <p className="text-xs text-muted-foreground">Multi-upload supporté (max 10)</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
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

          {/* Historique des générations */}
          <GenerationHistoryThumbnails type="audio" />
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