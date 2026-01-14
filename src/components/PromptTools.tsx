import { useState } from "react";
import { Braces, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PromptToolsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  className?: string;
}

export function PromptTools({ prompt, onPromptChange, className }: PromptToolsProps) {
  const [showJsonOutput, setShowJsonOutput] = useState(false);
  const [jsonOutput, setJsonOutput] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Convertir le prompt en format JSON
  const convertToJson = () => {
    const jsonData = {
      prompt: prompt,
      timestamp: new Date().toISOString(),
      tokens_estimated: Math.ceil(prompt.length / 4),
      metadata: {
        language: "fr",
        type: "generation_prompt"
      }
    };
    
    setJsonOutput(JSON.stringify(jsonData, null, 2));
    setShowJsonOutput(true);
    toast.success("Prompt converti en JSON");
  };

  // Simuler l'optimisation IA du prompt
  const optimizeWithAI = async () => {
    if (!prompt.trim()) {
      toast.error("Entrez d'abord un prompt");
      return;
    }

    setIsOptimizing(true);
    
    // Simulation d'optimisation (remplacer par appel API réel)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Améliorations automatiques
    const enhancements = [
      "ultra haute résolution",
      "éclairage cinématique",
      "détails ultra fins",
      "qualité professionnelle"
    ];

    const hasEnhancements = enhancements.some(e => 
      prompt.toLowerCase().includes(e.toLowerCase())
    );

    if (!hasEnhancements) {
      const randomEnhancements = enhancements
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .join(", ");
      
      const optimizedPrompt = `${prompt}, ${randomEnhancements}`;
      onPromptChange(optimizedPrompt);
      toast.success("Prompt optimisé avec IA ✨");
    } else {
      toast.info("Le prompt est déjà optimisé");
    }

    setIsOptimizing(false);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonOutput);
    toast.success("JSON copié !");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs btn-3d"
                onClick={convertToJson}
              >
                <Braces className="h-3 w-3" />
                JSON
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Convertir en JSON</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1 text-xs",
                  isOptimizing ? "" : "btn-3d-purple"
                )}
                onClick={optimizeWithAI}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Optimisation...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Optimiser IA
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Améliorer le prompt avec l'IA</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* JSON Output Panel */}
      {showJsonOutput && (
        <Card className="panel-3d p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Braces className="h-4 w-4 text-[hsl(45,100%,55%)]" />
              <span className="font-display text-xs font-bold">FORMAT JSON</span>
            </div>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 text-xs"
                onClick={copyJson}
              >
                Copier
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 text-xs"
                onClick={() => setShowJsonOutput(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
          <pre className="text-xs bg-black/50 rounded p-2 overflow-auto max-h-32 text-green-400 font-mono">
            {jsonOutput}
          </pre>
        </Card>
      )}
    </div>
  );
}
