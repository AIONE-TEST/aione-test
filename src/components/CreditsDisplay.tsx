import { Coins, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditsDisplayProps {
  credits: number;
  totalCredits: number;
  serviceName?: string;
  compact?: boolean;
  className?: string;
}

export function CreditsDisplay({ 
  credits, 
  totalCredits, 
  serviceName,
  compact = false,
  className 
}: CreditsDisplayProps) {
  const percentage = (credits / totalCredits) * 100;
  const isLow = percentage < 20;
  const isEmpty = credits <= 0;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm",
        isEmpty ? "text-red-500" : isLow ? "text-[hsl(45,100%,55%)]" : "text-[hsl(142,76%,50%)]",
        className
      )}>
        <Coins className="h-4 w-4" />
        <span className="font-bold">{credits}</span>
        <span className="text-muted-foreground">/ {totalCredits}</span>
      </div>
    );
  }

  return (
    <div className={cn("panel-3d p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isEmpty ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : isLow ? (
            <AlertTriangle className="h-4 w-4 text-[hsl(45,100%,55%)]" />
          ) : (
            <CheckCircle className="h-4 w-4 text-[hsl(142,76%,50%)]" />
          )}
          <span className="font-display text-sm font-bold">
            {serviceName ? `CRÉDITS ${serviceName.toUpperCase()}` : "CRÉDITS"}
          </span>
        </div>
        <span className={cn(
          "font-bold",
          isEmpty ? "text-red-500" : isLow ? "text-[hsl(45,100%,55%)]" : "text-[hsl(142,76%,50%)]"
        )}>
          {credits} / {totalCredits}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            isEmpty 
              ? "bg-red-500" 
              : isLow 
                ? "bg-gradient-to-r from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)]"
                : "bg-gradient-to-r from-[hsl(142,76%,50%)] to-[hsl(174,100%,50%)]"
          )}
          style={{ width: `${Math.max(percentage, 0)}%` }}
        />
      </div>

      {isEmpty && (
        <p className="text-xs text-red-500 mt-2">
          ⚠️ Plus de crédits disponibles. Rechargez votre compte.
        </p>
      )}
      {isLow && !isEmpty && (
        <p className="text-xs text-[hsl(45,100%,55%)] mt-2">
          ⚡ Crédits limités. Pensez à recharger.
        </p>
      )}
    </div>
  );
}
