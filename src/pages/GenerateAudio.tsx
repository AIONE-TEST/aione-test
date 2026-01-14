import { useState, useMemo, useRef } from "react";
import { Volume2, Sparkles, Zap, Music, Mic, Radio, Headphones, Upload, File } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { PromptEditor } from "@/components/PromptEditor";
import { GenerationCanvas } from "@/components/GenerationCanvas";
import { GenerationOptions, GenerationSettings } from "@/components/GenerationOptions";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mediaTypes = [
  { id: "audio", label: "Audio", icon: <Music className="h-5 w-5" />, accept: "audio/*" },
  { id: "document", label: "Document", icon: <File className="h-5 w-5" />, accept: ".pdf,.doc,.docx,.txt" },
];

const GenerateAudio = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState("audio");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<GenerationSettings>({
    mode: "text-to-content",
    aspectRatio: "1:1",
    quality: "standard",
    duration: 30,
  });

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("audio");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim()) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 5000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("File selected:", files[0].name);
    }
  };

  const canGenerate = Boolean(selectedModel) && prompt.trim().length > 0;
  const currentMediaType = mediaTypes.find(m => m.id === selectedMediaType);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[280px] min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] glow-orange">
            <Volume2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-wider" style={{
              background: "linear-gradient(135deg, hsl(25,100%,55%), hsl(45,100%,55%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              GÉNÉRATION AUDIO & VOIX
            </h1>
            <p className="text-lg text-muted-foreground">
              <span className="text-[hsl(25,100%,55%)] font-bold">{models.length}</span> MODÈLES DISPONIBLES
            </p>
          </div>
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

        {/* Main Layout - Vertical */}
        <div className="flex flex-col gap-6 max-w-4xl">
          {/* Canvas */}
          <GenerationCanvas
            selectedModel={selectedModel}
            generatedContent={generatedContent}
            isGenerating={isGenerating}
            contentType="audio"
          />

          {/* Prompt Editor */}
          <PromptEditor
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            canGenerate={canGenerate}
            placeholder="Ex: Une musique épique orchestrale avec des choeurs, style Hans Zimmer, tempo rapide..."
          />

          {/* Model Selector & Options */}
          <div className="panel-3d p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[hsl(var(--secondary))]" />
              <span className="font-display text-lg font-bold">MOTEUR DE GÉNÉRATION & OPTIONS</span>
            </div>

            {/* Gros bouton d'import média */}
            <div>
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
                className="w-full h-14 btn-3d-purple gap-3 text-lg font-display font-bold tracking-wider"
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

            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              category="audio"
            />
          </div>

          {/* Options */}
          <GenerationOptions
            contentType="audio"
            options={options}
            onOptionsChange={setOptions}
          />

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="btn-3d-orange h-14 text-xl font-bold gap-3 hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                GÉNÉRATION...
              </>
            ) : (
              <>
                <Zap className="h-6 w-6" />
                GÉNÉRER
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GenerateAudio;