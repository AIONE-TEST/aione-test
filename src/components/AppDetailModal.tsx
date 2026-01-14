import React from "react";
import { 
  ExternalLink, Key, Star, Video, Image as ImageIcon, Music, 
  MessageSquare, Wand2, Box, Code, Info, DollarSign, Zap, 
  FileText, Link2, Settings, X
} from "lucide-react";
import { AIModel, apiConfigs } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { getPackageInfo } from "@/data/modelPackages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AppDetailModalProps {
  model: AIModel | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAPIKeyModal?: (apiKeyName: string) => void;
}

// Icônes des capacités
const capabilityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  "image": { icon: <ImageIcon className="h-5 w-5" />, label: "Images" },
  "video": { icon: <Video className="h-5 w-5" />, label: "Vidéos" },
  "audio": { icon: <Music className="h-5 w-5" />, label: "Audio" },
  "text": { icon: <MessageSquare className="h-5 w-5" />, label: "Texte" },
  "3d": { icon: <Box className="h-5 w-5" />, label: "3D" },
  "code": { icon: <Code className="h-5 w-5" />, label: "Code" },
  "retouch": { icon: <Wand2 className="h-5 w-5" />, label: "Retouche" },
};

// Prix et générations estimés
const modelPricing: Record<string, {
  pricePerGen: string;
  freeGens: number | null;
  maxGens: number | null;
  tokens?: string;
  credits?: string;
}> = {
  "flux-schnell": { pricePerGen: "0€", freeGens: null, maxGens: null, tokens: "Illimité" },
  "perchance-ai": { pricePerGen: "0€", freeGens: null, maxGens: null, tokens: "Illimité" },
  "pollinations": { pricePerGen: "0€", freeGens: null, maxGens: null, tokens: "Illimité" },
  "ideogram-free": { pricePerGen: "0€", freeGens: 25, maxGens: 25, tokens: "25/jour" },
  "dall-e-3": { pricePerGen: "0,04€", freeGens: 0, maxGens: 200, tokens: "Variable" },
  "midjourney-v6": { pricePerGen: "~0,20€", freeGens: 25, maxGens: 200, credits: "200 fast/mois" },
  "runway-gen3": { pricePerGen: "0,10€/sec", freeGens: 125, maxGens: 625, credits: "625 sec/mois" },
  "stable-diffusion-3": { pricePerGen: "0,03€", freeGens: 25, maxGens: 150, credits: "25 gratuits" },
  "elevenlabs": { pricePerGen: "~0,001€/char", freeGens: 10000, maxGens: 100000, tokens: "10K chars/mois" },
  "suno-ai": { pricePerGen: "~0,10€", freeGens: 50, maxGens: 500, credits: "50 crédits/jour" },
  "kling-ai": { pricePerGen: "~0,15€", freeGens: 66, maxGens: 660, credits: "66 crédits/mois" },
  "luma-dream": { pricePerGen: "~0,80€", freeGens: 30, maxGens: 150, credits: "30 gen/mois" },
};

export function AppDetailModal({ model, isOpen, onClose, onOpenAPIKeyModal }: AppDetailModalProps) {
  if (!model) return null;

  const logoUrl = getModelLogo(model.id, model.provider);
  const packageInfo = getPackageInfo(model.id);
  const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;
  const pricing = modelPricing[model.id];
  const isActive = model.apiStatus === "active" || model.isFree;
  const isAdult = model.category === "adult";

  // Get capabilities
  const getModelCapabilities = () => {
    const caps: string[] = [];
    if (model.category === "images" || model.category === "retouch") caps.push("image");
    if (model.category === "videos") caps.push("video");
    if (model.category === "audio") caps.push("audio");
    if (model.category === "llms") caps.push("text");
    if (model.category === "3d") caps.push("3d");
    if (model.category === "code") caps.push("code");
    model.features?.forEach(f => {
      const fl = f.toLowerCase();
      if (fl.includes("video") && !caps.includes("video")) caps.push("video");
      if (fl.includes("image") && !caps.includes("image")) caps.push("image");
      if (fl.includes("audio") && !caps.includes("audio")) caps.push("audio");
    });
    return caps;
  };

  const capabilities = getModelCapabilities();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl panel-3d border-2 border-[hsl(var(--primary))]/50 max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-4">
            {/* Logo */}
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-white/20 to-black/30 border-2 border-[hsl(var(--primary))]/30 flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt={model.provider}
                className="h-12 w-12 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            
            {/* Title */}
            <div className="flex-1">
              <h2 className="font-display text-2xl font-black tracking-wider gradient-text-cyan">
                {model.name}
              </h2>
              <p className="text-sm text-muted-foreground font-display">
                par {model.provider}
              </p>
            </div>

            {/* Status */}
            <Badge className={cn(
              "font-display text-sm",
              isActive 
                ? "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]"
                : "bg-muted text-muted-foreground"
            )}>
              {isActive ? "ACTIF" : "INACTIF"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 py-4">
            {/* Description */}
            <div className="panel-3d p-4">
              <p className="text-sm text-foreground leading-relaxed">
                {model.description}
              </p>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                FONCTIONNALITÉS
              </h3>
              <div className="flex flex-wrap gap-3">
                {capabilities.map(cap => (
                  <div 
                    key={cap}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30"
                  >
                    <span className="text-[hsl(var(--primary))]">{capabilityIcons[cap]?.icon}</span>
                    <span className="font-display text-sm font-bold">{capabilityIcons[cap]?.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Quotas */}
            <div>
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                TARIFS & QUOTAS
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="panel-3d p-3 text-center">
                  <span className="text-2xl font-black text-[hsl(var(--primary))]">
                    {pricing?.pricePerGen || model.price || "N/A"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">par génération</p>
                </div>
                <div className="panel-3d p-3 text-center">
                  <span className="text-2xl font-black text-[hsl(142,76%,50%)]">
                    {pricing?.freeGens === null ? "∞" : pricing?.freeGens ?? "0"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">générations gratuites</p>
                </div>
                <div className="panel-3d p-3 text-center">
                  <span className="text-lg font-bold text-foreground">
                    {pricing?.tokens || pricing?.credits || "Variable"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">tokens/crédits</p>
                </div>
                <div className="panel-3d p-3 text-center">
                  <span className="text-lg font-bold text-foreground">
                    {pricing?.maxGens === null ? "∞" : pricing?.maxGens ?? "Variable"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">max/mois</p>
                </div>
              </div>
            </div>

            {/* Package Generators */}
            {packageInfo && packageInfo.generators.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  GÉNÉRATEURS INCLUS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {packageInfo.generators.map((gen, idx) => (
                    <Badge key={idx} className="font-display bg-white/10 text-white/90 px-3 py-1">
                      {gen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {model.features && model.features.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  CARACTÉRISTIQUES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {model.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="font-display">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {model.badges && model.badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {model.badges.map((badge, idx) => (
                  <Badge 
                    key={idx} 
                    className={cn(
                      "font-display text-xs",
                      badge === "FREE" || badge.includes("GRATUIT") 
                        ? "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]"
                        : badge === "PREMIUM" 
                          ? "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)]"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Links */}
            <div>
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                LIENS UTILES
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="btn-3d gap-2" asChild>
                  <a href={model.officialUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Site Officiel
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="btn-3d gap-2" asChild>
                  <a href={model.docsUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4" />
                    Documentation
                  </a>
                </Button>
                {config && (
                  <Button variant="outline" size="sm" className="btn-3d gap-2" asChild>
                    <a href={config.apiUrl} target="_blank" rel="noopener noreferrer">
                      <Key className="h-4 w-4" />
                      Obtenir Clé API
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Adult Warning */}
            {isAdult && (
              <div className="rounded-lg bg-[hsl(0,85%,60%)]/10 p-4 border border-[hsl(0,85%,60%)]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-[hsl(0,100%,50%)] bg-[hsl(0,100%,50%)]/20 flex items-center justify-center">
                    <span className="font-display text-lg font-black text-[hsl(0,100%,50%)]">-18</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(0,85%,60%)]">
                      Contenu pour Adultes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ce service peut générer du contenu explicite. Réservé aux 18+.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 pt-0 border-t border-border/50 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 btn-3d">
            Fermer
          </Button>
          {!isActive && model.apiKeyName && (
            <Button 
              className="flex-1 btn-3d-orange gap-2"
              onClick={() => onOpenAPIKeyModal?.(model.apiKeyName!)}
            >
              <Key className="h-4 w-4" />
              Configurer API
            </Button>
          )}
          <Button className="flex-1 btn-3d-cyan gap-2" asChild>
            <a href={model.officialUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Ouvrir
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
