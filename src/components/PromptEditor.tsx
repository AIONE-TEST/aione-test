import { useState } from "react";
import { Wand2, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onCancel?: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptEditor({
  prompt,
  onPromptChange,
  onGenerate,
  onCancel,
  isGenerating = false,
  canGenerate = false,
  placeholder = "Ex: Un dragon mécanique survolant une ville steampunk au coucher du soleil, mouvement fluide et cinématographique",
  className,
}: PromptEditorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canGenerate && !isGenerating) {
      onGenerate();
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="font-medium text-sm">Éditeur de Prompt</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Textarea */}
            <Textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[100px] bg-muted/30 border-border/50 resize-none focus:border-[hsl(var(--primary))]/50"
              disabled={isGenerating}
            />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={onGenerate}
                  disabled={!canGenerate || isGenerating}
                  className={cn(
                    "gap-2",
                    canGenerate
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 glow-cyan"
                      : ""
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Générer
                    </>
                  )}
                </Button>

                {isGenerating && onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    Annuler
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-[hsl(var(--primary))]">✓</span>
                Entrez un prompt pour activer la génération
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
