import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  title: string;
  description: string;
  example?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function InfoTooltip({ 
  title, 
  description, 
  example, 
  className,
  size = "md" 
}: InfoTooltipProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full",
            "text-[hsl(174,100%,50%)] hover:text-[hsl(174,100%,60%)]",
            "hover:bg-[hsl(174,100%,50%)]/10 p-0.5",
            "transition-all duration-200 cursor-help",
            className
          )}
          onClick={(e) => e.preventDefault()}
        >
          <Info className={sizeClasses[size]} />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs p-3 bg-[hsl(220,20%,12%)] border-[hsl(220,15%,25%)] shadow-xl"
      >
        <div className="space-y-1.5">
          <p className="font-display font-bold text-sm text-[hsl(174,100%,50%)]">
            {title}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
          {example && (
            <p className="text-xs text-[hsl(45,100%,55%)] italic">
              Ex: {example}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Bouton avec icône INFO intégrée
interface ButtonWithInfoProps {
  children: React.ReactNode;
  infoTitle: string;
  infoDescription: string;
  infoExample?: string;
  className?: string;
}

export function ButtonWithInfo({
  children,
  infoTitle,
  infoDescription,
  infoExample,
  className
}: ButtonWithInfoProps) {
  return (
    <div className={cn("relative inline-flex items-center gap-1", className)}>
      {children}
      <InfoTooltip 
        title={infoTitle} 
        description={infoDescription} 
        example={infoExample}
        size="sm"
      />
    </div>
  );
}
