import { useState } from "react";
import { Key, ExternalLink, Image, Video, MessageSquare, Music, Wand2, Box, Code, Sparkles, Infinity, Flame as FlameIcon } from "lucide-react";
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
  "image": { icon: <Image className="h-5 w-5" />, label: "Images" },
  "video": { icon: <Video className="h-5 w-5" />, label: "Vidéos" },
  "audio": { icon: <Music className="h-5 w-5" />, label: "Audio" },
  "text": { icon: <MessageSquare className="h-5 w-5" />, label: "Texte" },
  "3d": { icon: <Box className="h-5 w-5" />, label: "3D" },
  "code": { icon: <Code className="h-5 w-5" />, label: "Code" },
  "retouch": { icon: <Wand2 className="h-5 w-5" />, label: "Retouche" },
};

// Max generations per model with free generations info
const modelGenerationLimits: Record<string, { max: number | null; unit: string; freeGens?: number; freeUnit?: string }> = {
  "flux-schnell": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité" },
  "perchance-ai": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité" },
  "pollinations": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité" },
  "ideogram-free": { max: 25, unit: "/jour", freeGens: 25, freeUnit: "/jour" },
  "dall-e-3": { max: 200, unit: "/mois", freeGens: 0, freeUnit: "" },
  "midjourney-v6": { max: 200, unit: "/mois", freeGens: 25, freeUnit: "essai" },
  "stable-diffusion-3": { max: 150, unit: "/mois", freeGens: 25, freeUnit: "crédits" },
  "runway-gen3": { max: 125, unit: "sec/mois", freeGens: 125, freeUnit: "sec essai" },
  "elevenlabs": { max: 10000, unit: "chars/mois", freeGens: 10000, freeUnit: "chars/mois" },
  "gpt-4o": { max: null, unit: "illimité", freeGens: 0, freeUnit: "" },
  "claude-3-5-sonnet": { max: null, unit: "illimité", freeGens: 0, freeUnit: "" },
  "tensor-art": { max: 100, unit: "/jour", freeGens: 100, freeUnit: "crédits/jour" },
  "leonardo-ai": { max: 150, unit: "/jour", freeGens: 150, freeUnit: "tokens/jour" },
  "playground-v2": { max: 500, unit: "/jour", freeGens: 500, freeUnit: "/jour" },
  "pixart-alpha": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité" },
  "sdxl-lightning": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité" },
  "kling-ai": { max: 66, unit: "/mois", freeGens: 66, freeUnit: "crédits/mois" },
  "luma-dream": { max: 30, unit: "/mois", freeGens: 30, freeUnit: "générations" },
  "hailuo-minimax": { max: 10, unit: "/jour", freeGens: 10, freeUnit: "/jour" },
  "pika-labs": { max: 250, unit: "crédits", freeGens: 250, freeUnit: "essai" },
  "suno-ai": { max: 50, unit: "/jour", freeGens: 50, freeUnit: "crédits/jour" },
  "udio": { max: 1200, unit: "/mois", freeGens: 1200, freeUnit: "crédits/mois" },
};

interface AppTileCardProps {
  model: AIModel;
  onOpenAPIKeyModal?: (apiKeyName: string) => void;
  onClick?: () => void;
  viewMode?: "grid" | "list";
  horizontal?: boolean;
}

export function AppTileCard({ model, onOpenAPIKeyModal, onClick, viewMode = "grid", horizontal = false }: AppTileCardProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getModelLogo(model.id, model.provider);
  const isActive = model.apiStatus === "active" || model.isFree;
  const isUncensored = model.category === "uncensored";
  const isUnlimited = model.isFree && (
    modelGenerationLimits[model.id]?.max === null || 
    model.badges?.includes("UNLIMITED") ||
    model.badges?.includes("NO SIGNUP")
  );
  
  // Check if it's an image-to-video uncensored generator (hot logo)
  const isHotVideoGenerator = isUncensored && (
    model.features?.some(f => f.toLowerCase().includes("video") || f.toLowerCase().includes("vidéo")) ||
    model.name.toLowerCase().includes("video") ||
    model.description.toLowerCase().includes("image vers vidéo") ||
    model.description.toLowerCase().includes("image to video")
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
          {/* LED Status */}
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
              {isHotVideoGenerator && (
                <span className="text-[hsl(30,100%,50%)] font-display font-black text-sm animate-pulse">🔥HOT</span>
              )}
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

          {/* Uncensored Text (simple red text, not button) */}
          {isUncensored && (
            <span className="font-display text-lg font-black text-[hsl(0,100%,50%)] tracking-wider">
              SANS CENSURE
            </span>
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

  // Horizontal card layout (rectangle horizontal)
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group",
        "bg-gradient-to-br",
        style.bgGradient,
        "border-2",
        style.borderColor,
        "hover:scale-[1.02] hover:shadow-xl",
        "shadow-[inset_0_2px_0_hsl(0_0%_100%/0.15),_inset_0_-4px_8px_hsl(0_0%_0%/0.2),_0_8px_24px_hsl(220_20%_4%/0.5),_0_4px_8px_hsl(220_20%_4%/0.3)]",
        "hover:shadow-[inset_0_2px_0_hsl(0_0%_100%/0.2),_inset_0_-4px_8px_hsl(0_0%_0%/0.15),_0_12px_32px_hsl(220_20%_4%/0.6),_0_6px_12px_hsl(220_20%_4%/0.4)]"
      )}
      onClick={onClick}
      style={{ minHeight: horizontal ? "140px" : "280px" }}
    >
      {/* LED Status - Top Left */}
      <div className="absolute top-2 left-2 z-10">
        <StatusLED isActive={isActive} size="md" />
      </div>

      {/* Big Flame icon for uncensored - Top Right */}
      {isUncensored && (
        <div className="absolute top-2 right-2 z-10">
          <AnimatedFlame size="lg" />
        </div>
      )}

      {/* Hot badge for uncensored video generators */}
      {isHotVideoGenerator && (
        <div className="absolute top-2 right-16 z-10 bg-gradient-to-r from-[hsl(30,100%,50%)] to-[hsl(0,100%,50%)] px-2 py-1 rounded-full">
          <span className="font-display text-xs font-black text-white animate-pulse">🔥 HOT</span>
        </div>
      )}

      {/* Main Content - Horizontal Layout */}
      <div className={cn(
        "p-3 flex h-full",
        horizontal ? "flex-row items-center gap-3" : "flex-col pt-8"
      )}>
        {/* Logo - with Earth fallback */}
        <div className={cn(
          "rounded-full overflow-hidden shrink-0",
          "bg-gradient-to-br from-background/90 to-background/70",
          "border-2",
          style.borderColor,
          "shadow-lg shadow-black/30",
          "transition-transform group-hover:scale-105",
          horizontal ? "h-16 w-16" : "h-20 w-20 mx-auto mb-3"
        )}>
          {!imageError && logoUrl ? (
            <img
              src={logoUrl}
              alt={model.provider}
              className="h-full w-full object-contain p-2"
              onError={() => setImageError(true)}
            />
          ) : (
            <EarthFallback size={horizontal ? 64 : 80} />
          )}
        </div>

        {/* Info Section */}
        <div className={cn(
          "flex-1 min-w-0",
          horizontal ? "" : "text-center"
        )}>
          {/* Name - ABOVE content */}
          <h3 className={cn(
            "font-display font-bold text-foreground tracking-wider leading-tight",
            horizontal ? "text-base line-clamp-1" : "text-lg line-clamp-2 mb-1"
          )}>
            {model.name}
          </h3>
          
          <p className={cn(
            "text-muted-foreground font-display truncate",
            horizontal ? "text-xs" : "text-sm"
          )}>
            {model.provider}
          </p>

          {/* Generation Limit Badge */}
          {generationLimit && (
            <Badge className={cn(
              "font-display text-xs mt-1",
              generationLimit.max === null 
                ? "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30"
                : "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30"
            )}>
              {generationLimit.max === null ? "∞" : `${generationLimit.max} ${generationLimit.unit}`}
            </Badge>
          )}

          {/* Capability Icons */}
          <div className={cn(
            "flex gap-1 mt-2",
            horizontal ? "" : "justify-center"
          )}>
            {capabilities.map(cap => (
              <div 
                key={cap}
                className={cn(
                  "rounded-md flex items-center justify-center",
                  style.badgeBg,
                  style.textColor,
                  horizontal ? "h-6 w-6" : "h-8 w-8"
                )}
                title={capabilityIcons[cap]?.label}
              >
                {capabilityIcons[cap]?.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Right side actions */}
        <div className={cn(
          "flex shrink-0",
          horizontal ? "flex-col items-end gap-1" : "flex-col items-center mt-auto pt-2 border-t border-border/30"
        )}>
          {/* Uncensored Red Text (not button) */}
          {isUncensored && (
            <span className={cn(
              "font-display font-black text-[hsl(0,100%,50%)] tracking-wider",
              horizontal ? "text-xs" : "text-sm mb-2"
            )}>
              SANS CENSURE
            </span>
          )}

          {/* Unlimited Green Button */}
          {isUnlimited && !isUncensored && (
            <Button
              className={cn(
                "btn-3d-green font-display font-bold gap-1",
                horizontal ? "text-xs px-2 py-1 h-6" : "text-sm py-2 w-full mb-2"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Infinity className={horizontal ? "h-3 w-3" : "h-4 w-4"} />
              ILLIMITÉ
            </Button>
          )}

          {/* Action Button or ACTIF label */}
          {isActive ? (
            <div className={cn(
              "flex items-center gap-1",
              horizontal ? "" : "justify-center w-full"
            )}>
              <VintageStamp />
              <span className={cn(
                "font-display font-black text-[hsl(142,76%,50%)] tracking-wider",
                horizontal ? "text-sm" : "text-lg"
              )}>
                ACTIF
              </span>
            </div>
          ) : model.apiKeyName && (
            <Button
              size="sm"
              className={cn(
                "bg-[hsl(30,100%,60%)] hover:bg-[hsl(30,100%,65%)] text-black gap-1 hover:scale-105 transition-transform font-display tracking-wider",
                horizontal ? "text-xs px-2 py-1 h-7" : "text-sm w-full h-9"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onOpenAPIKeyModal?.(model.apiKeyName!);
              }}
            >
              <Key className={horizontal ? "h-3 w-3" : "h-4 w-4"} />
              ACHETER
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}