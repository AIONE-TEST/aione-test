import { useState, useMemo } from "react";
import { ChevronDown, Check, Zap, X, ExternalLink, Key, Search } from "lucide-react";
import { AIModel, AICategory, apiConfigs } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { APIKeyModal } from "./APIKeyModal";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: AIModel | null;
  onSelectModel: (model: AIModel) => void;
  category: AICategory;
  className?: string;
}

export function ModelSelector({
  models,
  selectedModel,
  onSelectModel,
  category,
  className,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");

  // Group models by status
  const groupedModels = useMemo(() => {
    const filtered = models.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const freeActive = filtered.filter((m) => m.isFree || m.apiStatus === "free");
    const configured = filtered.filter(
      (m) => !m.isFree && m.apiStatus === "active"
    );
    const inactive = filtered.filter(
      (m) => !m.isFree && m.apiStatus === "inactive"
    );

    return { freeActive, configured, inactive };
  }, [models, searchQuery]);

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  const getStatusIcon = (model: AIModel) => {
    if (model.isFree || model.apiStatus === "free") {
      return <Zap className="h-3.5 w-3.5 text-[hsl(142,76%,50%)]" />;
    }
    if (model.apiStatus === "active") {
      return <Check className="h-3.5 w-3.5 text-[hsl(174,100%,50%)]" />;
    }
    return <X className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const ModelItem = ({ model }: { model: AIModel }) => {
    const logoUrl = getModelLogo(model.id, model.provider);
    const isInactive = !model.isFree && model.apiStatus === "inactive";
    const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
          "hover:bg-muted/50",
          selectedModel?.id === model.id && "bg-muted/70 border border-[hsl(174,100%,50%)]/30",
          isInactive && "opacity-70"
        )}
        onClick={() => {
          if (!isInactive) {
            onSelectModel(model);
            setIsOpen(false);
          }
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Status indicator */}
          <div className="shrink-0">{getStatusIcon(model)}</div>

          {/* Logo */}
          <div className="h-8 w-8 rounded-md bg-muted/50 border border-border/50 overflow-hidden shrink-0">
            <img
              src={logoUrl}
              alt={model.provider}
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{model.name}</span>
              {model.isFree && (
                <Badge className="h-4 px-1 text-[10px] bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-0">
                  FREE
                </Badge>
              )}
              {model.price && !model.isFree && (
                <span className="text-xs text-muted-foreground">{model.price}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{model.provider}</span>
              {model.badges.slice(0, 1).map((badge, i) => (
                <Badge key={i} variant="outline" className="h-4 px-1 text-[9px]">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Actions for inactive models */}
        {isInactive && model.apiKeyName && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[hsl(174,100%,50%)]"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAPIKeyModal(model.apiKeyName!);
              }}
              title="Ajouter clé API"
            >
              <Key className="h-3.5 w-3.5" />
            </Button>
            {config && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a href={config.apiUrl} target="_blank" rel="noopener noreferrer" title="Obtenir une clé">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "justify-between border-border/50 bg-muted/30 hover:bg-muted/50 h-12",
              className
            )}
          >
            {selectedModel ? (
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-md bg-muted/50 border border-border/50 overflow-hidden">
                  <img
                    src={getModelLogo(selectedModel.id, selectedModel.provider)}
                    alt={selectedModel.provider}
                    className="h-full w-full object-contain p-0.5"
                  />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{selectedModel.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedModel.provider}</div>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Sélectionner un modèle...</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[400px] p-0 bg-card border-border/50" align="start">
          {/* Search */}
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30"
              />
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-4">
              {/* Free & Active Models */}
              {groupedModels.freeActive.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[hsl(142,76%,50%)]">
                    <Zap className="h-3.5 w-3.5" />
                    GRATUITS & ACTIFS
                    <span className="text-muted-foreground">({groupedModels.freeActive.length})</span>
                  </div>
                  {groupedModels.freeActive.map((model) => (
                    <ModelItem key={model.id} model={model} />
                  ))}
                </div>
              )}

              {/* Configured Models */}
              {groupedModels.configured.length > 0 && (
                <div>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[hsl(174,100%,50%)]">
                    <Check className="h-3.5 w-3.5" />
                    CONFIGURÉS
                    <span className="text-muted-foreground">({groupedModels.configured.length})</span>
                  </div>
                  {groupedModels.configured.map((model) => (
                    <ModelItem key={model.id} model={model} />
                  ))}
                </div>
              )}

              {/* Inactive Models */}
              {groupedModels.inactive.length > 0 && (
                <div>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                    API NON CONFIGURÉES - Cliquez pour obtenir votre clé
                    <span className="text-muted-foreground">({groupedModels.inactive.length})</span>
                  </div>
                  {groupedModels.inactive.map((model) => (
                    <ModelItem key={model.id} model={model} />
                  ))}
                </div>
              )}

              {/* No results */}
              {groupedModels.freeActive.length === 0 &&
                groupedModels.configured.length === 0 &&
                groupedModels.inactive.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun modèle trouvé
                  </div>
                )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
      />
    </>
  );
}
