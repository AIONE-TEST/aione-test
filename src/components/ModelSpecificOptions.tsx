import { useState } from "react";
import { 
  Mic, Music, Brush, Palette, Sliders, Layers, 
  Video, Wand2, Volume2, VolumeX, Maximize, Grid3X3,
  RefreshCw, Shuffle, Sparkles, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AIModel } from "@/data/aiModels";
import { cn } from "@/lib/utils";

interface ModelSpecificOptionsProps {
  model: AIModel | null;
  options: Record<string, any>;
  onOptionsChange: (options: Record<string, any>) => void;
  className?: string;
}

// Configuration des options spécifiques par modèle
const modelConfigs: Record<string, {
  name: string;
  options: Array<{
    id: string;
    label: string;
    type: "toggle" | "slider" | "select" | "buttons";
    icon?: React.ReactNode;
    values?: string[];
    min?: number;
    max?: number;
    step?: number;
    default?: any;
  }>;
}> = {
  // Vidéo - Veo 3.1
  "veo-3-1": {
    name: "Google Veo 3.1",
    options: [
      { id: "audio", label: "Audio intégré", type: "toggle", icon: <Volume2 className="h-4 w-4" />, default: true },
      { id: "turbo", label: "Mode Turbo", type: "toggle", icon: <Zap className="h-4 w-4" />, default: false },
      { id: "duration", label: "Durée (sec)", type: "slider", min: 5, max: 60, step: 5, default: 10 },
    ]
  },
  // Vidéo - Runway Gen-3
  "runway-gen3": {
    name: "Runway Gen-3 Alpha",
    options: [
      { id: "motion", label: "Motion Brush", type: "toggle", icon: <Brush className="h-4 w-4" />, default: false },
      { id: "extend", label: "Extend Video", type: "toggle", icon: <Maximize className="h-4 w-4" />, default: false },
      { id: "style", label: "Style", type: "buttons", values: ["Cinematic", "Raw", "Anime", "3D"], default: "Cinematic" },
    ]
  },
  // Vidéo - Kling AI
  "kling-ai": {
    name: "Kling AI",
    options: [
      { id: "lipSync", label: "Lip Sync", type: "toggle", icon: <Mic className="h-4 w-4" />, default: false },
      { id: "expression", label: "Expression Control", type: "toggle", icon: <Sparkles className="h-4 w-4" />, default: false },
      { id: "quality", label: "Qualité", type: "buttons", values: ["Standard", "Pro", "Master"], default: "Pro" },
    ]
  },
  // Image - Midjourney
  "midjourney-v6": {
    name: "Midjourney V6",
    options: [
      { id: "stylize", label: "Stylize", type: "slider", min: 0, max: 1000, step: 50, default: 100 },
      { id: "chaos", label: "Chaos", type: "slider", min: 0, max: 100, step: 10, default: 0 },
      { id: "weird", label: "Weird", type: "slider", min: 0, max: 3000, step: 100, default: 0 },
      { id: "version", label: "Version", type: "buttons", values: ["V6", "V6.1", "Niji"], default: "V6" },
    ]
  },
  // Image - DALL-E 3
  "dall-e-3": {
    name: "DALL-E 3",
    options: [
      { id: "style", label: "Style", type: "buttons", values: ["vivid", "natural"], default: "vivid" },
      { id: "quality", label: "Qualité", type: "buttons", values: ["standard", "hd"], default: "standard" },
    ]
  },
  // Image - Stable Diffusion
  "stable-diffusion-3": {
    name: "Stable Diffusion 3.5",
    options: [
      { id: "steps", label: "Steps", type: "slider", min: 20, max: 100, step: 5, default: 30 },
      { id: "guidance", label: "Guidance Scale", type: "slider", min: 1, max: 20, step: 0.5, default: 7 },
      { id: "sampler", label: "Sampler", type: "buttons", values: ["Euler", "DPM++", "DDIM", "UniPC"], default: "DPM++" },
    ]
  },
  // Audio - ElevenLabs
  "elevenlabs": {
    name: "ElevenLabs",
    options: [
      { id: "voice", label: "Voix", type: "buttons", values: ["Rachel", "Adam", "Bella", "Josh"], default: "Rachel" },
      { id: "stability", label: "Stabilité", type: "slider", min: 0, max: 100, step: 5, default: 50 },
      { id: "clarity", label: "Clarté", type: "slider", min: 0, max: 100, step: 5, default: 75 },
      { id: "emotion", label: "Émotion", type: "buttons", values: ["Neutre", "Joyeux", "Triste", "Excité"], default: "Neutre" },
    ]
  },
  // Audio - Suno
  "suno-ai": {
    name: "Suno AI",
    options: [
      { id: "genre", label: "Genre", type: "buttons", values: ["Pop", "Rock", "Jazz", "Classical", "Electronic"], default: "Pop" },
      { id: "instrumental", label: "Instrumental", type: "toggle", icon: <Music className="h-4 w-4" />, default: false },
      { id: "duration", label: "Durée (sec)", type: "slider", min: 30, max: 240, step: 30, default: 120 },
    ]
  },
};

export function ModelSpecificOptions({
  model,
  options,
  onOptionsChange,
  className,
}: ModelSpecificOptionsProps) {
  if (!model) return null;

  const config = modelConfigs[model.id];
  if (!config) return null;

  const updateOption = (id: string, value: any) => {
    onOptionsChange({ ...options, [id]: value });
  };

  return (
    <div className={cn("panel-3d p-3 space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Sliders className="h-4 w-4 text-[hsl(var(--secondary))]" />
        <span className="font-display text-xs font-bold">OPTIONS {config.name.toUpperCase()}</span>
      </div>

      <div className="space-y-3">
        {config.options.map((opt) => {
          const currentValue = options[opt.id] ?? opt.default;

          if (opt.type === "toggle") {
            return (
              <div key={opt.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span className="text-xs font-display">{opt.label}</span>
                </div>
                <Button
                  size="sm"
                  variant={currentValue ? "default" : "outline"}
                  className={cn(
                    "h-7 px-3 text-xs",
                    currentValue ? "btn-3d-cyan" : "btn-3d"
                  )}
                  onClick={() => updateOption(opt.id, !currentValue)}
                >
                  {currentValue ? "ON" : "OFF"}
                </Button>
              </div>
            );
          }

          if (opt.type === "slider") {
            return (
              <div key={opt.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display">{opt.label}</span>
                  <Badge variant="outline" className="text-[10px]">{currentValue}</Badge>
                </div>
                <Slider
                  value={[currentValue]}
                  onValueChange={([val]) => updateOption(opt.id, val)}
                  min={opt.min}
                  max={opt.max}
                  step={opt.step}
                  className="w-full"
                />
              </div>
            );
          }

          if (opt.type === "buttons") {
            return (
              <div key={opt.id} className="space-y-1">
                <span className="text-xs font-display block">{opt.label}</span>
                <div className="flex flex-wrap gap-1">
                  {opt.values?.map((val) => (
                    <Button
                      key={val}
                      size="sm"
                      variant={currentValue === val ? "default" : "outline"}
                      className={cn(
                        "h-6 px-2 text-[10px]",
                        currentValue === val ? "btn-3d-pink" : "btn-3d"
                      )}
                      onClick={() => updateOption(opt.id, val)}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

// Hook pour obtenir les options disponibles pour un modèle
export function useModelOptions(modelId: string | undefined) {
  const [options, setOptions] = useState<Record<string, any>>({});

  const config = modelId ? modelConfigs[modelId] : null;
  const hasSpecificOptions = !!config;

  const resetToDefaults = () => {
    if (config) {
      const defaults: Record<string, any> = {};
      config.options.forEach(opt => {
        defaults[opt.id] = opt.default;
      });
      setOptions(defaults);
    }
  };

  return {
    options,
    setOptions,
    hasSpecificOptions,
    resetToDefaults,
    config,
  };
}
