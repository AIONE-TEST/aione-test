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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "active":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "free":
        return <Zap className="h-3 w-3" />;
      case "active":
        return <Check className="h-3 w-3" />;
      case "inactive":
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "free":
        return "Gratuit";
      case "active":
        return "Actif";
      case "inactive":
        return "Non configuré";
      default:
        return status;
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
              {!imageError ? (
                <img
                  src={logoUrl}
                  alt={model.provider}
                  className="h-full w-full object-contain p-1"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                  {model.provider.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{model.name}</h3>
              <p className="text-xs text-muted-foreground">{model.provider}</p>
            </div>
          </div>
          
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onToggleFavorite(model.id)}
            >
              <Star
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
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

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className={`text-xs ${getStatusColor(model.apiStatus)}`}
          >
            {getStatusIcon(model.apiStatus)}
            <span className="ml-1">{getStatusLabel(model.apiStatus)}</span>
          </Badge>
          
          {model.badges.slice(0, 2).map((badge, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs"
            >
              {badge}
            </Badge>
          ))}
          
          {model.price && (
            <Badge variant="outline" className="text-xs">
              {model.price}
            </Badge>
          )}
        </div>

        {/* Features */}
        {model.features && model.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
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
            className="flex-1"
            asChild
          >
            <a href={model.officialUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Site officiel
            </a>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            asChild
          >
            <a href={model.docsUrl} target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
