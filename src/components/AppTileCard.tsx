import { useState } from "react";
import { Key, ExternalLink, Flame, Image, Video, MessageSquare, Music, Wand2, Box, Code, Sparkles } from "lucide-react";
import { AIModel, apiConfigs } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { StatusLED } from "@/components/StatusLED";
import { VintageStamp } from "@/components/VintageStamp";
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
    icon: <Flame className="h-4 w-4" />,
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
  "image": { icon: <Image className="h-5 w-5" />, label: "Images" },
  "video": { icon: <Video className="h-5 w-5" />, label: "Vidéos" },
  "audio": { icon: <Music className="h-5 w-5" />, label: "Audio" },
  "text": { icon: <MessageSquare className="h-5 w-5" />, label: "Texte" },
  "3d": { icon: <Box className="h-5 w-5" />, label: "3D" },
  "code": { icon: <Code className="h-5 w-5" />, label: "Code" },
  "retouch": { icon: <Wand2 className="h-5 w-5" />, label: "Retouche" },
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
          // 3D depth effect
          "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.1),_0_4px_12px_hsl(220_20%_4%/0.4)]"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 p-4">
          {/* LED Status - Top Left */}
          <StatusLED isActive={isActive} size="lg" />
          
          {/* Logo */}
          <div className={cn(
            "h-14 w-14 rounded-xl overflow-hidden shrink-0",
            "bg-gradient-to-br from-background/80 to-background/40",
            "border",
            style.borderColor,
            "shadow-lg"
          )}>
            {!imageError ? (
              <img
                src={logoUrl}
                alt={model.provider}
                className="h-full w-full object-contain p-2"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground font-display">
                {model.provider.charAt(0)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold truncate tracking-wider">{model.name}</h3>
              {isUncensored && <Flame className="h-5 w-5 text-[hsl(0,100%,60%)] animate-pulse" />}
            </div>
            <p className="text-sm text-muted-foreground truncate font-display">{model.provider}</p>
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

          {/* Status Badge or API Key Button */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <VintageStamp />
            ) : model.apiKeyName ? (
              <Button
                size="sm"
                className="btn-3d-orange gap-2 font-display tracking-wider"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAPIKeyModal?.(model.apiKeyName!);
                }}
              >
                <Key className="h-4 w-4" />
                ACTIVER
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Grid view - Tile mosaic style with depth
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group",
        "bg-gradient-to-br",
        style.bgGradient,
        "border-2",
        style.borderColor,
        "hover:scale-[1.03] hover:shadow-xl",
        // Enhanced 3D mosaic tile effect with depth
        "shadow-[inset_0_2px_0_hsl(0_0%_100%/0.15),_inset_0_-4px_8px_hsl(0_0%_0%/0.2),_0_8px_24px_hsl(220_20%_4%/0.5),_0_4px_8px_hsl(220_20%_4%/0.3)]",
        "hover:shadow-[inset_0_2px_0_hsl(0_0%_100%/0.2),_inset_0_-4px_8px_hsl(0_0%_0%/0.15),_0_12px_32px_hsl(220_20%_4%/0.6),_0_6px_12px_hsl(220_20%_4%/0.4)]"
      )}
      onClick={onClick}
      style={{ minHeight: "220px" }}
    >
      {/* LED Status - Top Left */}
      <div className="absolute top-3 left-3 z-10">
        <StatusLED isActive={isActive} size="lg" />
      </div>

      {/* Logo - Top Center with contrasting background */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <div className={cn(
          "h-14 w-14 rounded-xl overflow-hidden",
          "bg-gradient-to-br from-background/90 to-background/70",
          "border-2",
          style.borderColor,
          "shadow-lg shadow-black/30",
          "transition-transform group-hover:scale-110"
        )}>
          {!imageError ? (
            <img
              src={logoUrl}
              alt={model.provider}
              className="h-full w-full object-contain p-2"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground font-display">
              {model.provider.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Uncensored flame indicator */}
      {isUncensored && (
        <div className="absolute top-3 right-3 z-10">
          <Flame className="h-6 w-6 text-[hsl(0,100%,60%)] animate-pulse drop-shadow-lg" />
        </div>
      )}

      {/* Active Stamp or API Button */}
      {isActive ? (
        <div className="absolute top-16 right-2 z-10">
          <VintageStamp />
        </div>
      ) : model.apiKeyName && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className={cn("font-display text-xs", style.badgeBg, style.textColor)}>
            API
          </Badge>
        </div>
      )}

      {/* Main Content - Below logo */}
      <div className="pt-20 px-4 pb-4 flex flex-col h-full">
        {/* Name & Provider */}
        <div className="text-center mb-3">
          <h3 className="font-display text-sm font-bold text-foreground mb-1 line-clamp-2 tracking-wider leading-tight">
            {model.name}
          </h3>
          <p className="text-xs text-muted-foreground font-display truncate">
            {model.provider}
          </p>
        </div>

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
        <div className="flex justify-center mb-3">
          <Badge className={cn(
            "font-display text-xs px-3 py-1",
            style.badgeBg,
            style.textColor,
            "border",
            style.borderColor
          )}>
            {style.icon}
            <span className="ml-1">{style.label}</span>
          </Badge>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price or Free tag */}
        <div className="text-center">
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

        {/* API Key Button for inactive models */}
        {!isActive && model.apiKeyName && (
          <Button
            size="sm"
            className="btn-3d-orange gap-2 font-display tracking-wider w-full mt-3"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAPIKeyModal?.(model.apiKeyName!);
            }}
          >
            <Key className="h-4 w-4" />
            ACTIVER
          </Button>
        )}
      </div>
    </div>
  );
}
