import { useState } from "react";
import { Settings2, ChevronDown, ChevronUp, Image, Film, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface GenerationOptionsProps {
  contentType?: "image" | "video" | "audio" | "3d";
  options: GenerationSettings;
  onOptionsChange: (options: GenerationSettings) => void;
  className?: string;
}

export interface GenerationSettings {
  mode: "text-to-content" | "image-to-content";
  aspectRatio: string;
  quality: string;
  duration?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  negativePrompt?: string;
}

const aspectRatios = [
  { value: "1:1", label: "1:1", icon: "◻️" },
  { value: "16:9", label: "16:9", icon: "▭" },
  { value: "9:16", label: "9:16", icon: "▯" },
  { value: "4:3", label: "4:3", icon: "▭" },
  { value: "3:4", label: "3:4", icon: "▯" },
  { value: "21:9", label: "21:9", icon: "▬" },
];

const qualities = [
  { value: "draft", label: "Draft", color: "text-muted-foreground" },
  { value: "standard", label: "Standard", color: "text-foreground" },
  { value: "hd", label: "HD", color: "text-[hsl(174,100%,50%)]" },
  { value: "4k", label: "4K", color: "text-[hsl(320,100%,60%)]" },
];

export function GenerationOptions({
  contentType = "image",
  options,
  onOptionsChange,
  className,
}: GenerationOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateOption = <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[hsl(var(--secondary))]" />
              <span className="font-medium text-sm">Moteur de Génération & Options</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-6">
            {/* Mode Selection */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Mode de génération</Label>
              <div className="flex gap-2">
                <Button
                  variant={options.mode === "text-to-content" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onOptionsChange({ ...options, mode: "text-to-content" })}
                  className={cn(
                    "flex-1 gap-2",
                    options.mode === "text-to-content" &&
                      "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30"
                  )}
                >
                  {contentType === "image" && <Image className="h-4 w-4" />}
                  {contentType === "video" && <Film className="h-4 w-4" />}
                  {contentType === "audio" && <Music className="h-4 w-4" />}
                  Texte → {contentType === "image" ? "Image" : contentType === "video" ? "Vidéo" : "Audio"}
                </Button>
                <Button
                  variant={options.mode === "image-to-content" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onOptionsChange({ ...options, mode: "image-to-content" })}
                  className={cn(
                    "flex-1 gap-2",
                    options.mode === "image-to-content" &&
                      "bg-[hsl(var(--secondary))]/20 text-[hsl(var(--secondary))] border-[hsl(var(--secondary))]/30"
                  )}
                >
                  Image → {contentType === "image" ? "Image" : contentType === "video" ? "Vidéo" : "Audio"}
                </Button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Format</Label>
              <div className="flex flex-wrap gap-2">
                {aspectRatios.map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={options.aspectRatio === ratio.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onOptionsChange({ ...options, aspectRatio: ratio.value })}
                    className={cn(
                      "gap-1.5",
                      options.aspectRatio === ratio.value &&
                        "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30"
                    )}
                  >
                    <span>{ratio.icon}</span>
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Qualité</Label>
              <div className="flex flex-wrap gap-2">
                {qualities.map((q) => (
                  <Button
                    key={q.value}
                    variant={options.quality === q.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onOptionsChange({ ...options, quality: q.value })}
                    className={cn(
                      options.quality === q.value &&
                        "bg-[hsl(var(--primary))]/20 border-[hsl(var(--primary))]/30",
                      q.color
                    )}
                  >
                    {q.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration for video */}
            {contentType === "video" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Durée</Label>
                  <span className="text-sm font-medium">{options.duration || 5}s</span>
                </div>
                <Slider
                  value={[options.duration || 5]}
                  onValueChange={([value]) => onOptionsChange({ ...options, duration: value })}
                  min={2}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {/* Quota info */}
            <div className="flex items-center justify-end gap-4 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30">
                  60 générations incluses
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Solde</p>
                <p className="text-sm font-medium">∞</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
