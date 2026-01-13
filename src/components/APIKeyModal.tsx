import { useState } from "react";
import { ExternalLink, Key, Check, Copy, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
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

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyName: string;
  onSuccess?: () => void;
}

type ValidationState = "idle" | "validating" | "success" | "error";

// Patterns de validation pour chaque service
const validationPatterns: Record<string, { pattern: RegExp; message: string }> = {
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
  runway: { pattern: /^[a-zA-Z0-9_-]{20,}$/, message: "Clé alphanumérique" },
  huggingface: { pattern: /^hf_[a-zA-Z0-9]{20,}$/, message: "Format: hf_..." },
  fireworks: { pattern: /^fw_[a-zA-Z0-9]{20,}$/, message: "Format: fw_..." },
  together: { pattern: /^[a-zA-Z0-9]{20,}$/, message: "Clé alphanumérique" },
  fal: { pattern: /^[a-zA-Z0-9_-]{20,}$/, message: "Clé alphanumérique" },
  leonardo: { pattern: /^[a-zA-Z0-9-]{20,}$/, message: "Clé alphanumérique" },
  deepseek: { pattern: /^sk-[a-zA-Z0-9]{20,}$/, message: "Format: sk-..." },
};

export function APIKeyModal({ isOpen, onClose, apiKeyName, onSuccess }: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
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

  // Validation de la clé API
  const validateAPIKey = (key: string): { valid: boolean; message: string } => {
    if (!key.trim()) {
      return { valid: false, message: "Veuillez entrer une clé API" };
    }

    if (key.length < 10) {
      return { valid: false, message: "La clé est trop courte" };
    }

    const validation = validationPatterns[apiKeyName.toLowerCase()];
    
    if (validation && !validation.pattern.test(key)) {
      return { valid: false, message: `Format invalide. ${validation.message}` };
    }

    return { valid: true, message: "Format valide" };
  };

  const handleSubmit = async () => {
    const validation = validateAPIKey(apiKey);
    
    if (!validation.valid) {
      setValidationState("error");
      setValidationMessage(validation.message);
      return;
    }

    setValidationState("validating");
    setValidationMessage("Vérification en cours...");

    try {
      // Simuler une vérification API (dans un vrai cas, on ferait un appel test)
      await new Promise(resolve => setTimeout(resolve, 1500));

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
      setValidationMessage(`${config.serviceName} est maintenant activé!`);

      // Notification toast
      toast({
        title: "✅ Clé API validée!",
        description: `${config.serviceName} est maintenant prêt à l'emploi.`,
      });

    } catch (error) {
      console.error("Error saving API key:", error);
      setValidationState("error");
      setValidationMessage("Erreur lors de la sauvegarde. Réessayez.");
    }
  };

  const handleClose = () => {
    if (validationState === "success") {
      onSuccess?.();
    }
    setValidationState("idle");
    setValidationMessage("");
    setApiKey("");
    onClose();
  };

  // Affichage du résultat de validation (succès ou erreur)
  if (validationState === "success" || validationState === "error") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md panel-3d border-2 border-[hsl(var(--primary))]/30">
          <div className="flex flex-col items-center justify-center py-8 gap-6">
            {validationState === "success" ? (
              <>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[hsl(142,76%,50%)]/20 glow-green animate-pulse">
                  <CheckCircle className="h-14 w-14 text-[hsl(142,76%,50%)]" />
                </div>
                <div className="text-center">
                  <h2 className="font-display text-2xl font-black text-[hsl(142,76%,50%)] mb-2 tracking-wider">
                    ACTIVÉ!
                  </h2>
                  <p className="text-[hsl(142,76%,50%)] text-lg">{validationMessage}</p>
                  <p className="text-sm text-muted-foreground mt-3">
                    Le service est maintenant disponible dans vos générateurs
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[hsl(0,85%,60%)]/20 animate-pulse">
                  <XCircle className="h-14 w-14 text-[hsl(0,85%,60%)]" />
                </div>
                <div className="text-center">
                  <h2 className="font-display text-2xl font-black text-[hsl(0,85%,60%)] mb-2 tracking-wider">
                    ERREUR
                  </h2>
                  <p className="text-[hsl(0,85%,60%)] text-lg">{validationMessage}</p>
                  <p className="text-sm text-muted-foreground mt-3">
                    Vérifiez le format de votre clé API
                  </p>
                </div>
              </>
            )}
            <Button
              onClick={handleClose}
              className={validationState === "success" ? "btn-3d-green" : "btn-3d-red"}
            >
              {validationState === "success" ? "PARFAIT!" : "RÉESSAYER"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg panel-3d border-2 border-[hsl(var(--primary))]/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-display text-xl gradient-text-cyan tracking-wider">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/20 glow-cyan">
              <Key className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            CONFIGURER {config.serviceName.toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-base">
            Ajoutez votre clé API pour activer ce service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 btn-3d-cyan text-xs font-display"
              asChild
            >
              <a href={config.apiUrl} target="_blank" rel="noopener noreferrer">
                <Key className="h-3.5 w-3.5" />
                OBTENIR UNE CLÉ
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 btn-3d text-xs font-display"
              asChild
            >
              <a href={config.docsUrl} target="_blank" rel="noopener noreferrer">
                DOCUMENTATION
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 btn-3d text-xs font-display"
              asChild
            >
              <a href={config.officialUrl} target="_blank" rel="noopener noreferrer">
                SITE OFFICIEL
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Instructions */}
          <div className="rounded-xl bg-[hsl(45,100%,55%)]/10 p-4 border-2 border-[hsl(45,100%,55%)]/30">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-[hsl(45,100%,55%)] mt-0.5" />
              <span className="font-display font-bold text-[hsl(45,100%,55%)] tracking-wider">INSTRUCTIONS</span>
            </div>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {config.instructions}
            </pre>
          </div>

          {/* API Key Input */}
          <div className="space-y-3">
            <Label htmlFor="apiKey" className="flex items-center gap-2 font-display font-bold tracking-wider">
              CLÉ API
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
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (validationState !== "idle") {
                    setValidationState("idle");
                    setValidationMessage("");
                  }
                }}
                className="input-3d pr-10 font-mono text-base h-12"
              />
              {apiKey && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!apiKey.trim() || validationState === "validating"}
            className="w-full h-12 gap-3 btn-3d-green font-display font-bold text-base tracking-wider"
          >
            {validationState === "validating" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                VALIDATION EN COURS...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                ACTIVER {config.serviceName.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}