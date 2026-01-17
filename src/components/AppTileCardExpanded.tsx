import { useEffect, useState } from "react";
import { 
  X, Key, ExternalLink, FileText, Video, Image as ImageIcon, 
  Music, MessageSquare, Box, Code, Wand2, Sparkles, Zap,
  Infinity as InfinityIcon, Euro, Check, AlertCircle
} from "lucide-react";
import { AIModel, apiConfigs } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { getPackageInfo } from "@/data/modelPackages";
import { StatusLED } from "@/components/StatusLED";
import { AnimatedFlame } from "@/components/AnimatedFlame";
import { EarthFallback } from "@/components/EarthFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AppTileCardExpandedProps {
  model: AIModel;
  isOpen: boolean;
  position?: { x: number; y: number };
  onClose: () => void;
  onOpenAPIKeyModal?: (apiKeyName: string) => void;
  onClick?: () => void;
}

// Styles par catégorie
const categoryStyles: Record<string, { gradient: string; border: string; text: string }> = {
  images: { gradient: "from-[hsl(320,100%,25%)]/90 to-[hsl(320,100%,15%)]/90", border: "border-[hsl(320,100%,60%)]", text: "text-[hsl(320,100%,60%)]" },
  videos: { gradient: "from-[hsl(280,100%,25%)]/90 to-[hsl(280,100%,15%)]/90", border: "border-[hsl(280,100%,65%)]", text: "text-[hsl(280,100%,65%)]" },
  llms: { gradient: "from-[hsl(45,100%,25%)]/90 to-[hsl(45,100%,15%)]/90", border: "border-[hsl(45,100%,55%)]", text: "text-[hsl(45,100%,55%)]" },
  audio: { gradient: "from-[hsl(25,100%,25%)]/90 to-[hsl(25,100%,15%)]/90", border: "border-[hsl(25,100%,55%)]", text: "text-[hsl(25,100%,55%)]" },
  retouch: { gradient: "from-[hsl(174,100%,20%)]/90 to-[hsl(174,100%,10%)]/90", border: "border-[hsl(174,100%,50%)]", text: "text-[hsl(174,100%,50%)]" },
  adult: { gradient: "from-[hsl(0,100%,25%)]/90 to-[hsl(0,100%,15%)]/90", border: "border-[hsl(0,100%,60%)]", text: "text-[hsl(0,100%,60%)]" },
  "3d": { gradient: "from-[hsl(142,76%,20%)]/90 to-[hsl(142,76%,10%)]/90", border: "border-[hsl(142,76%,50%)]", text: "text-[hsl(142,76%,50%)]" },
  code: { gradient: "from-[hsl(210,100%,25%)]/90 to-[hsl(210,100%,15%)]/90", border: "border-[hsl(210,100%,60%)]", text: "text-[hsl(210,100%,60%)]" },
};

const capabilityIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  text: <MessageSquare className="h-5 w-5" />,
  "3d": <Box className="h-5 w-5" />,
  code: <Code className="h-5 w-5" />,
  retouch: <Wand2 className="h-5 w-5" />,
};

export function AppTileCardExpanded({
  model,
  isOpen,
  position,
  onClose,
  onOpenAPIKeyModal,
  onClick,
}: AppTileCardExpandedProps) {
  const [calculatedPosition, setCalculatedPosition] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);

  const logoUrl = getModelLogo(model.id, model.provider);
  const isActive = model.apiStatus === "active" || model.isFree;
  const isAdult = model.category === "adult";
  const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;
  const packageInfo = getPackageInfo(model.id);
  const style = categoryStyles[model.category] || categoryStyles.images;

  useEffect(() => {
    if (position) {
      const expandedWidth = Math.min(window.innerWidth * 0.4, 500);
      const expandedHeight = 450;
      
      let x = position.x;
      let y = position.y;

      if (x + expandedWidth > window.innerWidth - 20) {
        x = position.x - expandedWidth - 20;
      }
      if (x < 20) x = 20;

      if (y + expandedHeight > window.innerHeight - 20) {
        y = window.innerHeight - expandedHeight - 20;
      }
      if (y < 20) y = 20;

      setCalculatedPosition({ x, y });
    }
  }, [position]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed z-[100] w-[40vw] max-w-[500px]",
        "bg-gradient-to-br",
        style.gradient,
        "border-2",
        style.border,
        "rounded-2xl overflow-hidden",
        "shadow-2xl shadow-black/60",
        "animate-in zoom-in-90 duration-200",
        "backdrop-blur-xl"
      )}
      style={{
        left: calculatedPosition.x,
        top: calculatedPosition.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 py-3 border-b", style.border, "bg-black/30")}>
        <div className="flex items-center gap-3">
          <StatusLED isActive={isActive} size="lg" />
          {isAdult && <AnimatedFlame size="md" />}
          <div>
            <h2 className="font-display text-xl font-black tracking-wider">{model.name}</h2>
            <p className="text-sm text-muted-foreground">{model.provider}</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="hover:bg-white/10">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="h-[380px]">
        <div className="p-4 space-y-4">
          {/* Logo + Description */}
          <div className="flex gap-4">
            <div className={cn(
              "h-20 w-20 shrink-0 rounded-2xl",
              "bg-gradient-to-br from-white/20 to-black/40",
              "shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.5),inset_3px_3px_8px_rgba(255,255,255,0.1)]",
              "border-2",
              style.border,
              "flex items-center justify-center overflow-hidden"
            )}>
              {!imageError && logoUrl ? (
                <img
                  src={logoUrl}
                  alt={model.provider}
                  className="h-14 w-14 object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <EarthFallback size={56} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
              
              {/* Adult warning */}
              {isAdult && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(0,100%,50%)]/20 border border-[hsl(0,100%,50%)]/50">
                  <AlertCircle className="h-4 w-4 text-[hsl(0,100%,60%)]" />
                  <span className="text-xs font-display font-bold text-[hsl(0,100%,60%)]">
                    CONTENU SANS CENSURE - 18+
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="panel-3d p-3">
              <span className="font-display text-[10px] text-muted-foreground block mb-1">STATUT</span>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <>
                    <Check className="h-4 w-4 text-[hsl(142,76%,50%)]" />
                    <span className="font-display font-bold text-[hsl(142,76%,50%)]">ACTIF</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-[hsl(30,100%,55%)]" />
                    <span className="font-display font-bold text-[hsl(30,100%,55%)]">INACTIF</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="panel-3d p-3">
              <span className="font-display text-[10px] text-muted-foreground block mb-1">PRIX</span>
              <div className="flex items-center gap-2">
                {model.isFree ? (
                  <>
                    <Zap className="h-4 w-4 text-[hsl(142,76%,50%)]" />
                    <span className="font-display font-bold text-[hsl(142,76%,50%)]">GRATUIT</span>
                  </>
                ) : (
                  <>
                    <Euro className="h-4 w-4 text-[hsl(45,100%,55%)]" />
                    <span className="font-display font-bold text-[hsl(45,100%,55%)]">{model.price || "Variable"}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          {model.features && model.features.length > 0 && (
            <div>
              <span className="font-display text-[10px] text-muted-foreground block mb-2">FONCTIONNALITÉS</span>
              <div className="flex flex-wrap gap-1.5">
                {model.features.map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {model.badges && model.badges.length > 0 && (
            <div>
              <span className="font-display text-[10px] text-muted-foreground block mb-2">BADGES</span>
              <div className="flex flex-wrap gap-1.5">
                {model.badges.map((badge, idx) => (
                  <Badge 
                    key={idx} 
                    className={cn(
                      "font-display text-xs",
                      badge.includes("FREE") && "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]",
                      badge.includes("PREMIUM") && "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)]",
                      badge.includes("NEW") && "bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)]",
                      badge.includes("🔥") && "bg-[hsl(25,100%,55%)]/20 text-[hsl(25,100%,55%)]"
                    )}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Package Info */}
          {packageInfo && (
            <div>
              <span className="font-display text-[10px] text-muted-foreground block mb-2">CAPACITÉS</span>
              <div className="flex flex-wrap gap-2">
                {packageInfo.capabilities?.map((cap) => (
                  <div
                    key={cap}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-lg",
                      "bg-white/10 border border-white/20",
                      style.text
                    )}
                  >
                    {capabilityIcons[cap]}
                    <span className="text-xs font-display font-bold uppercase">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {config && (
              <Button
                size="sm"
                className="btn-3d gap-1.5"
                onClick={() => window.open(config.apiUrl, '_blank')}
              >
                <Key className="h-4 w-4" />
                Obtenir clé API
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="btn-3d gap-1.5"
              onClick={() => window.open(model.docsUrl || model.officialUrl, '_blank')}
            >
              <FileText className="h-4 w-4" />
              Documentation
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="btn-3d gap-1.5"
              onClick={() => window.open(model.officialUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Site officiel
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Action */}
      <div className={cn("px-4 py-3 border-t", style.border, "bg-black/30")}>
        {isActive ? (
          <Button 
            className="w-full btn-3d-green gap-2 font-display"
            onClick={onClick}
          >
            <Sparkles className="h-4 w-4" />
            UTILISER CE MODÈLE
          </Button>
        ) : model.apiKeyName ? (
          <Button 
            className="w-full bg-[hsl(30,100%,55%)] hover:bg-[hsl(30,100%,60%)] text-black gap-2 font-display"
            onClick={() => onOpenAPIKeyModal?.(model.apiKeyName!)}
          >
            <Key className="h-4 w-4" />
            CONFIGURER LA CLÉ API
          </Button>
        ) : (
          <Button 
            className="w-full btn-3d gap-2 font-display"
            onClick={() => window.open(model.officialUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            ACCÉDER AU SERVICE
          </Button>
        )}
      </div>
    </div>
  );
}
