import { ExternalLink, Zap, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function LMarenaButton() {
  return (
    <a
      href="https://lmarena.ai"
      target="_blank"
      rel="noopener noreferrer"
      className="block mb-6"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(142,76%,50%)]/50 bg-gradient-to-r from-[hsl(142,76%,15%)] to-[hsl(174,100%,15%)] p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[hsl(142,76%,50%)]/20">
        {/* Animated glow */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[hsl(142,76%,50%)] to-transparent animate-shimmer" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(142,76%,50%)] to-[hsl(174,100%,50%)] shadow-lg shadow-[hsl(142,76%,50%)]/30">
              <Bot className="h-8 w-8 text-white" />
            </div>
            
            {/* Text */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-black text-white animate-pulse-fast">
                  LMarena
                </span>
                <Zap className="h-5 w-5 text-[hsl(45,100%,55%)]" />
              </div>
              <p className="text-sm text-muted-foreground">
                IA 100% GRATUIT • Direct Chat
              </p>
            </div>
          </div>

          {/* Badge & Arrow */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] font-display text-xs font-bold border border-[hsl(142,76%,50%)]/40">
              FREE
            </span>
            <ExternalLink className="h-5 w-5 text-[hsl(142,76%,50%)]" />
          </div>
        </div>
      </div>
    </a>
  );
}
