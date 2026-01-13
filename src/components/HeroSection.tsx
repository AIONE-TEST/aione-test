import { Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const categoryTags = [
  { label: "Chat / LLMs", color: "bg-[hsl(320,100%,60%)]" },
  { label: "Vidéos", color: "bg-[hsl(280,100%,65%)]" },
  { label: "Images", color: "bg-[hsl(320,100%,60%)]" },
  { label: "Audio", color: "bg-[hsl(45,100%,55%)]" },
  { label: "3D", color: "bg-[hsl(142,76%,50%)]" },
  { label: "Retouche", color: "bg-[hsl(174,100%,50%)]" },
  { label: "NO-CODE", color: "bg-[hsl(25,100%,55%)]" },
];

interface HeroSectionProps {
  totalModels: number;
  freeModels: number;
  categories: number;
}

export function HeroSection({ totalModels, freeModels, categories }: HeroSectionProps) {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(174,100%,50%)/0.3] bg-[hsl(174,100%,50%)/0.1] px-4 py-2 text-sm text-[hsl(174,100%,50%)] glow-cyan">
        <Zap className="h-4 w-4" />
        <span>+{totalModels} Modèles AI Disponibles</span>
      </div>

      {/* Title */}
      <h1 className="font-display text-6xl font-black tracking-wider md:text-7xl lg:text-8xl">
        <span className="gradient-text-pink text-glow-pink">AIONE</span>
      </h1>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-[0.3em] text-foreground/90 md:text-3xl">
        AI GATEWAY
      </h2>

      {/* Subtitle */}
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Un seul portail. <span className="font-semibold text-foreground">Toutes les IA.</span> Créez sans limites.
      </p>

      {/* Category Tags */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {categoryTags.map((tag, index) => (
          <span
            key={index}
            className={`rounded-full ${tag.color} px-4 py-1.5 text-sm font-medium text-black`}
          >
            {tag.label}
          </span>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Button 
          size="lg" 
          className="gap-2 rounded-full bg-gradient-to-r from-[hsl(174,100%,50%)] to-[hsl(174,100%,40%)] px-8 text-black font-semibold glow-cyan hover:from-[hsl(174,100%,55%)] hover:to-[hsl(174,100%,45%)]"
          asChild
        >
          <Link to="/chat">
            <Sparkles className="h-5 w-5" />
            Commencer à Créer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="rounded-full border-foreground/20 px-8 hover:bg-foreground/5"
        >
          Explorer les {totalModels}+ APIs
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-16 flex flex-wrap justify-center gap-12">
        <div className="text-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(174,100%,50%)]" />
            <span className="font-display text-4xl font-bold text-[hsl(174,100%,50%)]">
              {totalModels}+
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Modèles IA</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(210,100%,60%)]" />
            <span className="font-display text-4xl font-bold text-[hsl(210,100%,60%)]">
              {categories}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Catégories</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(142,76%,50%)]" />
            <span className="font-display text-4xl font-bold text-[hsl(142,76%,50%)]">
              FREE
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Pour Débuter</p>
        </div>
      </div>
    </section>
  );
}
