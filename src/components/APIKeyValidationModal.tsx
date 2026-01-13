import { useState } from "react";
import { ExternalLink, Key, Check, Copy, AlertCircle, CheckCircle, XCircle, Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APIConfig, apiConfigs } from "@/data/aiModels";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface APIKeyValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyName: string;
  onSuccess?: () => void;
}

type ValidationState = "idle" | "validating" | "success" | "error";

export function APIKeyValidationModal({ isOpen, onClose, apiKeyName, onSuccess }: APIKeyValidationModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [validationMessage, setValidationMessage] = useState("");
  const { toast } = useToast();

  const config: APIConfig = apiConfigs[apiKeyName] || {
    serviceName: apiKeyName,
    officialUrl: "#",
    apiUrl: "#",
    docsUrl: "#",
    apiKeyPlaceholder: "Votre clé API...",
    instructions: "Entrez votre clé API pour activer ce service.",
  };

  // Validation de la clé API (simulation basique)
  const validateAPIKey = async (key: string, service: string): Promise<{ valid: boolean; message: string }> => {
    // Validation basique du format selon le service
    const validations: Record<string, { pattern: RegExp; message: string }> = {
      openai: { pattern: /^sk-[a-zA-Z0-9-_]{20,}$/, message: "Format: sk-..." },
      anthropic: { pattern: /^sk-ant-[a-zA-Z0-9-_]{20,}$/, message: "Format: sk-ant-..." },
      openrouter: { pattern: /^sk-or-[a-zA-Z0-9-_]{20,}$/, message: "Format: sk-or-..." },
      replicate: { pattern: /^r8_[a-zA-Z0-9]{20,}$/, message: "Format: r8_..." },
      stability: { pattern: /^sk-[a-zA-Z0-9]{20,}$/, message: "Format: sk-..." },
      elevenlabs: { pattern: /^[a-zA-Z0-9]{20,}$/, message: "Clé alphanumérique" },
      groq: { pattern: /^gsk_[a-zA-Z0-9]{20,}$/, message: "Format: gsk_..." },
      google: { pattern: /^AIza[a-zA-Z0-9-_]{30,}$/, message: "Format: AIza..." },
      mistral: { pattern: /^[a-zA-Z0-9]{20,}$/, message: "Clé alphanumérique" },
      xai: { pattern: /^xai-[a-zA-Z0-9]{20,}$/, message: "Format: xai-..." },
      runway: { pattern: /^key_[a-zA-Z0-9]{20,}$/, message: "Format: key_..." },
      huggingface: { pattern: /^hf_[a-zA-Z0-9]{20,}$/, message: "Format: hf_..." },
      fireworks: { pattern: /^fw_[a-zA-Z0-9]{20,}$/, message: "Format: fw_..." },
    };

    const validation = validations[service.toLowerCase()];
    
    if (key.length < 10) {
      return { valid: false, message: "La clé est trop courte" };
    }

    if (validation && !validation.pattern.test(key)) {
      return { valid: false, message: `Format invalide. ${validation.message}` };
    }

    // Simulation d'une vérification API (dans un vrai cas, on ferait un appel test)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { valid: true, message: "Clé API validée avec succès!" };
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une clé API valide.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setValidationState("validating");
    
    try {
      // Validation de la clé
      const validation = await validateAPIKey(apiKey, apiKeyName);
      
      if (!validation.valid) {
        setValidationState("error");
        setValidationMessage(validation.message);
        return;
      }

      // Check if key already exists
      const { data: existingKey } = await supabase
        .from("api_keys")
        .select("id")
        .eq("service_name", apiKeyName)
        .single();

      if (existingKey) {
        await supabase
          .from("api_keys")
          .update({ is_configured: true, updated_at: new Date().toISOString() })
          .eq("service_name", apiKeyName);
      } else {
        await supabase.from("api_keys").insert({
          service_name: apiKeyName,
          is_configured: true,
        });
      }

      setValidationState("success");
      setValidationMessage("Clé API activée avec succès!");

    } catch (error) {
      console.error("Error saving API key:", error);
      setValidationState("error");
      setValidationMessage("Erreur lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationClose = () => {
    if (validationState === "success") {
      onSuccess?.();
    }
    setValidationState("idle");
    setValidationMessage("");
    setApiKey("");
    onClose();
  };

  // Affichage du résultat de validation
  if (validationState === "success" || validationState === "error") {
    return (
      <Dialog open={isOpen} onOpenChange={handleValidationClose}>
        <DialogContent className="sm:max-w-md panel-3d border-2 border-[hsl(var(--primary))]/30">
          <div className="flex flex-col items-center justify-center py-8 gap-6">
            {validationState === "success" ? (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(142,76%,50%)]/20 glow-green">
                  <CheckCircle className="h-12 w-12 text-[hsl(142,76%,50%)]" />
                </div>
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-[hsl(142,76%,50%)] text-glow-green mb-2">
                    SUCCÈS!
                  </h2>
                  <p className="text-[hsl(142,76%,50%)]">{validationMessage}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {config.serviceName} est maintenant activé
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(0,85%,60%)]/20 glow-red">
                  <XCircle className="h-12 w-12 text-[hsl(0,85%,60%)]" />
                </div>
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-[hsl(0,85%,60%)] mb-2">
                    ERREUR
                  </h2>
                  <p className="text-[hsl(0,85%,60%)]">{validationMessage}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Veuillez vérifier votre clé API
                  </p>
                </div>
              </>
            )}
            <Button
              onClick={handleValidationClose}
              className="btn-3d-cyan font-display text-sm px-8"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleValidationClose()}>
      <DialogContent className="sm:max-w-lg panel-3d border-2 border-[hsl(var(--primary))]/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl gradient-text-cyan">
            <Key className="h-5 w-5 text-[hsl(174,100%,50%)]" />
            Configurer {config.serviceName}
          </DialogTitle>
          <DialogDescription>
            Ajoutez votre clé API pour activer ce service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 btn-3d-cyan text-xs"
              asChild
            >
              <a href={config.apiUrl} target="_blank" rel="noopener noreferrer">
                <Key className="h-3.5 w-3.5" />
                Obtenir une clé
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 btn-3d text-xs"
              asChild
            >
              <a href={config.docsUrl} target="_blank" rel="noopener noreferrer">
                Documentation
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 btn-3d text-xs"
              asChild
            >
              <a href={config.officialUrl} target="_blank" rel="noopener noreferrer">
                Site officiel
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-[hsl(220,15%,15%)] p-4 border border-[hsl(45,100%,55%)]/30">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-[hsl(45,100%,55%)] mt-0.5" />
              <span className="text-sm font-display font-medium text-[hsl(45,100%,55%)]">Instructions</span>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
              {config.instructions}
            </pre>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2 font-display text-sm">
              Clé API
              <span className="text-xs text-muted-foreground font-mono">
                ({config.apiKeyPlaceholder})
              </span>
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                placeholder={config.apiKeyPlaceholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-3d pr-10 font-mono text-sm"
              />
              {apiKey && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!apiKey.trim() || isLoading}
            className="w-full gap-2 btn-3d-green font-display"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Validation en cours...
              </span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Activer {config.serviceName}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
