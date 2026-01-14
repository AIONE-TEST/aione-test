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
  onRefresh?: () => void;
  defaultModelId?: string;
}

export function ModelSelector({
  models,
  selectedModel,
  onSelectModel,
  category,
  className,
  onRefresh,
  defaultModelId,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auto-select default model on first render
  useMemo(() => {
    if (!hasInitialized && !selectedModel && models.length > 0) {
      // Try to find specified default model or first available free/active model
      let defaultModel: AIModel | undefined;
      
      if (defaultModelId) {
        defaultModel = models.find(m => m.id === defaultModelId);
      }
      
      if (!defaultModel) {
        // Prioritize free models, then active models
        defaultModel = models.find(m => m.isFree || m.apiStatus === "free") 
          || models.find(m => m.apiStatus === "active")
          || models[0];
      }
      
      if (defaultModel) {
        onSelectModel(defaultModel);
        setHasInitialized(true);
      }
    }
  }, [models, selectedModel, defaultModelId, hasInitialized, onSelectModel]);

  // Group models by status - activated and free models FIRST
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

  const handleAPIKeySuccess = () => {
    // Rafraîchir la liste des modèles
    onRefresh?.();
  };

  const getStatusIcon = (model: AIModel) => {
    if (model.isFree || model.apiStatus === "free") {
      return <Zap className="h-4 w-4 text-[hsl(142,76%,50%)]" />;
    }
    if (model.apiStatus === "active") {
      return <Check className="h-4 w-4 text-[hsl(174,100%,50%)]" />;
    }
    return <X className="h-4 w-4 text-muted-foreground" />;
  };

  const ModelItem = ({ model }: { model: AIModel }) => {
    const logoUrl = getModelLogo(model.id, model.provider);
    const isInactive = !model.isFree && model.apiStatus === "inactive";
    const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
          "hover:bg-muted/50",
          selectedModel?.id === model.id && "bg-muted/70 border border-[hsl(174,100%,50%)]/30 glow-cyan",
          isInactive && "opacity-60 grayscale"
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
          <div className="h-9 w-9 rounded-lg bg-muted/50 border border-border/50 overflow-hidden shrink-0">
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
              <span className="font-display font-bold text-sm truncate tracking-wider">{model.name}</span>
              {model.isFree && (
                <Badge className="h-5 px-1.5 text-[10px] bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-0 font-display">
                  FREE
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-display">
              <span>{model.provider}</span>
              {model.price && !model.isFree && (
                <span className="text-[hsl(45,100%,55%)]">{model.price}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions for inactive models */}
        {isInactive && model.apiKeyName && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              className="h-7 px-2 btn-3d-orange text-[10px] font-display gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAPIKeyModal(model.apiKeyName!);
              }}
            >
              <Key className="h-3 w-3" />
              {model.isFree ? "AJOUTER" : "ACTIVER"}
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

        {/* Check mark for selected */}
        {selectedModel?.id === model.id && !isInactive && (
          <Check className="h-4 w-4 text-[hsl(174,100%,50%)] shrink-0" />
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
              "justify-between btn-3d h-14 text-base",
              className
            )}
          >
            {selectedModel ? (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/50 border border-border/50 overflow-hidden">
                  <img
                    src={getModelLogo(selectedModel.id, selectedModel.provider)}
                    alt={selectedModel.provider}
                    className="h-full w-full object-contain p-1"
                  />
                </div>
                <div className="text-left">
                  <div className="font-display font-bold text-sm tracking-wider">{selectedModel.name}</div>
                  <div className="text-xs text-muted-foreground font-display">{selectedModel.provider}</div>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground font-display tracking-wider">CHOISISSEZ VOTRE APPLI IA...</span>
            )}
            <ChevronDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[420px] p-0 panel-3d border-2 border-[hsl(var(--primary))]/30" align="start">
          {/* Search */}
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="RECHERCHER UN MODÈLE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 input-3d font-display tracking-wider"
              />
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-3">
              {/* Configured Models FIRST */}
              {groupedModels.configured.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-display font-bold text-[hsl(174,100%,50%)] tracking-wider">
                    <Check className="h-4 w-4" />
                    CONFIGURÉS - PRÊTS À L'EMPLOI
                    <Badge className="ml-auto bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)] font-display">
                      {groupedModels.configured.length}
                    </Badge>
                  </div>
                  {groupedModels.configured.map((model) => (
                    <ModelItem key={model.id} model={model} />
                  ))}
                </div>
              )}

              {/* Free & Active Models */}
              {groupedModels.freeActive.length > 0 && (
                <div>
                  {groupedModels.configured.length > 0 && <Separator className="my-2" />}
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-display font-bold text-[hsl(142,76%,50%)] tracking-wider">
                    <Zap className="h-4 w-4" />
                    GRATUITS
                    <Badge className="ml-auto bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] font-display">
                      {groupedModels.freeActive.length}
                    </Badge>
                  </div>
                  {groupedModels.freeActive.map((model) => (
                    <ModelItem key={model.id} model={model} />
                  ))}
                </div>
              )}

              {/* Inactive Models */}
              {groupedModels.inactive.length > 0 && (
                <div>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-display font-bold text-muted-foreground tracking-wider">
                    <X className="h-4 w-4" />
                    API NON CONFIGURÉES
                    <Badge className="ml-auto bg-muted text-muted-foreground font-display">
                      {groupedModels.inactive.length}
                    </Badge>
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
                  <div className="text-center py-8 text-muted-foreground font-display tracking-wider">
                    AUCUN MODÈLE TROUVÉ
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
        onSuccess={handleAPIKeySuccess}
      />
    </>
  );
}