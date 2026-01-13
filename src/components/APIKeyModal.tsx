import { useState } from "react";
import { ExternalLink, Key, Check, Copy, AlertCircle } from "lucide-react";
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

export function APIKeyModal({ isOpen, onClose, apiKeyName, onSuccess }: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const config: APIConfig = apiConfigs[apiKeyName] || {
    serviceName: apiKeyName,
    officialUrl: "#",
    apiUrl: "#",
    docsUrl: "#",
    apiKeyPlaceholder: "Votre clé API...",
    instructions: "Entrez votre clé API pour activer ce service.",
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
    try {
      // Check if key already exists
      const { data: existingKey } = await supabase
        .from("api_keys")
        .select("id")
        .eq("service_name", apiKeyName)
        .single();

      if (existingKey) {
        // Update existing
        await supabase
          .from("api_keys")
          .update({ is_configured: true, updated_at: new Date().toISOString() })
          .eq("service_name", apiKeyName);
      } else {
        // Insert new
        await supabase.from("api_keys").insert({
          service_name: apiKeyName,
          is_configured: true,
        });
      }

      toast({
        title: "✅ Clé API activée",
        description: `${config.serviceName} est maintenant configuré et prêt à l'emploi.`,
      });

      setApiKey("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la clé API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Key className="h-5 w-5 text-[hsl(var(--primary))]" />
            Configurer {config.serviceName}
          </DialogTitle>
          <DialogDescription>
            Ajoutez votre clé API pour activer ce modèle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
              asChild
            >
              <a href={config.apiUrl} target="_blank" rel="noopener noreferrer">
                <Key className="h-4 w-4" />
                Obtenir une clé API
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
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
              className="gap-2"
              asChild
            >
              <a href={config.officialUrl} target="_blank" rel="noopener noreferrer">
                Site officiel
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-[hsl(var(--neon-yellow))] mt-0.5" />
              <span className="text-sm font-medium">Instructions</span>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
              {config.instructions}
            </pre>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              Clé API
              <span className="text-xs text-muted-foreground">
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
                className="pr-10 font-mono text-sm"
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
            className="w-full gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
          >
            {isLoading ? (
              "Activation..."
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
