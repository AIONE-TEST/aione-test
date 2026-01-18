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
const categoryStyles: Record<string, { bgGradient: string; borderColor: string; textColor: string; badgeBg: string; icon: React.ReactNode; label: string }> = {
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
  "image": { icon: <ImageIcon className="h-6 w-6" />, label: "IMAGE" },
  "video": { icon: <Video className="h-6 w-6" />, label: "VIDÉO" },
  "audio": { icon: <Music className="h-6 w-6" />, label: "AUDIO" },
  "text": { icon: <MessageSquare className="h-6 w-6" />, label: "TEXTE" },
  "3d": { icon: <Box className="h-6 w-6" />, label: "3D" },
  "code": { icon: <Code className="h-6 w-6" />, label: "CODE" },
  "retouch": { icon: <Wand2 className="h-6 w-6" />, label: "RETOUCHE" },
};

// Max generations per model with free generations info and prices in EUR
const modelGenerationLimits: Record<string, { max: number | null; unit: string; freeGens: number | null; freeUnit: string; priceEur: string; minPrice: string; remaining?: number }> = {
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
            "group relative w-full p-4 rounded-xl cursor-pointer",
            "bg-gradient-to-r",
            style.bgGradient,
            "border",
            style.borderColor,
            "hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
          )}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center gap-4">

            {/* LED Status */}
            <StatusLED isActive={isActive} size="lg" />
            
            {/* Flame + SANS CENSURE for adult content */}
            {isAdult && (
              <div className="flex items-center gap-2">
                <AnimatedFlame size="md" />
                <span className="text-[hsl(0,100%,60%)] text-xs font-bold tracking-wider">
                  SANS CENSURE
                </span>
              </div>
            )}
            
            {/* Logo - Square or Round based on logo type */}
            <div className={cn(
              "relative w-14 h-14 flex-shrink-0 overflow-hidden",
              isSquareLogo ? "rounded-lg" : "rounded-full",
              "bg-black/40 border border-white/10"
            )}>
              {!imageError && logoUrl ? (
                <img
                  src={logoUrl}
                  alt={model.name}
                  className="w-full h-full object-contain p-1"
                  onError={() => setImageError(true)}
                />
              ) : (
                <EarthFallback size={48} />
              )}
            </div>

            {/* App Name & Provider - BIGGER FONTS */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-xl text-white truncate">
                {model.name}
              </h3>
              <p className="text-base text-muted-foreground truncate">
                {model.provider}
              </p>
            </div>

            {/* Capabilities Icons */}
            <div className="flex items-center gap-3">
              {capabilities.map(cap => (
                <Tooltip key={cap}>
                  <TooltipTrigger>
                    <div className={cn("p-2 rounded-lg", style.badgeBg, style.textColor)}>
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
            <div className="flex items-center gap-2">
              {isFreeApp && isUnlimited && (
                <Badge className="bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)] border-[hsl(174,100%,50%)]/30 text-sm">
                  ∞ GRATUIT ILLIMITÉ
                </Badge>
              )}
              {isFreeApp && !isUnlimited && (
                <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-sm">
                  GRATUIT
                </Badge>
              )}
              {isPaidOnly && (
                <Badge className="bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30 text-sm">
                  💰 PAYANT
                </Badge>
              )}
            </div>

            {/* Min Price for paid apps */}
            {minPriceDisplay && minPriceDisplay !== "0€" && (
              <div className="text-right">
                <span className="text-sm text-muted-foreground">
                  à partir de {minPriceDisplay}
                </span>
              </div>
            )}

            {/* Links - API Key & Docs */}
            <div className="flex items-center gap-2">
              {config && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[hsl(280,100%,65%)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(config.apiUrl, '_blank');
                      }}
                    >
                      <Key className="h-4 w-4 mr-1" />
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
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(model.docsUrl || model.officialUrl, '_blank');
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Docs
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Documentation</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Status / Action Button */}
            <div className="flex items-center">
              {isActive ? (
                <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30">
                  ACTIF
                </Badge>
              ) : model.apiKeyName ? (
                <Button
                  size="sm"
                  className="bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)] border border-[hsl(280,100%,65%)]/30 hover:bg-[hsl(280,100%,65%)]/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAPIKeyModal?.(model.apiKeyName!);
                  }}
                >
                  <Key className="h-4 w-4 mr-1" />
                  ACTIVER
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // GRID VIEW - Card with hover info
  return (
    <TooltipProvider>
      <div
        className={cn(
          "group relative rounded-xl cursor-pointer transition-all duration-300",
          "bg-gradient-to-br",
          style.bgGradient,
          "border",
          style.borderColor,
          "hover:scale-[1.08] hover:z-50 hover:shadow-2xl",
          "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.1),_0_4px_12px_hsl(220_20%_4%/0.3)]"
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          minHeight: "240px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* TOP ZONE - App Name + LED + Flame */}
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          {/* LED Status */}
          <StatusLED isActive={isActive} size="sm" />
          
          {/* Nom de l'app - POLICE AUGMENTÉE 50% */}
          <div className="flex-1 text-center px-2">
            <h3 className={cn(
              "font-display font-bold text-lg leading-tight text-white truncate"
            )}>
              {model.name}
            </h3>
          </div>
          
          {/* Flame for adult content */}
          {isAdult && <AnimatedFlame size="sm" />}
        </div>

        {/* MIDDLE ZONE - Logo + Info */}
        <div className="flex-1 flex items-center gap-3 p-3">
          {/* Logo - Square or Round based on logo type */}
          <div className={cn(
            "relative w-16 h-16 flex-shrink-0 overflow-hidden",
            isSquareLogo ? "rounded-lg" : "rounded-full",
            "bg-black/40 border border-white/10"
          )}>
            {!imageError && logoUrl ? (
              <img
                src={logoUrl}
                alt={model.name}
                className="w-full h-full object-contain p-1"
                onError={() => setImageError(true)}
              />
            ) : (
              <EarthFallback size={48} />
            )}
          </div>

          {/* Info Column */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Provider - BIGGER FONT */}
            <p className={cn(
              "text-base font-medium text-muted-foreground truncate"
            )}>
              {model.provider}
            </p>
            
            {/* SANS CENSURE badge for adult */}
            {isAdult && (
              <Badge className="bg-[hsl(0,100%,60%)]/20 text-[hsl(0,100%,60%)] border-[hsl(0,100%,60%)]/30 text-xs">
                SANS CENSURE
              </Badge>
            )}
            
            {/* Capabilities Icons Row */}
            <div className="flex flex-wrap gap-1">
              {capabilities.slice(0, 4).map(cap => (
                <Tooltip key={cap}>
                  <TooltipTrigger>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-xs",
                      style.badgeBg, style.textColor
                    )}>
                      {capabilityIcons[cap]?.icon}
                      {capabilityIcons[cap]?.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{capabilityIcons[cap]?.label} - {minPriceDisplay || "Variable"}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Free/Paid Status - VISIBLE */}
            <div className="flex items-center gap-1">
              {isFreeApp && isUnlimited && (
                <Badge className="bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)] border-[hsl(174,100%,50%)]/30 text-xs">
                  ∞ GRATUIT
                </Badge>
              )}
              {isFreeApp && !isUnlimited && (
                <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-xs">
                  GRATUIT
                </Badge>
              )}
              {isPaidOnly && (
                <Badge className="bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30 text-xs">
                  💰 PAYANT
                </Badge>
              )}
            </div>

            {/* Generation Limit + Remaining */}
            {generationLimit && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {generationLimit.max === null ? "∞" : `${generationLimit.max}${generationLimit.unit}`}
                </span>
                {remainingGens !== undefined && remainingGens !== null && generationLimit.max !== null && (
                  <span className="text-[hsl(142,76%,50%)]">
                    {remainingGens} restants
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Price display + Min Price */}
          <div className="text-right flex-shrink-0">
            {priceDisplay && (
              <div className={cn("text-base font-bold", style.textColor)}>
                {priceDisplay}
              </div>
            )}
            {minPriceDisplay && minPriceDisplay !== "0€" && (
              <div className="text-xs text-muted-foreground">
                min: {minPriceDisplay}
              </div>
            )}
          </div>
        </div>

        {/* HOVER INFO PANEL */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/90 rounded-xl p-4 flex flex-col justify-between z-10 backdrop-blur-sm">
            <h3 className="font-display font-bold text-lg text-white mb-2">{model.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{model.description}</p>
            
            {/* Features */}
            {model.features && model.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {model.features.slice(0, 4).map((f, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            )}
            
            {/* Links */}
            <div className="flex items-center gap-2">
              {config && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[hsl(280,100%,65%)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(config.apiUrl, '_blank');
                  }}
                >
                  <Key className="h-3 w-3 mr-1" />
                  Clé API
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(model.docsUrl || model.officialUrl, '_blank');
                }}
              >
                <FileText className="h-3 w-3 mr-1" />
                Docs
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(model.officialUrl, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Site
              </Button>
            </div>
          </div>
        )}

        {/* BOTTOM ZONE - Actions & Status */}
        <div className="flex items-center justify-between p-3 border-t border-white/5 mt-auto">
          {/* Left - Status badges */}
          <div className="flex items-center gap-2">
            {isUnlimited && (
              <Badge className="bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)] border-[hsl(174,100%,50%)]/30 text-xs gap-1">
                <InfinityIcon className="h-3 w-3" />
                ILLIMITÉ
              </Badge>
            )}
          </div>

          {/* GROS TAMPON -18 pour contenu adulte */}
          {isAdult && (
            <div className="absolute bottom-2 right-2 transform rotate-[-15deg] opacity-40">
              <span className="text-4xl font-black text-[hsl(0,100%,60%)] tracking-tighter">-18</span>
            </div>
          )}

          {/* Right - Status/Button */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 text-xs">
                ACTIF
              </Badge>
            ) : model.apiKeyName && (
              <Button
                size="sm"
                className="h-7 text-xs bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)] border border-[hsl(280,100%,65%)]/30 hover:bg-[hsl(280,100%,65%)]/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAPIKeyModal?.(model.apiKeyName!);
                }}
              >
                <Key className="h-3 w-3 mr-1" />
                ACTIVER
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
