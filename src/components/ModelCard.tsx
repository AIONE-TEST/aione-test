import { useState } from "react";
import { ExternalLink, Star, Zap, Check, X } from "lucide-react";
import { AIModel } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ModelCardProps {
  model: AIModel;
  isFavorite?: boolean;
  onToggleFavorite?: (modelId: string) => void;
}

export function ModelCard({ model, isFavorite = false, onToggleFavorite }: ModelCardProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getModelLogo(model.id, model.provider);

  const getStatusBadge = (status: string, isFree: boolean) => {
    if (isFree || status === "free") {
      return (
        <Badge className="gap-1 bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30 hover:bg-[hsl(142,76%,50%)]/30">
          <Zap className="h-3 w-3" />
          🆓 FREE
        </Badge>
      );
    }
    if (status === "active") {
      return (
        <Badge className="gap-1 bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)] border-[hsl(174,100%,50%)]/30">
          <Check className="h-3 w-3" />
          Actif
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <X className="h-3 w-3" />
        Non configuré
      </Badge>
    );
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-[hsl(174,100%,50%)]/30 hover:bg-card/70">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-muted/50 border border-border/50">
              {!imageError ? (
                <img
                  src={logoUrl}
                  alt={model.provider}
                  className="h-full w-full object-contain p-2"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground font-display">
                  {model.provider.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-[hsl(174,100%,50%)] transition-colors">
                {model.name}
              </h3>
              <p className="text-xs text-muted-foreground">{model.provider}</p>
            </div>
          </div>
          
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(model.id);
              }}
            >
              <Star
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? "fill-[hsl(45,100%,55%)] text-[hsl(45,100%,55%)]" : "text-muted-foreground"
                }`}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {model.description}
        </p>

        {/* Status & Badges */}
        <div className="flex flex-wrap gap-1.5">
          {getStatusBadge(model.apiStatus, model.isFree)}
          
          {model.badges.slice(0, 2).map((badge, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-muted/50"
            >
              {badge}
            </Badge>
          ))}
        </div>

        {/* Features */}
        {model.features && model.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-border/50 hover:bg-muted/50 hover:border-[hsl(174,100%,50%)]/30"
            asChild
          >
            <a href={model.officialUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Site
            </a>
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[hsl(174,100%,50%)]/10 text-[hsl(174,100%,50%)] border border-[hsl(174,100%,50%)]/30 hover:bg-[hsl(174,100%,50%)]/20"
            asChild
          >
            <a href={model.docsUrl} target="_blank" rel="noopener noreferrer">
              Docs
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
