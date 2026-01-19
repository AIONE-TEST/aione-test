import React, { useState } from "react";
import {
  Key,
  ExternalLink,
  Video,
  MessageSquare,
  Music,
  Wand2,
  Box,
  Code,
  Sparkles,
  Infinity as InfinityIcon,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { AIModel, apiConfigs } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { StatusLED } from "@/components/StatusLED";
import { AnimatedFlame } from "@/components/AnimatedFlame";
import { EarthFallback } from "@/components/EarthFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const categoryStyles: Record<string, { bgGradient: string; borderColor: string; textColor: string }> = {
  activated: {
    bgGradient: "from-[hsl(142,76%,20%)]/30 to-[hsl(142,76%,10%)]/30",
    borderColor: "border-[hsl(142,76%,50%)]/50",
    textColor: "text-[hsl(142,76%,50%)]",
  },
  free: {
    bgGradient: "from-[hsl(174,100%,20%)]/30 to-[hsl(174,100%,10%)]/30",
    borderColor: "border-[hsl(174,100%,50%)]/50",
    textColor: "text-[hsl(174,100%,50%)]",
  },
  videos: {
    bgGradient: "from-[hsl(280,100%,25%)]/30 to-[hsl(280,100%,15%)]/30",
    borderColor: "border-[hsl(280,100%,65%)]/50",
    textColor: "text-[hsl(280,100%,65%)]",
  },
  images: {
    bgGradient: "from-[hsl(320,100%,25%)]/30 to-[hsl(320,100%,15%)]/30",
    borderColor: "border-[hsl(320,100%,60%)]/50",
    textColor: "text-[hsl(320,100%,60%)]",
  },
  llms: {
    bgGradient: "from-[hsl(45,100%,25%)]/30 to-[hsl(45,100%,15%)]/30",
    borderColor: "border-[hsl(45,100%,55%)]/50",
    textColor: "text-[hsl(45,100%,55%)]",
  },
  retouch: {
    bgGradient: "from-[hsl(174,100%,20%)]/30 to-[hsl(174,100%,10%)]/30",
    borderColor: "border-[hsl(174,100%,50%)]/50",
    textColor: "text-[hsl(174,100%,50%)]",
  },
  audio: {
    bgGradient: "from-[hsl(25,100%,25%)]/30 to-[hsl(25,100%,15%)]/30",
    borderColor: "border-[hsl(25,100%,55%)]/50",
    textColor: "text-[hsl(25,100%,55%)]",
  },
  adult: {
    bgGradient: "from-[hsl(0,100%,25%)]/30 to-[hsl(0,100%,15%)]/30",
    borderColor: "border-[hsl(0,100%,60%)]/50",
    textColor: "text-[hsl(0,100%,60%)]",
  },
};

export function AppTileCard({ model, onOpenAPIKeyModal, onClick }: any) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const logoUrl = getModelLogo(model.id, model.provider);
  const isActive = model.apiStatus === "active" || model.isFree;
  const isAdult = model.category === "adult";

  const style = categoryStyles[model.category] || categoryStyles.images;
  const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group",
          "bg-gradient-to-br",
          style.bgGradient,
          "border-2",
          style.borderColor,
          "hover:scale-[1.03] hover:shadow-2xl shadow-[inset_0_2px_0_hsl(0_0%_100%/0.15),_0_6px_16px_hsl(220_20%_4%/0.4)]",
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ minHeight: "240px", display: "flex", flexDirection: "column" }}
      >
        {/* HEADER */}
        <div className={cn("px-3 py-2 border-b flex items-center justify-between bg-black/20", style.borderColor)}>
          <StatusLED isActive={isActive} size="md" />
          <h3 className="flex-1 text-center font-display text-xl font-black text-foreground tracking-wider truncate uppercase">
            {model.name}
          </h3>
          {isAdult && <AnimatedFlame size="md" />}
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-3 flex gap-3">
          <div
            className={cn(
              "h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br from-white/20 to-black/50 border-2 flex items-center justify-center overflow-hidden shadow-lg",
              style.borderColor,
            )}
          >
            {!imageError && logoUrl ? (
              <img src={logoUrl} alt="logo" className="h-12 w-12 object-contain" onError={() => setImageError(true)} />
            ) : (
              <EarthFallback size={40} />
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <p className="text-sm font-display font-bold text-muted-foreground truncate">{model.provider}</p>
            {isAdult && (
              <span className="font-display text-[10px] font-black text-red-500 animate-pulse tracking-tighter">
                SANS CENSURE
              </span>
            )}
            <div className="flex gap-1 mt-1">
              <Badge className="text-[9px] bg-white/10 font-black">{model.isFree ? "GRATUIT" : "PREMIUM"}</Badge>
            </div>
          </div>
        </div>

        {/* HOVER INFO */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/95 p-4 flex flex-col z-20 animate-in fade-in duration-200">
            <h3 className="font-display text-lg font-black mb-1 uppercase">{model.name}</h3>
            <p className="text-[10px] text-muted-foreground line-clamp-4 leading-relaxed">{model.description}</p>
            <div className="flex gap-2 mt-auto">
              {config && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] border-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(config.apiUrl, "_blank");
                  }}
                >
                  <Key className="h-3 w-3 mr-1" /> API
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] border-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(model.officialUrl, "_blank");
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" /> SITE
              </Button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div
          className={cn("px-3 py-2 border-t flex items-center justify-between bg-black/10 mt-auto", style.borderColor)}
        >
          <div className="flex items-center gap-1">
            {model.isFree && <Badge className="bg-green-500/20 text-green-500 text-[10px] border-0">FREE</Badge>}
          </div>
          {isAdult && (
            <div className="absolute right-2 bottom-1 w-12 h-12 rounded-full border-4 border-red-500/40 flex items-center justify-center rotate-[-15deg]">
              <span className="font-display text-lg font-black text-red-500/60">-18</span>
            </div>
          )}
          <div>
            {isActive ? (
              <span className="font-display text-xs font-black text-green-500 tracking-widest">ACTIF</span>
            ) : (
              model.apiKeyName && (
                <Button
                  size="sm"
                  className="h-7 text-[10px] bg-orange-500 text-black font-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAPIKeyModal?.(model.apiKeyName!);
                  }}
                >
                  ACTIVER
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
