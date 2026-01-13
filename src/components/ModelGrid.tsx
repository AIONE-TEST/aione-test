import { useState } from "react";
import { AIModel, AICategory, apiConfigs } from "@/data/aiModels";
import { ModelCard } from "./ModelCard";
import { APIKeyModal } from "./APIKeyModal";
import { Button } from "@/components/ui/button";
import { Key, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getModelLogo } from "@/data/modelLogos";

interface ModelGridProps {
  models: AIModel[];
  category: AICategory;
  favorites?: string[];
  onToggleFavorite?: (modelId: string) => void;
  onSelectModel?: (model: AIModel) => void;
}

export function ModelGrid({
  models,
  category,
  favorites = [],
  onToggleFavorite,
  onSelectModel,
}: ModelGridProps) {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {models.map((model) => (
          <ModelCardWithAPILink
            key={model.id}
            model={model}
            isFavorite={favorites.includes(model.id)}
            onToggleFavorite={onToggleFavorite}
            onSelectModel={onSelectModel}
            onOpenAPIKeyModal={handleOpenAPIKeyModal}
          />
        ))}
      </div>

      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
      />
    </>
  );
}

interface ModelCardWithAPILinkProps {
  model: AIModel;
  isFavorite: boolean;
  onToggleFavorite?: (modelId: string) => void;
  onSelectModel?: (model: AIModel) => void;
  onOpenAPIKeyModal: (apiKeyName: string) => void;
}

function ModelCardWithAPILink({
  model,
  isFavorite,
  onToggleFavorite,
  onSelectModel,
  onOpenAPIKeyModal,
}: ModelCardWithAPILinkProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getModelLogo(model.id, model.provider);
  const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;
  const isInactive = !model.isFree && model.apiStatus === "inactive";

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-[hsl(174,100%,50%)]/30 hover:bg-card/70 cursor-pointer"
      onClick={() => {
        if (!isInactive && onSelectModel) {
          onSelectModel(model);
        }
      }}
    >
      {/* Status Badge - Top Right */}
      <div className="absolute top-2 right-2 z-10">
        {model.isFree || model.apiStatus === "free" ? (
          <Badge className="bg-[hsl(142,76%,50%)]/90 text-white border-0 text-xs px-2">
            🆓 FREE
          </Badge>
        ) : model.apiStatus === "active" ? (
          <Badge className="bg-[hsl(174,100%,50%)]/90 text-white border-0 text-xs px-2">
            Actif
          </Badge>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col items-center text-center flex-1">
        {/* Logo */}
        <div className="h-14 w-14 rounded-xl bg-muted/50 border border-border/50 overflow-hidden mb-3">
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

        {/* Name & Provider */}
        <h3 className="font-semibold text-sm text-foreground mb-0.5 line-clamp-1 group-hover:text-[hsl(174,100%,50%)] transition-colors">
          {model.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{model.provider}</p>

        {/* Price */}
        {model.price && !model.isFree && (
          <p className="text-xs text-[hsl(var(--neon-yellow))]">{model.price}</p>
        )}
      </div>

      {/* API Key Button for inactive models */}
      {isInactive && model.apiKeyName && (
        <div className="p-2 border-t border-border/30 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs gap-1 text-[hsl(174,100%,50%)] hover:bg-[hsl(174,100%,50%)]/10"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAPIKeyModal(model.apiKeyName!);
            }}
          >
            <Key className="h-3 w-3" />
            Ajouter clé
          </Button>
          {config && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={config.apiUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
