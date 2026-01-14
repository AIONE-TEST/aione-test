import React, { useState } from "react";
import { 
  Key, ExternalLink, Video, MessageSquare, Music, Wand2, Box, Code, Sparkles, 
  Infinity as InfinityIcon, Flame as FlameIcon, Euro,
  Image as ImageIcon
} from "lucide-react";
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
    icon: <ImageIcon className="h-4 w-4" />,
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
    icon: null,
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

// Icônes des capacités
const capabilityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  "image": { icon: <ImageIcon className="h-4 w-4" />, label: "Images" },
  "video": { icon: <Video className="h-4 w-4" />, label: "Vidéos" },
  "audio": { icon: <Music className="h-4 w-4" />, label: "Audio" },
  "text": { icon: <MessageSquare className="h-4 w-4" />, label: "Texte" },
  "3d": { icon: <Box className="h-4 w-4" />, label: "3D" },
  "code": { icon: <Code className="h-4 w-4" />, label: "Code" },
  "retouch": { icon: <Wand2 className="h-4 w-4" />, label: "Retouche" },
};

// Max generations per model with free generations info and prices in EUR
const modelGenerationLimits: Record<string, { 
  max: number | null; 
  unit: string; 
  freeGens?: number; 
  freeUnit?: string;
  priceEur?: string;
}> = {
  "flux-schnell": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT" },
  "perchance-ai": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT" },
  "pollinations": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT" },
  "ideogram-free": { max: 25, unit: "/jour", freeGens: 25, freeUnit: "/jour", priceEur: "GRATUIT" },
  "dall-e-3": { max: 200, unit: "/mois", freeGens: 0, freeUnit: "", priceEur: "0,04€" },
  "midjourney-v6": { max: 200, unit: "/mois", freeGens: 25, freeUnit: "essai", priceEur: "9€/mois" },
  "stable-diffusion-3": { max: 150, unit: "/mois", freeGens: 25, freeUnit: "crédits", priceEur: "0,03€" },
  "runway-gen3": { max: 125, unit: "sec/mois", freeGens: 125, freeUnit: "sec essai", priceEur: "12€/mois" },
  "elevenlabs": { max: 10000, unit: "chars/mois", freeGens: 10000, freeUnit: "chars/mois", priceEur: "5€/mois" },
  "gpt-4o": { max: null, unit: "illimité", freeGens: 0, freeUnit: "", priceEur: "0,01€/1K" },
  "claude-3-5-sonnet": { max: null, unit: "illimité", freeGens: 0, freeUnit: "", priceEur: "0,01€/1K" },
  "tensor-art": { max: 100, unit: "/jour", freeGens: 100, freeUnit: "crédits/jour", priceEur: "GRATUIT" },
  "leonardo-ai": { max: 150, unit: "/jour", freeGens: 150, freeUnit: "tokens/jour", priceEur: "11€/mois" },
  "playground-v2": { max: 500, unit: "/jour", freeGens: 500, freeUnit: "/jour", priceEur: "GRATUIT" },
  "pixart-alpha": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT" },
  "sdxl-lightning": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT" },
  "kling-ai": { max: 66, unit: "/mois", freeGens: 66, freeUnit: "crédits/mois", priceEur: "5€/mois" },
  "luma-dream": { max: 30, unit: "/mois", freeGens: 30, freeUnit: "générations", priceEur: "24€/mois" },
  "hailuo-minimax": { max: 10, unit: "/jour", freeGens: 10, freeUnit: "/jour", priceEur: "GRATUIT" },
  "pika-labs": { max: 250, unit: "crédits", freeGens: 250, freeUnit: "essai", priceEur: "8€/mois" },
  "suno-ai": { max: 50, unit: "/jour", freeGens: 50, freeUnit: "crédits/jour", priceEur: "8€/mois" },
  "udio": { max: 1200, unit: "/mois", freeGens: 1200, freeUnit: "crédits/mois", priceEur: "10€/mois" },
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
    
    // Check features for additional capabilities
    model.features?.forEach(f => {
      const fl = f.toLowerCase();
      if ((fl.includes("image") || fl.includes("photo")) && !caps.includes("image")) caps.push("image");
      if ((fl.includes("video") || fl.includes("vidéo")) && !caps.includes("video")) caps.push("video");
      if ((fl.includes("audio") || fl.includes("musique") || fl.includes("voix")) && !caps.includes("audio")) caps.push("audio");
    });
    
    return caps;
  };

  const capabilities = getModelCapabilities();

  // Price display
  const priceDisplay = generationLimit?.priceEur || model.price?.replace("$", "€") || "";

  // LIST VIEW - Full width with all details
  if (viewMode === "list") {
    return (
      <div 
        className={cn(
          "relative w-full overflow-hidden rounded-xl transition-all duration-300 cursor-pointer",
          "bg-gradient-to-r",
          style.bgGradient,
          "border-2",
          style.borderColor,
          "hover:scale-[1.005] hover:shadow-lg hover:shadow-current/10",
          "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.1),_0_4px_12px_hsl(220_20%_4%/0.4)]"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 p-4">
          {/* LED Status */}
          <StatusLED isActive={isActive} size="lg" />
          
          {/* Logo - 3D sphere effect */}
          <div className={cn(
            "h-14 w-14 shrink-0",
            "rounded-full",
            "bg-gradient-to-br from-white/30 via-transparent to-black/40",
            "shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.4),inset_3px_3px_8px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.3)]",
            "border-2",
            style.borderColor,
            "flex items-center justify-center overflow-hidden"
          )}>
            {!imageError && logoUrl ? (
              <img
                src={logoUrl}
                alt={model.provider}
                className="h-10 w-10 object-contain rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <EarthFallback size={40} />
            )}
          </div>

          {/* App Name & Provider */}
          <div className="min-w-[180px]">
            <h3 className="font-display text-lg font-bold truncate tracking-wider">{model.name}</h3>
            <p className="text-sm text-muted-foreground truncate font-display">{model.provider}</p>
          </div>

          {/* Capabilities Icons */}
          <div className="flex items-center gap-2 min-w-[100px]">
            {capabilities.map(cap => (
              <div 
                key={cap}
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-white/10 to-black/20",
                  "shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)]",
                  style.textColor
                )}
                title={capabilityIcons[cap]?.label}
              >
                {capabilityIcons[cap]?.icon}
              </div>
            ))}
          </div>

          {/* Generation Limit */}
          <div className="min-w-[100px] text-center">
            {generationLimit && (
              <Badge className={cn(
                "font-display text-xs",
                generationLimit.max === null 
                  ? "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]"
                  : "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)]"
              )}>
                {generationLimit.max === null ? "∞ ILLIMITÉ" : `${generationLimit.max} ${generationLimit.unit}`}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="min-w-[80px] text-center">
            {priceDisplay && (
              <Badge className={cn(
                "font-display text-xs gap-1",
                priceDisplay === "GRATUIT" 
                  ? "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]"
                  : "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)]"
              )}>
                <Euro className="h-3 w-3" />
                {priceDisplay}
              </Badge>
            )}
          </div>

          {/* Uncensored Text */}
          {isUncensored && (
            <span className="font-display text-sm font-black text-[hsl(0,100%,50%)] tracking-wider min-w-[100px]">
              SANS CENSURE
            </span>
          )}

          {/* Hot badge */}
          {isHotVideoGenerator && (
            <span className="text-[hsl(30,100%,50%)] font-display font-black text-sm animate-pulse">🔥HOT</span>
          )}

          {/* Unlimited Badge */}
          {isUnlimited && !isUncensored && (
            <Button
              className="btn-3d-green font-display text-xs font-bold px-3 py-1 gap-1 h-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <InfinityIcon className="h-4 w-4" />
              ILLIMITÉ
            </Button>
          )}

          {/* Status / Action Button */}
          <div className="flex items-center gap-2 ml-auto">
            {isActive ? (
              <span className="font-display text-lg font-black text-[hsl(142,76%,50%)] tracking-wider">
                ACTIF
              </span>
            ) : model.apiKeyName ? (
              <Button
                size="sm"
                className="bg-[hsl(30,100%,60%)] hover:bg-[hsl(30,100%,65%)] text-black gap-2 font-display tracking-wider"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAPIKeyModal?.(model.apiKeyName!);
                }}
              >
                <Key className="h-4 w-4" />
                ACHETER
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW - Horizontal rectangle card with clear zones
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group",
        "bg-gradient-to-br",
        style.bgGradient,
        "border-2",
        style.borderColor,
        "hover:scale-[1.02] hover:shadow-xl",
        "shadow-[inset_0_2px_0_hsl(0_0%_100%/0.15),_0_6px_16px_hsl(220_20%_4%/0.4)]"
      )}
      onClick={onClick}
      style={{ 
        minHeight: "200px",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* TOP ZONE - App Name + LED + Flame (dedicated zone) */}
      <div className={cn(
        "px-3 py-3 border-b shrink-0 flex items-center justify-between gap-2",
        style.borderColor,
        "bg-black/20"
      )}>
        {/* LED Status - Always visible */}
        <StatusLED isActive={isActive} size="md" />
        
        <h3 className="font-display text-sm font-bold text-foreground tracking-wider truncate text-center flex-1">
          {model.name}
        </h3>
        
        {/* Flame + Hot for uncensored - Always visible */}
        <div className="flex items-center gap-1">
          {isUncensored && <AnimatedFlame size="md" />}
          {isHotVideoGenerator && (
            <span className="text-sm font-display font-black text-[hsl(30,100%,50%)] animate-pulse">🔥</span>
          )}
        </div>
      </div>

      {/* MIDDLE ZONE - Logo + Info */}
      <div className="flex-1 p-3 flex items-center gap-3">
        {/* Logo with 3D sphere effect */}
        <div className={cn(
          "h-14 w-14 shrink-0",
          "rounded-full",
          "bg-gradient-to-br from-white/30 via-transparent to-black/50",
          "shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.5),inset_4px_4px_10px_rgba(255,255,255,0.15),0_6px_16px_rgba(0,0,0,0.4)]",
          "border-2",
          style.borderColor,
          "flex items-center justify-center overflow-hidden",
          "transition-transform group-hover:scale-105"
        )}>
          {!imageError && logoUrl ? (
            <img
              src={logoUrl}
              alt={model.provider}
              className="h-10 w-10 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <EarthFallback size={40} />
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Provider */}
          <p className="text-xs text-muted-foreground font-display truncate">
            {model.provider}
          </p>
          
          {/* Capabilities Icons Row */}
          <div className="flex gap-1">
            {capabilities.slice(0, 4).map(cap => (
              <div 
                key={cap}
                className={cn(
                  "h-6 w-6 rounded-md flex items-center justify-center",
                  "bg-gradient-to-br from-white/10 to-black/20",
                  "shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)]",
                  style.textColor
                )}
                title={capabilityIcons[cap]?.label}
              >
                {capabilityIcons[cap]?.icon}
              </div>
            ))}
          </div>

          {/* Generation Limit */}
          {generationLimit && (
            <Badge className={cn(
              "font-display text-[10px] w-fit px-2 py-0.5",
              generationLimit.max === null 
                ? "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]"
                : "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)]"
            )}>
              {generationLimit.max === null ? "∞" : `${generationLimit.max}${generationLimit.unit}`}
            </Badge>
          )}
        </div>

        {/* Right Side - Price display */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {priceDisplay && (
            <span className={cn(
              "font-display text-xs font-bold",
              priceDisplay === "GRATUIT" 
                ? "text-[hsl(142,76%,50%)]"
                : "text-[hsl(45,100%,55%)]"
            )}>
              {priceDisplay}
            </span>
          )}
        </div>
      </div>

      {/* BOTTOM ZONE - Actions & Badges */}
      <div className={cn(
        "px-3 py-2 border-t shrink-0 flex items-center justify-between gap-2",
        style.borderColor,
        "bg-black/10"
      )}>
        {/* Left - Price */}
        <div className="flex items-center gap-1">
          {priceDisplay && (
            <span className={cn(
              "font-display text-[10px] font-bold",
              priceDisplay === "GRATUIT" 
                ? "text-[hsl(142,76%,50%)]"
                : "text-[hsl(45,100%,55%)]"
            )}>
              {priceDisplay}
            </span>
          )}
        </div>

        {/* Center - Uncensored text */}
        {isUncensored && (
          <span className="font-display text-[10px] font-black text-[hsl(0,100%,50%)] tracking-wider">
            SANS CENSURE
          </span>
        )}

        {/* Right - Status/Button */}
        <div className="flex items-center gap-1">
          {isUnlimited && !isUncensored && (
            <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] font-display text-[10px] gap-0.5 px-1.5">
              <InfinityIcon className="h-3 w-3" />
              ILLIMITÉ
            </Badge>
          )}
          
          {isActive ? (
            <span className="font-display text-xs font-black text-[hsl(142,76%,50%)]">
              ACTIF
            </span>
          ) : model.apiKeyName && (
            <Button
              size="sm"
              className="bg-[hsl(30,100%,60%)] hover:bg-[hsl(30,100%,65%)] text-black gap-1 font-display text-[10px] h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAPIKeyModal?.(model.apiKeyName!);
              }}
            >
              <Key className="h-3 w-3" />
              ACHETER
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
