import { useState, useMemo } from "react";
import { ChevronDown, Check, Zap, X, ExternalLink, Key, Search, Image, Video, Music, Wand2, Type, AlertCircle } from "lucide-react";
import { AIModel, AICategory, apiConfigs } from "@/data/aiModels";
import { getModelLogo } from "@/data/modelLogos";
import { getModelCapabilities, ModelCapabilities } from "@/data/modelCapabilities";
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

// Mode icons
const modeIcons: Record<string, React.ReactNode> = {
  "text-to-image": <><Type className="h-3 w-3" /><span>→</span><Image className="h-3 w-3" /></>,
  "image-to-image": <><Image className="h-3 w-3" /><span>→</span><Image className="h-3 w-3" /></>,
  "text-to-video": <><Type className="h-3 w-3" /><span>→</span><Video className="h-3 w-3" /></>,
  "image-to-video": <><Image className="h-3 w-3" /><span>→</span><Video className="h-3 w-3" /></>,
  "text-to-audio": <><Type className="h-3 w-3" /><span>→</span><Music className="h-3 w-3" /></>,
  "inpainting": <Wand2 className="h-3 w-3" />,
  "outpainting": <Wand2 className="h-3 w-3" />,
  "upscale": <Wand2 className="h-3 w-3" />,
};

// Format icons for aspect ratios
const formatIcons: Record<string, string> = {
  "1:1": "⬜",
  "4:3": "📺",
  "3:4": "📱",
  "16:9": "🖥️",
  "9:16": "📲",
  "21:9": "🎬",
};

interface AIModelSelectorProps {
  models: AIModel[];
  selectedModel: AIModel | null;
  onSelectModel: (model: AIModel) => void;
  category: AICategory;
  className?: string;
  onRefresh?: () => void;
  defaultModelId?: string;
  showCapabilities?: boolean;
}

export function AIModelSelector({
  models,
  selectedModel,
  onSelectModel,
  category,
  className,
  onRefresh,
  defaultModelId,
  showCapabilities = true,
}: AIModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auto-select default model on first render
  useMemo(() => {
    if (!hasInitialized && !selectedModel && models.length > 0) {
      let defaultModel: AIModel | undefined;
      
      if (defaultModelId) {
        defaultModel = models.find(m => m.id === defaultModelId);
      }
      
      if (!defaultModel) {
        // Prioritize best models first (those with most capabilities)
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

  // Get capabilities for selected model
  const selectedCapabilities = selectedModel ? getModelCapabilities(selectedModel.id) : null;

  const ModelItem = ({ model }: { model: AIModel }) => {
    const logoUrl = getModelLogo(model.id, model.provider);
    const isInactive = !model.isFree && model.apiStatus === "inactive";
    const config = model.apiKeyName ? apiConfigs[model.apiKeyName] : null;
    const capabilities = getModelCapabilities(model.id);

    return (
      <div
        className={cn(
          "flex flex-col gap-2 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200",
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Status indicator */}
            <div className="shrink-0">{getStatusIcon(model)}</div>

            {/* Logo */}
            <div className="h-10 w-10 rounded-lg bg-muted/50 border border-border/50 overflow-hidden shrink-0">
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
                <span className="font-display font-bold text-base truncate tracking-wider">{model.name}</span>
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
            <Button
              size="sm"
              className="h-7 px-2 btn-3d-orange text-[10px] font-display gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAPIKeyModal(model.apiKeyName!);
              }}
            >
              <Key className="h-3 w-3" />
              ACTIVER
            </Button>
          )}

          {selectedModel?.id === model.id && !isInactive && (
            <Check className="h-4 w-4 text-[hsl(174,100%,50%)] shrink-0" />
          )}
        </div>

        {/* Capabilities row */}
        {showCapabilities && (
          <div className="flex flex-wrap gap-1 ml-12">
            {/* Modes */}
            {capabilities.supportedModes.map((mode) => (
              <Badge 
                key={mode}
                variant="outline" 
                className="text-[9px] px-1.5 py-0 h-5 gap-1 bg-[hsl(280,100%,65%)]/10 text-[hsl(280,100%,65%)] border-[hsl(280,100%,65%)]/30"
              >
                {modeIcons[mode] || mode}
              </Badge>
            ))}
            {/* Formats */}
            {capabilities.supportedAspectRatios.slice(0, 4).map((ratio) => (
              <Badge 
                key={ratio}
                variant="outline" 
                className="text-[9px] px-1.5 py-0 h-5 bg-[hsl(320,100%,60%)]/10 text-[hsl(320,100%,60%)] border-[hsl(320,100%,60%)]/30"
              >
                {formatIcons[ratio] || ratio}
              </Badge>
            ))}
            {/* Quota */}
            {capabilities.freeQuota !== undefined && (
              <Badge 
                variant="outline" 
                className="text-[9px] px-1.5 py-0 h-5 bg-[hsl(142,76%,50%)]/10 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30"
              >
                {capabilities.freeQuota} restants
              </Badge>
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
              "justify-between btn-3d h-auto min-h-[60px] text-base flex-col items-start p-3",
              className
            )}
          >
            {selectedModel ? (
              <div className="w-full">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-10 w-10 rounded-lg bg-muted/50 border border-border/50 overflow-hidden shrink-0">
                    <img
                      src={getModelLogo(selectedModel.id, selectedModel.provider)}
                      alt={selectedModel.provider}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-display font-bold text-base tracking-wider">{selectedModel.name}</div>
                    <div className="text-xs text-muted-foreground font-display">{selectedModel.provider}</div>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 opacity-50" />
                </div>
                
                {/* Selected model capabilities */}
                {showCapabilities && selectedCapabilities && (
                  <div className="flex flex-wrap gap-1 mt-2 w-full">
                    {selectedCapabilities.supportedModes.map((mode) => (
                      <Badge 
                        key={mode}
                        className="text-[9px] px-1.5 py-0 h-5 gap-1 bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)]"
                      >
                        {modeIcons[mode] || mode}
                      </Badge>
                    ))}
                    <Badge className="text-[9px] px-1.5 py-0 h-5 bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]">
                      {selectedCapabilities.freeQuota ?? 0} crédits
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-muted-foreground font-display tracking-wider">MODÈLE AI...</span>
                <ChevronDown className="h-5 w-5 shrink-0 opacity-50" />
              </div>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[480px] p-0 panel-3d border-2 border-[hsl(var(--primary))]/30" align="start">
          {/* Header */}
          <div className="p-3 border-b border-border/50 bg-muted/30">
            <div className="font-display text-sm font-bold text-center mb-2 tracking-wider">MODÈLES AI</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="RECHERCHER..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 input-3d font-display tracking-wider"
              />
            </div>
          </div>

          <ScrollArea className="h-[450px]">
            <div className="p-2 space-y-2">
              {/* Configured Models FIRST */}
              {groupedModels.configured.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-display font-bold text-[hsl(174,100%,50%)] tracking-wider">
                    <Check className="h-4 w-4" />
                    CONFIGURÉS
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
                    <AlertCircle className="h-4 w-4" />
                    NON CONFIGURÉS
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
