import { useState, useMemo } from "react";
import { Settings2, ChevronDown, ChevronUp, Upload, Image, Video, FileText, FileArchive, Music, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AIModel } from "@/data/aiModels";
import { getModelCapabilities, AspectRatio, Quality, modeLabels, aspectRatioIcons } from "@/data/modelCapabilities";

interface DynamicGenerationOptionsProps {
  contentType?: "image" | "video" | "audio" | "3d";
  selectedModel: AIModel | null;
  options: DynamicGenerationSettings;
  onOptionsChange: (options: DynamicGenerationSettings) => void;
  onImportMedia?: (file: File, type: string) => void;
  className?: string;
}

export interface DynamicGenerationSettings {
  mode: string;
  aspectRatio: string;
  quality: string;
  duration?: number;
}

const allAspectRatios: { value: AspectRatio; label: string; icon: string }[] = [
  { value: "1:1", label: "1:1", icon: "⬜" },
  { value: "16:9", label: "16:9", icon: "📺" },
  { value: "9:16", label: "9:16", icon: "📱" },
  { value: "4:3", label: "4:3", icon: "🖥️" },
  { value: "3:4", label: "3:4", icon: "📷" },
  { value: "21:9", label: "21:9", icon: "🎬" },
];

const allQualities: { value: Quality; label: string; color: string; cost: number }[] = [
  { value: "480p", label: "480p", color: "text-muted-foreground", cost: 0.5 },
  { value: "720p", label: "720p", color: "text-foreground", cost: 1 },
  { value: "1080p", label: "1080p", color: "text-[hsl(174,100%,50%)]", cost: 2 },
  { value: "4K", label: "4K", color: "text-[hsl(320,100%,60%)]", cost: 4 },
  { value: "8K", label: "8K", color: "text-[hsl(280,100%,65%)]", cost: 8 },
];

const mediaTypes = [
  { id: "image", label: "IMAGE", icon: <Image className="h-5 w-5" />, accept: "image/*", extensions: "PNG, JPG, WEBP" },
  { id: "video", label: "VIDÉO", icon: <Video className="h-5 w-5" />, accept: "video/*", extensions: "MP4, WEBM, MOV" },
  { id: "audio", label: "AUDIO", icon: <Music className="h-5 w-5" />, accept: "audio/*", extensions: "MP3, WAV, FLAC" },
  { id: "document", label: "DOCUMENT", icon: <FileText className="h-5 w-5" />, accept: ".pdf,.doc,.docx,.txt", extensions: "PDF, DOC, TXT" },
  { id: "archive", label: "ARCHIVE", icon: <FileArchive className="h-5 w-5" />, accept: ".zip,.rar,.7z", extensions: "ZIP, RAR, 7Z" },
];

export function DynamicGenerationOptions({
  contentType = "image",
  selectedModel,
  options,
  onOptionsChange,
  onImportMedia,
  className,
}: DynamicGenerationOptionsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedMediaType, setSelectedMediaType] = useState<string>("image");

  // Obtenir les capacités du modèle sélectionné
  const capabilities = useMemo(() => {
    if (!selectedModel) return null;
    return getModelCapabilities(selectedModel.id);
  }, [selectedModel]);

  // Calculer les formats supportés et non supportés
  const aspectRatioSupport = useMemo(() => {
    return allAspectRatios.map(ratio => ({
      ...ratio,
      supported: capabilities?.supportedAspectRatios.includes(ratio.value) ?? false
    }));
  }, [capabilities]);

  const qualitySupport = useMemo(() => {
    return allQualities.map(q => ({
      ...q,
      supported: capabilities?.supportedQualities.includes(q.value) ?? false,
      quota: capabilities?.quotaByQuality?.[q.value] ?? 0
    }));
  }, [capabilities]);

  // Types de médias supportés par le modèle
  const supportedMediaTypes = useMemo(() => {
    if (!capabilities) return ["image"];
    return capabilities.inputTypes;
  }, [capabilities]);

  // Calculer le quota restant
  const remainingQuota = useMemo(() => {
    if (!capabilities) return 0;
    const qualityQuota = capabilities.quotaByQuality?.[options.quality as Quality];
    return qualityQuota ?? capabilities.freeQuota ?? 0;
  }, [capabilities, options.quality]);

  // Calculer le coût estimé
  const estimatedCost = useMemo(() => {
    const qualityItem = allQualities.find(q => q.value === options.quality);
    const baseCost = qualityItem?.cost ?? 1;
    const durationMultiplier = contentType === "video" ? (options.duration || 5) / 5 : 1;
    return (baseCost * durationMultiplier).toFixed(2);
  }, [options.quality, options.duration, contentType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportMedia) {
      onImportMedia(file, selectedMediaType);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="panel-3d overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border/30">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="font-display text-lg font-bold tracking-wider">MOTEUR DE GÉNÉRATION & OPTIONS</span>
            </div>
            <div className="flex items-center gap-3">
              {selectedModel && (
                <Badge className="bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30 font-display">
                  {selectedModel.name}
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 space-y-6">
            {/* Import Media Button - Large and prominent */}
            <div className="space-y-3">
              <Label className="font-display text-sm text-muted-foreground tracking-wider">IMPORTER UN MÉDIA</Label>
              
              {/* Media type selector - only show supported types */}
              <div className="flex flex-wrap gap-2 mb-3">
                {mediaTypes.map((type) => {
                  const isSupported = supportedMediaTypes.includes(type.id as any);
                  return (
                    <Button
                      key={type.id}
                      variant={selectedMediaType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => isSupported && setSelectedMediaType(type.id)}
                      disabled={!isSupported}
                      className={cn(
                        "gap-2 font-display transition-all",
                        selectedMediaType === type.id && isSupported && "btn-3d-cyan",
                        !isSupported && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {type.icon}
                      <span>{type.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Big upload button */}
              <label className="flex items-center justify-center gap-4 p-6 border-2 border-dashed border-[hsl(var(--primary))]/30 rounded-xl bg-[hsl(var(--primary))]/5 hover:bg-[hsl(var(--primary))]/10 hover:border-[hsl(var(--primary))]/50 cursor-pointer transition-all duration-300 group">
                <Upload className="h-8 w-8 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-display text-lg font-bold text-foreground">CLIQUEZ POUR IMPORTER</p>
                  <p className="text-sm text-muted-foreground">
                    {mediaTypes.find(t => t.id === selectedMediaType)?.extensions}
                  </p>
                </div>
                <input
                  type="file"
                  accept={mediaTypes.find(t => t.id === selectedMediaType)?.accept}
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Aspect Ratio - with grayed unsupported options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-display text-sm text-muted-foreground tracking-wider">FORMAT</Label>
                {!selectedModel && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Sélectionnez un modèle
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {aspectRatioSupport.map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={options.aspectRatio === ratio.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => ratio.supported && onOptionsChange({ ...options, aspectRatio: ratio.value })}
                    disabled={!ratio.supported}
                    className={cn(
                      "gap-2 font-display transition-all",
                      options.aspectRatio === ratio.value && ratio.supported && "btn-3d-cyan",
                      !ratio.supported && "opacity-30 cursor-not-allowed line-through"
                    )}
                  >
                    <span className="text-lg">{ratio.icon}</span>
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quality - with grayed unsupported options and quota */}
            <div className="space-y-3">
              <Label className="font-display text-sm text-muted-foreground tracking-wider">QUALITÉ</Label>
              <div className="flex flex-wrap gap-2">
                {qualitySupport.map((q) => (
                  <Button
                    key={q.value}
                    variant={options.quality === q.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => q.supported && onOptionsChange({ ...options, quality: q.value })}
                    disabled={!q.supported}
                    className={cn(
                      "gap-2 font-display transition-all relative",
                      options.quality === q.value && q.supported && "btn-3d-cyan",
                      !q.supported && "opacity-30 cursor-not-allowed line-through",
                      q.color
                    )}
                  >
                    {q.label}
                    {q.supported && q.quota > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                        {q.quota}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration for video */}
            {contentType === "video" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-display text-sm text-muted-foreground tracking-wider">DURÉE</Label>
                  <span className="font-display text-lg font-bold text-[hsl(var(--primary))]">
                    {options.duration || 5}s
                  </span>
                </div>
                <Slider
                  value={[options.duration || 5]}
                  onValueChange={([value]) => onOptionsChange({ ...options, duration: value })}
                  min={2}
                  max={capabilities?.maxDuration || 60}
                  step={1}
                  className="w-full"
                />
                {capabilities?.maxDuration && (
                  <p className="text-xs text-muted-foreground">
                    Max: {capabilities.maxDuration}s pour ce modèle
                  </p>
                )}
              </div>
            )}

            {/* Quota & Cost Display */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
              {/* Remaining Quota */}
              <div className="panel-3d p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-[hsl(142,76%,50%)]" />
                  <span className="font-display text-xs text-muted-foreground">QUOTA RESTANT</span>
                </div>
                <span className={cn(
                  "font-display text-2xl font-black",
                  remainingQuota > 20 ? "text-[hsl(142,76%,50%)]" : 
                  remainingQuota > 5 ? "text-[hsl(45,100%,55%)]" : "text-[hsl(0,100%,60%)]"
                )}>
                  {remainingQuota === 999 ? "∞" : remainingQuota}
                </span>
              </div>

              {/* Estimated Cost */}
              <div className="panel-3d p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-[hsl(45,100%,55%)]">💰</span>
                  <span className="font-display text-xs text-muted-foreground">COÛT ESTIMÉ</span>
                </div>
                <span className="font-display text-2xl font-black text-[hsl(45,100%,55%)]">
                  {selectedModel?.isFree ? "GRATUIT" : `${estimatedCost} cr`}
                </span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
