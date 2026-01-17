import { useState, useRef, useEffect } from "react";
import { 
  Wand2, ChevronDown, ChevronUp, Sparkles, Loader2, 
  Lightbulb, MinusCircle, Paperclip, HelpCircle, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Suggestions de prompts par catégorie
const promptSuggestions: Record<string, string[]> = {
  images: [
    "Ultra réaliste, éclairage cinématique",
    "Style artistique, aquarelle",
    "4K, détails ultra fins",
    "Ambiance cyberpunk néon",
    "Portrait professionnel studio"
  ],
  videos: [
    "Mouvement fluide, cinématographique",
    "Transition douce, slow motion",
    "Animation dynamique 60fps",
    "Plan séquence professionnel",
    "Effet parallaxe 3D"
  ],
  retouch: [
    "Améliorer la netteté",
    "Corriger les couleurs",
    "Supprimer l'arrière-plan",
    "Agrandir en 4K",
    "Style artistique"
  ],
  audio: [
    "Style orchestral épique",
    "Musique électronique ambient",
    "Voix naturelle expressive",
    "Effets sonores cinématiques"
  ],
  default: [
    "Haute qualité",
    "Ultra détaillé",
    "Style professionnel",
    "Éclairage naturel"
  ]
};

// Suggestions de prompts négatifs
const negativePromptSuggestions = [
  "flou, basse qualité",
  "déformé, mal proportionné",
  "texte illisible, watermark",
  "bruit, grain excessif",
  "mains déformées, doigts extra",
  "visage déformé, yeux asymétriques",
  "artefacts, pixelisé",
  "surexposé, sous-exposé"
];

interface PromptEditorEnhancedProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  negativePrompt?: string;
  onNegativePromptChange?: (value: string) => void;
  onGenerate: () => void;
  onCancel?: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
  hasCredits?: boolean;
  placeholder?: string;
  category?: string;
  className?: string;
  onFileUpload?: (file: File) => void;
}

export function PromptEditorEnhanced({
  prompt,
  onPromptChange,
  negativePrompt = "",
  onNegativePromptChange,
  onGenerate,
  onCancel,
  isGenerating = false,
  canGenerate = false,
  hasCredits = true,
  placeholder = "Décrivez votre création...",
  category = "default",
  className,
  onFileUpload,
}: PromptEditorEnhancedProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryPrompts = promptSuggestions[category] || promptSuggestions.default;

  useEffect(() => {
    // Update suggestions based on prompt content
    if (prompt.length > 3) {
      const matchingSuggestions = categoryPrompts.filter(s => 
        !prompt.toLowerCase().includes(s.toLowerCase())
      );
      setSuggestions(matchingSuggestions.slice(0, 4));
    } else {
      setSuggestions(categoryPrompts.slice(0, 4));
    }
  }, [prompt, category, categoryPrompts]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canGenerate && !isGenerating && hasCredits) {
      onGenerate();
    }
  };

  const addSuggestion = (suggestion: string) => {
    const newPrompt = prompt.trim() ? `${prompt}, ${suggestion}` : suggestion;
    onPromptChange(newPrompt);
  };

  const addNegativeSuggestion = (suggestion: string) => {
    if (onNegativePromptChange) {
      const newNegative = negativePrompt.trim() ? `${negativePrompt}, ${suggestion}` : suggestion;
      onNegativePromptChange(newNegative);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const buttonColorClass = canGenerate && hasCredits 
    ? "bg-[hsl(142,76%,50%)] hover:bg-[hsl(142,76%,45%)] text-black glow-green" 
    : "bg-[hsl(30,100%,50%)] hover:bg-[hsl(30,100%,45%)] text-black";

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main Prompt Area */}
      <div className="panel-3d p-3">
        <div className="flex gap-2 items-start">
          {/* Upload Button - AGRANDI x2 (Tâche icône trombone) */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 flex-shrink-0"
                  onClick={handleFileClick}
                >
                  <Paperclip className="h-8 w-8 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Importer un fichier</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {/* Textarea with spellcheck */}
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="input-3d min-h-[60px] text-sm resize-none flex-1"
            spellCheck={spellCheckEnabled}
            disabled={isGenerating}
          />
          
          {/* Generate Button - Green if possible, Orange otherwise */}
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating || !hasCredits}
            className={cn("h-10 gap-2 font-display tracking-wider", buttonColorClass)}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">GÉNÉRER</span>
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Prompt Optimizer Button (Tâche: remplacer SpellCheck) */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 btn-3d-purple"
                  onClick={() => {
                    // TODO: Implémenter l'optimisation AI du prompt
                    console.log("Prompt Optimizer clicked");
                  }}
                >
                  <Zap className="h-3 w-3" />
                  Prompt Optimizer
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Optimise ton prompt avec l'IA pour des résultats professionnels (master-prompt, format JSON adapté au modèle)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Suggestions Toggle */}
          <Button
            variant={showSuggestions ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 px-2 text-xs gap-1",
              showSuggestions ? "btn-3d-pink" : ""
            )}
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Lightbulb className="h-3 w-3" />
            Suggestions
          </Button>

          {/* Negative Prompt Toggle */}
          <Button
            variant={showNegativePrompt ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 px-2 text-xs gap-1",
              showNegativePrompt ? "btn-3d-orange" : ""
            )}
            onClick={() => setShowNegativePrompt(!showNegativePrompt)}
          >
            <MinusCircle className="h-3 w-3" />
            Négatif
          </Button>

          {/* Help Toggle */}
          <Button
            variant={showHelp ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-7 px-2 text-xs gap-1",
              showHelp ? "btn-3d-green" : ""
            )}
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle className="h-3 w-3" />
            Aide
          </Button>

          {/* Cancel if generating */}
          {isGenerating && onCancel && (
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onCancel}>
              Annuler
            </Button>
          )}

          {/* Credit warning */}
          {!hasCredits && (
            <Badge className="bg-[hsl(0,100%,60%)]/20 text-[hsl(0,100%,60%)] text-xs">
              Crédits insuffisants
            </Badge>
          )}
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && (
        <div className="panel-3d p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-[hsl(45,100%,55%)]" />
            <span className="font-display text-xs font-bold">SUGGESTIONS DE PROMPT</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <Badge
                key={idx}
                className="cursor-pointer bg-white/10 hover:bg-[hsl(var(--primary))]/20 transition-colors"
                onClick={() => addSuggestion(suggestion)}
              >
                + {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Negative Prompt Panel */}
      {showNegativePrompt && onNegativePromptChange && (
        <div className="panel-3d p-3 border-[hsl(0,100%,50%)]/30">
          <div className="flex items-center gap-2 mb-2">
            <MinusCircle className="h-4 w-4 text-[hsl(0,100%,60%)]" />
            <span className="font-display text-xs font-bold text-[hsl(0,100%,60%)]">
              PROMPT NÉGATIF (à éviter)
            </span>
          </div>
          <Textarea
            value={negativePrompt}
            onChange={(e) => onNegativePromptChange(e.target.value)}
            placeholder="Ex: flou, basse qualité, déformé..."
            className="input-3d min-h-[40px] text-sm resize-none mb-2"
            spellCheck={spellCheckEnabled}
          />
          <div className="flex flex-wrap gap-1">
            {negativePromptSuggestions.slice(0, 6).map((suggestion, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer text-[10px] border-[hsl(0,100%,50%)]/30 hover:bg-[hsl(0,100%,50%)]/10"
                onClick={() => addNegativeSuggestion(suggestion)}
              >
                + {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="panel-3d p-3 border-[hsl(142,76%,50%)]/30">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-[hsl(142,76%,50%)]" />
            <span className="font-display text-xs font-bold text-[hsl(142,76%,50%)]">
              AIDE AU PROMPT
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-2">
            <p><strong>Structure recommandée:</strong> [Sujet principal], [Style/Ambiance], [Détails techniques]</p>
            <p><strong>Exemple:</strong> "Portrait d'une femme élégante, style renaissance, éclairage dramatique, 4K"</p>
            <p><strong>Conseils:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Soyez précis dans vos descriptions</li>
              <li>Ajoutez des détails sur l'éclairage et l'ambiance</li>
              <li>Précisez la qualité souhaitée (4K, HD, etc.)</li>
              <li>Utilisez le prompt négatif pour éviter les défauts</li>
            </ul>
            <p className="text-[hsl(var(--primary))]">
              <strong>Raccourci:</strong> Ctrl/Cmd + Entrée pour générer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
