import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  canGenerate: boolean;
  hasCredits: boolean;
  label?: string;
  className?: string;
}

export function GenerateButton({
  onClick,
  disabled = false,
  isGenerating = false,
  canGenerate,
  hasCredits,
  label = "GÉNÉRER",
  className
}: GenerateButtonProps) {
  // Green if can generate and has credits, orange otherwise
  const isActive = canGenerate && hasCredits && !disabled;

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isGenerating || !canGenerate || !hasCredits}
      className={cn(
        "font-display font-bold text-base px-6 py-4 transition-all duration-300",
        isActive 
          ? "bg-[hsl(142,76%,50%)] hover:bg-[hsl(142,76%,45%)] text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]" 
          : "bg-[hsl(25,100%,55%)] hover:bg-[hsl(25,100%,50%)] text-white shadow-[0_4px_20px_rgba(249,115,22,0.4)]",
        !isActive && "opacity-80",
        className
      )}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          GÉNÉRATION...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
