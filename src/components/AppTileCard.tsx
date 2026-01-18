import React, { useState } from "react";
import { 
  Key, ExternalLink, Video, MessageSquare, Music, Wand2, Box, Code, Sparkles, 
  Infinity as InfinityIcon, Euro, Link2, FileText,
  Image as ImageIcon
} from "lucide-react";
import { AIModel, apiConfigs } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { getPackageInfo } from "@/data/modelPackages";
import { StatusLED } from "@/components/StatusLED";
import { AnimatedFlame } from "@/components/AnimatedFlame";
import { EarthFallback } from "@/components/EarthFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  adult: {
    bgGradient: "from-[hsl(0,100%,25%)]/30 to-[hsl(0,100%,15%)]/30",
    borderColor: "border-[hsl(0,100%,60%)]/50",
    textColor: "text-[hsl(0,100%,60%)]",
    badgeBg: "bg-[hsl(0,100%,60%)]/20",
    icon: null,
    label: "18+"
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

// Icônes des capacités - Taille augmentée
const capabilityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  "image": { icon: <ImageIcon className="h-5 w-5" />, label: "IMAGE" },
  "video": { icon: <Video className="h-5 w-5" />, label: "VIDÉO" },
  "audio": { icon: <Music className="h-5 w-5" />, label: "AUDIO" },
  "text": { icon: <MessageSquare className="h-5 w-5" />, label: "TEXTE" },
  "3d": { icon: <Box className="h-5 w-5" />, label: "3D" },
  "code": { icon: <Code className="h-5 w-5" />, label: "CODE" },
  "retouch": { icon: <Wand2 className="h-5 w-5" />, label: "RETOUCHE" },
};

// Max generations per model with free generations info and prices in EUR
const modelGenerationLimits: Record<string, { 
  max: number | null; 
  unit: string; 
  freeGens?: number; 
  freeUnit?: string;
  priceEur?: string;
  minPrice?: string;
  remaining?: number;
}> = {
  "flux-schnell": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT", minPrice: "0€" },
  "perchance-ai": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT", minPrice: "0€" },
  "pollinations": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT", minPrice: "0€" },
  "ideogram-free": { max: 25, unit: "/jour", freeGens: 25, freeUnit: "/jour", priceEur: "GRATUIT", minPrice: "0€", remaining: 25 },
  "dall-e-3": { max: 200, unit: "/mois", freeGens: 0, freeUnit: "", priceEur: "0,04€", minPrice: "0,04€" },
  "midjourney-v6": { max: 200, unit: "/mois", freeGens: 25, freeUnit: "essai", priceEur: "9€/mois", minPrice: "0,05€", remaining: 25 },
  "stable-diffusion-3": { max: 150, unit: "/mois", freeGens: 25, freeUnit: "crédits", priceEur: "0,03€", minPrice: "0,03€", remaining: 25 },
  "runway-gen3": { max: 125, unit: "sec/mois", freeGens: 125, freeUnit: "sec essai", priceEur: "12€/mois", minPrice: "0,10€/s", remaining: 125 },
  "elevenlabs": { max: 10000, unit: "chars/mois", freeGens: 10000, freeUnit: "chars/mois", priceEur: "5€/mois", minPrice: "0,001€", remaining: 10000 },
  "gpt-4o": { max: null, unit: "illimité", freeGens: 0, freeUnit: "", priceEur: "0,01€/1K", minPrice: "0,01€" },
  "claude-3-5-sonnet": { max: null, unit: "illimité", freeGens: 0, freeUnit: "", priceEur: "0,01€/1K", minPrice: "0,01€" },
  "tensor-art": { max: 100, unit: "/jour", freeGens: 100, freeUnit: "crédits/jour", priceEur: "GRATUIT", minPrice: "0€", remaining: 100 },
  "leonardo-ai": { max: 150, unit: "/jour", freeGens: 150, freeUnit: "tokens/jour", priceEur: "11€/mois", minPrice: "0,07€", remaining: 150 },
  "playground-v2": { max: 500, unit: "/jour", freeGens: 500, freeUnit: "/jour", priceEur: "GRATUIT", minPrice: "0€", remaining: 500 },
  "pixart-alpha": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT", minPrice: "0€" },
  "sdxl-lightning": { max: null, unit: "illimité", freeGens: null, freeUnit: "illimité", priceEur: "GRATUIT", minPrice: "0€" },
  "kling-ai": { max: 66, unit: "/mois", freeGens: 66, freeUnit: "crédits/mois", priceEur: "5€/mois", minPrice: "0,08€", remaining: 66 },
  "luma-dream": { max: 30, unit: "/mois", freeGens: 30, freeUnit: "générations", priceEur: "24€/mois", minPrice: "0,80€", remaining: 30 },
  "hailuo-minimax": { max: 10, unit: "/jour", freeGens: 10, freeUnit: "/jour", priceEur: "GRATUIT", minPrice: "0€", remaining: 10 },
  "pika-labs": { max: 250, unit: "crédits", freeGens: 250, freeUnit: "essai", priceEur: "8€/mois", minPrice: "0,03€", remaining: 250 },
  "suno-ai": { max: 50, unit: "/jour", freeGens: 50, freeUnit: "crédits/jour", priceEur: "8€/mois", minPrice: "0,16€", remaining: 50 },
  "udio": { max: 1200, unit: "/mois", freeGens: 1200, freeUnit: "crédits/mois", priceEur: "10€/mois", minPrice: "0,01€", remaining: 1200 },
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
  const [isHovered, setIsHovered] = useState(false);
  const logoUrl = getModelLogo(model.id, model.provider);
  const isActive = model.apiStatus === "active" || model.isFree;
  const isAdult = model.category === "adult";
  const isUnlimited = model.isFree && (
    modelGenerationLimits[model.id]?.max === null || 
    model.badges?.includes("UNLIMITED") ||
    model.badges?.includes("NO SIGNUP")
  );
  const isFreeApp = model.isFree || modelGenerationLimits[model.id]?.priceEur === "GRATUIT";
  const isPaidOnly = !model.isFree && !modelGenerationLimits[model.id]?.freeGens;
  
  const generationLimit = modelGenerationLimits[model.id];
  const packageInfo = getPackageInfo(model.id);
  const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;
  
  // Determine effective category for styling
  const effectiveCategory = isActive && !model.isFree ? "activated" : 
                           model.isFree ? "free" : model.category;
  const style = categoryStyles[effectiveCategory] || categoryStyles.images;

  // Get capabilities from model features and package info
  const getModelCapabilities = () => {
    const caps: string[] = [];
    
    if (packageInfo?.capabilities) {
      packageInfo.capabilities.forEach(c => {
        if (!caps.includes(c)) caps.push(c);
      });
    }
    
    if (model.category === "images" || model.category === "retouch") {
      if (!caps.includes("image")) caps.push("image");
    }
    if (model.category === "videos") {
      if (!caps.includes("video")) caps.push("video");
    }
    if (model.category === "audio") {
      if (!caps.includes("audio")) caps.push("audio");
    }
    if (model.category === "llms") {
      if (!caps.includes("text")) caps.push("text");
    }
    if (model.category === "3d") {
      if (!caps.includes("3d")) caps.push("3d");
    }
    if (model.category === "code") {
      if (!caps.includes("code")) caps.push("code");
    }
    if (model.category === "retouch") {
      if (!caps.includes("retouch")) caps.push("retouch");
    }
    
    model.features?.forEach(f => {
      const fl = f.toLowerCase();
      if ((fl.includes("image") || fl.includes("photo")) && !caps.includes("image")) caps.push("image");
      if ((fl.includes("video") || fl.includes("vidéo")) && !caps.includes("video")) caps.push("video");
      if ((fl.includes("audio") || fl.includes("musique") || fl.includes("voix")) && !caps.includes("audio")) caps.push("audio");
      if ((fl.includes("text") || fl.includes("texte") || fl.includes("chat")) && !caps.includes("text")) caps.push("text");
      if ((fl.includes("code") || fl.includes("programming")) && !caps.includes("code")) caps.push("code");
      if ((fl.includes("3d") || fl.includes("mesh")) && !caps.includes("3d")) caps.push("3d");
      if ((fl.includes("retouch") || fl.includes("edit") || fl.includes("inpaint")) && !caps.includes("retouch")) caps.push("retouch");
    });
    
    return caps;
  };

  const capabilities = getModelCapabilities();

  // Price display
  const priceDisplay = generationLimit?.priceEur || model.price?.replace("$", "€") || "";
  const minPriceDisplay = generationLimit?.minPrice || "";
  
  // Remaining generations display
  const remainingGens = generationLimit?.remaining ?? generationLimit?.freeGens;

  // Detect if logo should be square (based on provider/model name patterns)
  const isSquareLogo = logoUrl?.includes("openai") || 
                       logoUrl?.includes("google") || 
                       logoUrl?.includes("microsoft") ||
                       model.provider.toLowerCase().includes("openai") ||
                       model.provider.toLowerCase().includes("google") ||
                       model.provider.toLowerCase().includes("anthropic");

  // LIST VIEW - Full width with all details
  if (viewMode === "list") {
    return (
      <TooltipProvider>
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center gap-4 p-4">
            {/* LED Status */}
            <StatusLED isActive={isActive} size="lg" />
            
            {/* Flame + SANS CENSURE for adult content */}
            {isAdult && (
              <div className="flex items-center gap-2">
                <AnimatedFlame size="lg" />
                <span className="font-display text-sm font-black text-[hsl(0,100%,50%)] tracking-wider animate-pulse">
                  SANS CENSURE
                </span>
              </div>
            )}
            
            {/* Logo - Square or Round based on logo type */}
            <div className={cn(
              "h-16 w-16 shrink-0",
              isSquareLogo ? "rounded-xl" : "rounded-full",
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
                  className={cn("h-12 w-12 object-contain", isSquareLogo ? "rounded-lg" : "rounded-full")}
                  onError={() => setImageError(true)}
                />
              ) : (
                <EarthFallback size={48} />
              )}
            </div>

            {/* App Name & Provider - BIGGER FONTS */}
            <div className="min-w-[200px]">
              <h3 className="font-display text-xl font-black truncate tracking-wider">{model.name}</h3>
              <p className="text-base text-muted-foreground truncate font-display">{model.provider}</p>
            </div>

            {/* Capabilities Icons */}
            <div className="flex items-center gap-3 min-w-[150px]">
              {capabilities.map(cap => (
                <Tooltip key={cap}>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center",
                        "bg-gradient-to-br from-white/10 to-black/20",
                        "shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)]",
                        style.textColor
                      )}
                    >
                      {capabilityIcons[cap]?.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{capabilityIcons[cap]?.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Free/Unlimited/Paid Status - VISIBLE */}
            <div className="min-w-[120px] text-center">
              {isFreeApp && isUnlimited && (
                <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] font-display text-sm font-bold px-3 py-1">
                  ∞ GRATUIT ILLIMITÉ
                </Badge>
              )}
              {isFreeApp && !isUnlimited && (
                <Badge className="bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)] font-display text-sm font-bold px-3 py-1">
                  GRATUIT
                </Badge>
              )}
              {isPaidOnly && (
                <Badge className="bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] font-display text-sm font-bold px-3 py-1">
                  💰 PAYANT
                </Badge>
              )}
            </div>

            {/* Min Price for paid apps */}
            {minPriceDisplay && minPriceDisplay !== "0€" && (
              <div className="min-w-[80px] text-center">
                <span className="font-display text-base font-bold text-[hsl(45,100%,55%)]">
                  à partir de {minPriceDisplay}
                </span>
              </div>
            )}

            {/* Links - API Key & Docs */}
            <div className="flex items-center gap-2 min-w-[150px]">
              {config && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-3d h-8 px-2 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(config.apiUrl, '_blank');
                      }}
                    >
                      <Key className="h-4 w-4" />
                      API
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Obtenir clé API</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="btn-3d h-8 px-2 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(model.docsUrl || model.officialUrl, '_blank');
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Docs
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Documentation</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Status / Action Button */}
            <div className="flex items-center gap-2 ml-auto">
              {isActive ? (
                <span className="font-display text-xl font-black text-[hsl(142,76%,50%)] tracking-wider">
                  ACTIF
                </span>
              ) : model.apiKeyName ? (
                <Button
                  size="sm"
                  className="bg-[hsl(30,100%,60%)] hover:bg-[hsl(30,100%,65%)] text-black gap-2 font-display tracking-wider text-sm"
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
      </TooltipProvider>
    );
  }

  // GRID VIEW - Card with hover info - TAILLE RÉDUITE DE 20%
  return (
    <TooltipProvider>
      <div 
        className={cn(
          "relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer group",
          "bg-gradient-to-br",
          style.bgGradient,
          "border",
          style.borderColor,
          // FIX: Animation survol - S'AGRANDIT uniformément
          "hover:scale-[1.08] hover:z-50 hover:shadow-2xl",
          "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.1),_0_4px_12px_hsl(220_20%_4%/0.3)]"
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          minHeight: "180px", // Réduit de 240px à 180px (-25%)
          display: "flex",
          flexDirection: "column",
          transformOrigin: "center center",
          // TASK-002 FIX: Ne pas changer le background au hover
        }}
      >
        {/* TOP ZONE - App Name + LED + Flame */}
        <div className={cn(
          "px-3 py-2 border-b shrink-0 flex items-center justify-between gap-2",
          style.borderColor,
          "bg-black/20"
        )}>
          {/* LED Status */}
          <StatusLED isActive={isActive} size="md" />
          
          {/* Nom de l'app - POLICE AUGMENTÉE 50% */}
          <div className="flex-1 text-center">
            <h3 className="font-display text-xl font-black text-foreground tracking-wider truncate">
              {model.name}
            </h3>
          </div>
          
          {/* Flame for adult content */}
          {isAdult && <AnimatedFlame size="md" />}
        </div>

        {/* MIDDLE ZONE - Logo + Info */}
        <div className="flex-1 p-3 flex items-start gap-3">
          {/* Logo - Square or Round based on logo type */}
          <div className={cn(
            "h-16 w-16 shrink-0",
            isSquareLogo ? "rounded-xl" : "rounded-full",
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
                className={cn("h-12 w-12 object-contain", isSquareLogo ? "rounded-lg" : "")}
                onError={() => setImageError(true)}
              />
            ) : (
              <EarthFallback size={48} />
            )}
          </div>

          {/* Info Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {/* Provider - BIGGER FONT */}
            <p className="text-sm text-muted-foreground font-display truncate font-bold">
              {model.provider}
            </p>
            
            {/* SANS CENSURE badge for adult */}
            {isAdult && (
              <span className="font-display text-sm font-black text-[hsl(0,100%,50%)] tracking-wider animate-pulse">
                SANS CENSURE
              </span>
            )}
            
            {/* Capabilities Icons Row */}
            <div className="flex gap-1 flex-wrap">
              {capabilities.slice(0, 4).map(cap => (
                <Tooltip key={cap}>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "flex flex-col items-center gap-0.5",
                        "rounded-md p-1.5",
                        "bg-gradient-to-br from-white/10 to-black/20",
                        "shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)]",
                        style.textColor
                      )}
                    >
                      {capabilityIcons[cap]?.icon}
                      <span className="text-[9px] font-display font-bold">{capabilityIcons[cap]?.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{capabilityIcons[cap]?.label} - {minPriceDisplay || "Variable"}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Free/Paid Status - VISIBLE */}
            <div className="flex items-center gap-1 mt-1">
              {isFreeApp && isUnlimited && (
                <Badge className="bg-[hsl(142,76%,50%)]/30 text-[hsl(142,76%,50%)] font-display text-xs font-bold px-2 py-0.5">
                  ∞ GRATUIT
                </Badge>
              )}
              {isFreeApp && !isUnlimited && (
                <Badge className="bg-[hsl(174,100%,50%)]/30 text-[hsl(174,100%,50%)] font-display text-xs font-bold px-2 py-0.5">
                  GRATUIT
                </Badge>
              )}
              {isPaidOnly && (
                <Badge className="bg-[hsl(45,100%,55%)]/30 text-[hsl(45,100%,55%)] font-display text-xs font-bold px-2 py-0.5">
                  💰 PAYANT
                </Badge>
              )}
            </div>

            {/* Generation Limit + Remaining */}
            {generationLimit && (
              <div className="flex items-center gap-1 mt-1">
                <Badge className={cn(
                  "font-display text-[10px] px-2 py-0.5",
                  generationLimit.max === null 
                    ? "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]"
                    : "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)]"
                )}>
                  {generationLimit.max === null ? "∞" : `${generationLimit.max}${generationLimit.unit}`}
                </Badge>
                {remainingGens !== undefined && remainingGens !== null && generationLimit.max !== null && (
                  <Badge className="font-display text-[10px] px-2 py-0.5 bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)]">
                    {remainingGens} restants
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Price display + Min Price */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {priceDisplay && (
              <span className={cn(
                "font-display text-sm font-bold",
                priceDisplay === "GRATUIT" 
                  ? "text-[hsl(142,76%,50%)]"
                  : "text-[hsl(45,100%,55%)]"
              )}>
                {priceDisplay}
              </span>
            )}
            {minPriceDisplay && minPriceDisplay !== "0€" && (
              <span className="font-display text-xs text-muted-foreground">
                min: {minPriceDisplay}
              </span>
            )}
          </div>
        </div>

        {/* HOVER INFO PANEL - TASK-002 FIX: Garde les couleurs, pas de fond noir */}
        {isHovered && (
          <div className={cn(
            "absolute inset-0 flex flex-col p-3 z-10",
            "animate-in fade-in duration-200",
            // TASK-002 FIX: Fond semi-transparent avec les couleurs du thème
            "bg-gradient-to-br",
            style.bgGradient,
            "bg-opacity-95"
          )}>
            <h3 className="font-display text-lg font-black text-foreground mb-2">{model.name}</h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{model.description}</p>
            
            {/* Features */}
            {model.features && model.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {model.features.slice(0, 4).map((f, idx) => (
                  <Badge key={idx} variant="outline" className="text-[9px]">{f}</Badge>
                ))}
              </div>
            )}
            
            {/* Links */}
            <div className="flex gap-2 mt-auto">
              {config && (
                <a
                  href={config.apiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center btn-3d h-7 px-2 gap-1 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Key className="h-3 w-3" />
                  Clé API
                </a>
              )}
              <a
                href={model.docsUrl || model.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center btn-3d h-7 px-2 gap-1 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-3 w-3" />
                Docs
              </a>
              <a
                href={model.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center btn-3d h-7 px-2 gap-1 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                Site
              </a>
            </div>
          </div>
        )}

        {/* BOTTOM ZONE - Actions & Status */}
        <div className={cn(
          "px-3 py-2 border-t shrink-0 flex items-center justify-between gap-2",
          style.borderColor,
          "bg-black/10"
        )}>
          {/* Left - Status badges */}
          <div className="flex items-center gap-1">
            {isUnlimited && (
              <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] font-display text-[10px] gap-0.5 px-1.5">
                <InfinityIcon className="h-3 w-3" />
                ILLIMITÉ
              </Badge>
            )}
          </div>

          {/* GROS TAMPON -18 pour contenu adulte */}
          {isAdult && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full border-4 border-[hsl(0,100%,50%)] bg-[hsl(0,100%,50%)]/20 rotate-[-15deg]">
              <span className="font-display text-lg font-black text-[hsl(0,100%,50%)]">-18</span>
            </div>
          )}

          {/* Right - Status/Button */}
          <div className="flex items-center gap-1">
            {isActive ? (
              <span className="font-display text-sm font-black text-[hsl(142,76%,50%)]">
                ACTIF
              </span>
            ) : model.apiKeyName && (
              <Button
                size="sm"
                className="bg-[hsl(30,100%,60%)] hover:bg-[hsl(30,100%,65%)] text-black gap-1 font-display text-[10px] h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAPIKeyModal?.(model.apiKeyName!);
                }}
              >
                <Key className="h-3 w-3" />
                ACTIVER
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
