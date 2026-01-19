import { useState } from "react";
import { X, Copy, Check, Wand2, Loader2, FileJson, FileText, Languages } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PromptHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
}

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
  { code: "ar", name: "العربية" },
  { code: "ru", name: "Русский" },
];

export function PromptHelperModal({ isOpen, onClose, originalPrompt }: PromptHelperModalProps) {
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outputFormat, setOutputFormat] = useState<"normal" | "json">("normal");
  const [selectedLanguage, setSelectedLanguage] = useState("fr");

  const handleOptimize = async () => {
    if (!originalPrompt.trim()) {
      toast({ title: "Erreur", description: "Le prompt original est vide", variant: "destructive" });
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            prompt: originalPrompt, 
            format: outputFormat,
            language: selectedLanguage 
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'optimisation");
      }

      const data = await response.json();
      setOptimizedPrompt(data.optimizedPrompt || data.content || "");
      toast({ title: "Succès", description: "Prompt optimisé avec succès!" });
    } catch (error) {
      console.error("Optimization error:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible d'optimiser le prompt. Vérifiez votre connexion.", 
        variant: "destructive" 
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimizedPrompt);
      setCopied(true);
      toast({ title: "Copié!", description: "Prompt copié dans le presse-papier" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de copier", variant: "destructive" });
    }
  };

  const handleClose = () => {
    setOptimizedPrompt("");
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl panel-3d border-[hsl(var(--primary))]/30">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <Wand2 className="h-5 w-5 text-[hsl(var(--primary))]" />
            AIDE AU PROMPT
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prompt original */}
          <div>
            <label className="font-display text-xs text-muted-foreground mb-1 block">PROMPT ORIGINAL</label>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm">
              {originalPrompt || <span className="text-muted-foreground italic">Aucun prompt</span>}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-4">
            {/* Format de sortie */}
            <div className="flex-1">
              <label className="font-display text-xs text-muted-foreground mb-1 block">FORMAT DE SORTIE</label>
              <div className="flex gap-2">
                <Button
                  variant={outputFormat === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOutputFormat("normal")}
                  className={outputFormat === "normal" ? "btn-3d-cyan" : "btn-3d"}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Normal
                </Button>
                <Button
                  variant={outputFormat === "json" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOutputFormat("json")}
                  className={outputFormat === "json" ? "btn-3d-orange" : "btn-3d"}
                >
                  <FileJson className="h-4 w-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>

            {/* Langue */}
            <div className="flex-1">
              <label className="font-display text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                <Languages className="h-3 w-3" />
                LANGUE
              </label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full input-3d">
                  <SelectValue placeholder="Choisir une langue" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bouton optimiser */}
          <Button 
            onClick={handleOptimize} 
            disabled={isOptimizing || !originalPrompt.trim()}
            className="w-full btn-3d-cyan gap-2"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimisation en cours...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Optimiser le Prompt
              </>
            )}
          </Button>

          {/* Résultat */}
          {optimizedPrompt && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-display text-xs text-muted-foreground">PROMPT OPTIMISÉ</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs gap-1 hover:text-[hsl(var(--primary))]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      Copié!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copier
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={optimizedPrompt}
                readOnly
                className="min-h-[120px] bg-[hsl(var(--primary))]/5 border-[hsl(var(--primary))]/30 text-sm font-mono"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
