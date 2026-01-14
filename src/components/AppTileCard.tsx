import { useState } from "react";
import { Key, ExternalLink, Image, Video, MessageSquare, Music, Wand2, Box, Code, Sparkles, Infinity } from "lucide-react";
import { AIModel, apiConfigs } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { StatusLED } from "@/components/StatusLED";
import { VintageStamp } from "@/components/VintageStamp";
import { AnimatedFlame } from "@/components/AnimatedFlame";
import { EarthFallback } from "@/components/EarthFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Configuration des catégories avec couleurs distinctes
const categoryStyles: Record<string, {
  bgGradient: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  icon: React.ReactNode;
  label: string;
}> = {
  activated: {
    bgGradient: "from-[hsl(142,76%,20%)]/30 to-[hsl(142,76%,10%)]/30",
    borderColor: "border-[hsl(142,76%,50%)]/50",
    textColor: "text-[hsl(142,76%,50%)]",
    badgeBg: "bg-[hsl(142,76%,50%)]/20",
    icon: <Sparkles className="h-4 w-4" />,
    label: "ACTIF"
  },
  free: {
    bgGradient: "from-[hsl(174,100%,20%)]/30 to-[hsl(174,100%,10%)]/30",
    borderColor: "border-[hsl(174,100%,50%)]/50",
    textColor: "text-[hsl(174,100%,50%)]",
    badgeBg: "bg-[hsl(174,100%,50%)]/20",
    icon: <Sparkles className="h-4 w-4" />,
    label: "GRATUIT"
  },
  videos: {
    bgGradient: "from-[hsl(280,100%,25%)]/30 to-[hsl(280,100%,15%)]/30",
    borderColor: "border-[hsl(280,100%,65%)]/50",
    textColor: "text-[hsl(280,100%,65%)]",
    badgeBg: "bg-[hsl(280,100%,65%)]/20",
    icon: <Video className="h-4 w-4" />,
    label: "VIDÉO"
  },
  images: {
    bgGradient: "from-[hsl(320,100%,25%)]/30 to-[hsl(320,100%,15%)]/30",
    borderColor: "border-[hsl(320,100%,60%)]/50",
    textColor: "text-[hsl(320,100%,60%)]",
    badgeBg: "bg-[hsl(320,100%,60%)]/20",
    icon: <Image className="h-4 w-4" />,
    label: "IMAGE"
  },
  llms: {
    bgGradient: "from-[hsl(45,100%,25%)]/30 to-[hsl(45,100%,15%)]/30",
    borderColor: "border-[hsl(45,100%,55%)]/50",
    textColor: "text-[hsl(45,100%,55%)]",
    badgeBg: "bg-[hsl(45,100%,55%)]/20",
    icon: <MessageSquare className="h-4 w-4" />,
    label: "LLM"
  },
  retouch: {
    bgGradient: "from-[hsl(174,100%,20%)]/30 to-[hsl(174,100%,10%)]/30",
    borderColor: "border-[hsl(174,100%,50%)]/50",
    textColor: "text-[hsl(174,100%,50%)]",
    badgeBg: "bg-[hsl(174,100%,50%)]/20",
    icon: <Wand2 className="h-4 w-4" />,
    label: "RETOUCHE"
  },
  audio: {
    bgGradient: "from-[hsl(25,100%,25%)]/30 to-[hsl(25,100%,15%)]/30",
    borderColor: "border-[hsl(25,100%,55%)]/50",
    textColor: "text-[hsl(25,100%,55%)]",
    badgeBg: "bg-[hsl(25,100%,55%)]/20",
    icon: <Music className="h-4 w-4" />,
    label: "AUDIO"
  },
  uncensored: {
    bgGradient: "from-[hsl(0,100%,25%)]/30 to-[hsl(0,100%,15%)]/30",
    borderColor: "border-[hsl(0,100%,60%)]/50",
    textColor: "text-[hsl(0,100%,60%)]",
    badgeBg: "bg-[hsl(0,100%,60%)]/20",
    icon: null, // Will use AnimatedFlame instead
    label: "18+"
  },
  code: {
    bgGradient: "from-[hsl(210,100%,25%)]/30 to-[hsl(210,100%,15%)]/30",
    borderColor: "border-[hsl(210,100%,60%)]/50",
    textColor: "text-[hsl(210,100%,60%)]",
    badgeBg: "bg-[hsl(210,100%,60%)]/20",
    icon: <Code className="h-4 w-4" />,
    label: "CODE"
  },
  "3d": {
    bgGradient: "from-[hsl(142,76%,20%)]/30 to-[hsl(142,76%,10%)]/30",
    borderColor: "border-[hsl(142,76%,50%)]/50",
    textColor: "text-[hsl(142,76%,50%)]",
    badgeBg: "bg-[hsl(142,76%,50%)]/20",
    icon: <Box className="h-4 w-4" />,
    label: "3D"
  },
};

// Icônes des capacités - Double taille
const capabilityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  "image": { icon: <Image className="h-6 w-6" />, label: "Images" },
  "video": { icon: <Video className="h-6 w-6" />, label: "Vidéos" },
  "audio": { icon: <Music className="h-6 w-6" />, label: "Audio" },
  "text": { icon: <MessageSquare className="h-6 w-6" />, label: "Texte" },
  "3d": { icon: <Box className="h-6 w-6" />, label: "3D" },
  "code": { icon: <Code className="h-6 w-6" />, label: "Code" },
  "retouch": { icon: <Wand2 className="h-6 w-6" />, label: "Retouche" },
};

// Max generations per model (example data)
const modelGenerationLimits: Record<string, { max: number | null; unit: string }> = {
  "flux-schnell": { max: null, unit: "illimité" },
  "perchance-ai": { max: null, unit: "illimité" },
  "pollinations": { max: null, unit: "illimité" },
  "ideogram-free": { max: 25, unit: "/jour" },
  "dall-e-3": { max: 200, unit: "/mois" },
  "midjourney-v6": { max: 200, unit: "/mois" },
  "stable-diffusion-3": { max: 150, unit: "/mois" },
  "runway-gen3": { max: 125, unit: "sec/mois" },
  "elevenlabs": { max: 10000, unit: "chars/mois" },
  "gpt-4o": { max: null, unit: "illimité" },
  "claude-3-5-sonnet": { max: null, unit: "illimité" },
};

interface AppTileCardProps {
  model: AIModel;
  onOpenAPIKeyModal?: (apiKeyName: string) => void;
  onClick?: () => void;
  viewMode?: "grid" | "list";
}

export function AppTileCard({ model, onOpenAPIKeyModal, onClick, viewMode = "grid" }: AppTileCardProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getModelLogo(model.id, model.provider);
  const isActive = model.apiStatus === "active" || model.isFree;
  const isUncensored = model.category === "uncensored";
  const isUnlimited = model.isFree && (
    modelGenerationLimits[model.id]?.max === null || 
    model.badges?.includes("UNLIMITED") ||
    model.badges?.includes("NO SIGNUP")
  );
  
  const generationLimit = modelGenerationLimits[model.id];
  
  // Determine effective category for styling
  const effectiveCategory = isActive && !model.isFree ? "activated" : 
                           model.isFree ? "free" : model.category;
  const style = categoryStyles[effectiveCategory] || categoryStyles.images;

  // Get capabilities from model features
  const getModelCapabilities = () => {
    const caps: string[] = [];
    if (model.category === "images" || model.category === "retouch") caps.push("image");
    if (model.category === "videos") caps.push("video");
    if (model.category === "audio") caps.push("audio");
    if (model.category === "llms") caps.push("text");
    if (model.category === "3d") caps.push("3d");
    if (model.category === "code") caps.push("code");
    return caps;
  };

  const capabilities = getModelCapabilities();

  if (viewMode === "list") {
    // List view implementation
    return (
      <div 
        className={cn(
          "relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer",
          "bg-gradient-to-r",
          style.bgGradient,
          "border-2",
          style.borderColor,
          "hover:scale-[1.01] hover:shadow-lg hover:shadow-current/10",
          "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.1),_0_4px_12px_hsl(220_20%_4%/0.4)]"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 p-4">
          {/* LED Status - Top Left */}
          <StatusLED isActive={isActive} size="lg" />
          
          {/* Logo - with Earth fallback */}
          <div className={cn(
            "h-14 w-14 rounded-xl overflow-hidden shrink-0",
            "bg-gradient-to-br from-background/80 to-background/40",
            "border",
            style.borderColor,
            "shadow-lg"
          )}>
            {!imageError && logoUrl ? (
              <img
                src={logoUrl}
                alt={model.provider}
                className="h-full w-full object-contain p-2"
                onError={() => setImageError(true)}
              />
            ) : (
              <EarthFallback size={56} className="p-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold truncate tracking-wider">{model.name}</h3>
              {isUncensored && <AnimatedFlame size="md" />}
            </div>
            <p className="text-sm text-muted-foreground truncate font-display">{model.provider}</p>
            {generationLimit && (
              <span className="text-xs text-[hsl(45,100%,55%)] font-display font-bold">
                {generationLimit.max === null ? "∞ ILLIMITÉ" : `${generationLimit.max} ${generationLimit.unit}`}
              </span>
            )}
          </div>

          {/* Capabilities Icons */}
          <div className="flex items-center gap-2">
            {capabilities.map(cap => (
              <div 
                key={cap}
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  style.badgeBg,
                  style.textColor
                )}
                title={capabilityIcons[cap]?.label}
              >
                {capabilityIcons[cap]?.icon}
              </div>
            ))}
          </div>

          {/* Uncensored Button */}
          {isUncensored && (
            <Button
              className="btn-3d-red font-display text-sm font-bold px-4 py-2 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatedFlame size="sm" />
              SANS CENSURE
            </Button>
          )}

          {/* Unlimited Badge */}
          {isUnlimited && !isUncensored && (
            <Button
              className="btn-3d-green font-display text-sm font-bold px-4 py-2 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Infinity className="h-5 w-5" />
              ILLIMITÉ
            </Button>
          )}

          {/* Status Badge or API Key Button */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <VintageStamp />
                <span className="font-display text-xl font-black text-[hsl(142,76%,50%)] tracking-wider ml-2">
                  ACTIF
                </span>
              </>
            ) : model.apiKeyName ? (
              <Button
                size="sm"
                className="bg-[hsl(30,100%,60%)] hover:bg-[hsl(30,100%,65%)] text-black gap-2 font-display tracking-wider text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAPIKeyModal?.(model.apiKeyName!);
                }}
              >
                <Key className="h-5 w-5" />
                ACHETER
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Grid view - Name ABOVE logo, big flame icon for uncensored
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group",
        "bg-gradient-to-br",
        style.bgGradient,
        "border-2",
        style.borderColor,
        "hover:scale-[1.03] hover:shadow-xl",
        "shadow-[inset_0_2px_0_hsl(0_0%_100%/0.15),_inset_0_-4px_8px_hsl(0_0%_0%/0.2),_0_8px_24px_hsl(220_20%_4%/0.5),_0_4px_8px_hsl(220_20%_4%/0.3)]",
        "hover:shadow-[inset_0_2px_0_hsl(0_0%_100%/0.2),_inset_0_-4px_8px_hsl(0_0%_0%/0.15),_0_12px_32px_hsl(220_20%_4%/0.6),_0_6px_12px_hsl(220_20%_4%/0.4)]"
      )}
      onClick={onClick}
      style={{ minHeight: "340px" }}
    >
      {/* LED Status - Top Left */}
      <div className="absolute top-3 left-3 z-10">
        <StatusLED isActive={isActive} size="lg" />
      </div>

      {/* Big Flame icon for uncensored - Top Right */}
      {isUncensored && (
        <div className="absolute top-2 right-2 z-10">
          <AnimatedFlame size="xl" />
        </div>
      )}

      {/* Main Content */}
      <div className="pt-10 px-4 pb-4 flex flex-col h-full">
        {/* Name - ABOVE LOGO - Double size */}
        <div className="text-center mb-3">
          <h3 className="font-display text-xl font-bold text-foreground line-clamp-2 tracking-wider leading-tight">
            {model.name}
          </h3>
          <p className="text-sm text-muted-foreground font-display truncate mt-1">
            {model.provider}
          </p>
        </div>

        {/* Logo - Center with contrasting background - Earth fallback */}
        <div className="flex justify-center mb-3">
          <div className={cn(
            "h-20 w-20 rounded-full overflow-hidden",
            "bg-gradient-to-br from-background/90 to-background/70",
            "border-2",
            style.borderColor,
            "shadow-lg shadow-black/30",
            "transition-transform group-hover:scale-110"
          )}>
            {!imageError && logoUrl ? (
              <img
                src={logoUrl}
                alt={model.provider}
                className="h-full w-full object-contain p-3"
                onError={() => setImageError(true)}
              />
            ) : (
              <EarthFallback size={80} />
            )}
          </div>
        </div>

        {/* Generation Limit Badge */}
        {generationLimit && (
          <div className="flex justify-center mb-2">
            <Badge className={cn(
              "font-display text-xs px-3 py-1",
              generationLimit.max === null 
                ? "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30"
                : "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30"
            )}>
              {generationLimit.max === null ? "∞ ILLIMITÉ" : `MAX: ${generationLimit.max} ${generationLimit.unit}`}
            </Badge>
          </div>
        )}

        {/* Capability Icons - Large and centered */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {capabilities.map(cap => (
            <div 
              key={cap}
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                style.badgeBg,
                style.textColor,
                "shadow-inner"
              )}
              title={capabilityIcons[cap]?.label}
            >
              {capabilityIcons[cap]?.icon}
            </div>
          ))}
        </div>

        {/* Category Badge */}
        <div className="flex justify-center mb-2">
          <Badge className={cn(
            "font-display text-xs px-3 py-1",
            style.badgeBg,
            style.textColor,
            "border",
            style.borderColor
          )}>
            {model.category === "uncensored" ? <AnimatedFlame size="sm" /> : style.icon}
            <span className="ml-1">{style.label}</span>
          </Badge>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Uncensored Big Red Button */}
        {isUncensored && (
          <div className="mb-2">
            <Button
              className="w-full btn-3d-red font-display text-sm font-bold py-3 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatedFlame size="sm" />
              SANS CENSURE
            </Button>
          </div>
        )}

        {/* Unlimited Green Button */}
        {isUnlimited && !isUncensored && (
          <div className="mb-2">
            <Button
              className="w-full btn-3d-green font-display text-sm font-bold py-3 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Infinity className="h-5 w-5" />
              ILLIMITÉ
            </Button>
          </div>
        )}

        {/* Price or Free tag */}
        {!isUncensored && !isUnlimited && (
          <div className="text-center mb-2">
            {model.isFree ? (
              <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 font-display">
                GRATUIT
              </Badge>
            ) : model.price ? (
              <span className="text-xs text-[hsl(45,100%,55%)] font-display font-bold">
                {model.price}
              </span>
            ) : null}
          </div>
        )}

        {/* Action Button or ACTIF label */}
        <div className="pt-2 border-t border-border/30">
          {isActive ? (
            <div className="w-full h-10 flex items-center justify-center gap-2">
              <VintageStamp />
              <span className="font-display text-xl font-black text-[hsl(142,76%,50%)] tracking-wider">
                ACTIF
              </span>
            </div>
          ) : model.apiKeyName && (
            <Button
              size="sm"
              className="w-full h-10 text-sm font-bold bg-[hsl(30,100%,60%)] hover:bg-[hsl(30,100%,65%)] text-black gap-2 hover:scale-105 transition-transform font-display tracking-wider"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAPIKeyModal?.(model.apiKeyName!);
              }}
            >
              <Key className="h-5 w-5" />
              ACHETER
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}