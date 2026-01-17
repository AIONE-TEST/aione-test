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
    <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(45,100%,55%)]/40 bg-gradient-to-r from-[hsl(220,20%,10%)] via-[hsl(280,60%,15%)] to-[hsl(220,20%,10%)] p-5 mb-6">
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[hsl(45,100%,55%)] rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[hsl(320,100%,60%)] rounded-full blur-[80px] animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Header with animated icons */}
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-[hsl(45,100%,55%)] animate-pulse" />
          <h3 className="font-display text-xl font-black tracking-wider bg-gradient-to-r from-[hsl(45,100%,55%)] via-[hsl(25,100%,55%)] to-[hsl(320,100%,60%)] bg-clip-text text-transparent">
            PRIX IMBATTABLES SUR VOS CRÉDITS IA !
          </h3>
          <Zap className="h-6 w-6 text-[hsl(45,100%,55%)] animate-pulse" />
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(142,76%,50%)]/10 text-[hsl(142,76%,50%)] border border-[hsl(142,76%,50%)]/30">
            <Gift className="h-4 w-4" /> Tokens & Crédits
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(280,100%,65%)]/10 text-[hsl(280,100%,65%)] border border-[hsl(280,100%,65%)]/30">
            <Sparkles className="h-4 w-4" /> Abonnements IA
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(45,100%,55%)]/10 text-[hsl(45,100%,55%)] border border-[hsl(45,100%,55%)]/30">
            <Percent className="h-4 w-4" /> Jusqu'à -70%
          </span>
        </div>

        {/* Slogan */}
        <p className="text-center text-muted-foreground text-sm max-w-lg">
          Gift Codes • Redeem Codes • API Credits • Subscriptions à prix réduit
        </p>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {bannerLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-white transition-all duration-300",
                "bg-gradient-to-r hover:scale-105 hover:shadow-lg",
                link.color
              )}
            >
              <span>{link.name}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
          <span className="animate-pulse">✨</span>
          Découvrez les meilleures offres pour vos générateurs IA préférés
          <span className="animate-pulse">✨</span>
        </p>
      </div>
    </div>
  );
}
