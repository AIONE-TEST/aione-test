import { ExternalLink, Zap, Gift, Percent, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const bannerLinks = [
  { 
    name: "G2A", 
    url: "https://www.g2a.com",
    logo: "https://www.g2a.com/static/images/og-image.jpg",
    color: "from-orange-500 to-orange-600"
  },
  { 
    name: "G2G", 
    url: "https://www.g2g.com",
    logo: "https://www.g2g.com/static/images/g2g-logo-dark.svg",
    color: "from-green-500 to-emerald-600"
  },
  { 
    name: "Kinguin", 
    url: "https://www.kinguin.net/",
    logo: "https://www.kinguin.net/static/kinguin-logo.svg",
    color: "from-blue-500 to-indigo-600"
  },
];

export function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[hsl(45,100%,55%)]/30 bg-gradient-to-r from-[hsl(220,20%,8%)] via-[hsl(280,50%,12%)] to-[hsl(220,20%,8%)] px-4 py-2 mb-4">
      {/* Compact animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/3 w-32 h-16 bg-[hsl(45,100%,55%)] rounded-full blur-[60px] animate-pulse" />
        <div className="absolute bottom-0 right-1/3 w-24 h-12 bg-[hsl(320,100%,60%)] rounded-full blur-[40px] animate-pulse delay-300" />
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        {/* Left - Title & Features */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[hsl(45,100%,55%)] animate-pulse" />
            <span className="font-display text-base font-black tracking-wider bg-gradient-to-r from-[hsl(45,100%,55%)] via-[hsl(25,100%,55%)] to-[hsl(320,100%,60%)] bg-clip-text text-transparent">
              PRIX IMBATTABLES !
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(142,76%,50%)]/10 text-[hsl(142,76%,50%)] border border-[hsl(142,76%,50%)]/30">
              <Gift className="h-3 w-3" /> Tokens
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(280,100%,65%)]/10 text-[hsl(280,100%,65%)] border border-[hsl(280,100%,65%)]/30">
              <Sparkles className="h-3 w-3" /> Crédits IA
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(45,100%,55%)]/10 text-[hsl(45,100%,55%)] border border-[hsl(45,100%,55%)]/30">
              <Percent className="h-3 w-3" /> -70%
            </span>
          </div>
        </div>

        {/* Right - Links */}
        <div className="flex items-center gap-2">
          {bannerLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display font-bold text-white text-sm transition-all duration-300",
                "bg-gradient-to-r hover:scale-105 hover:shadow-md",
                link.color
              )}
            >
              <span>{link.name}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
