import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";

const PromptingTechniques = () => (
  <div className="min-h-screen bg-background">
    <Sidebar />
    <main className="ml-[373px] min-h-screen p-8">
      <Link to="/tutorials">
        <Button variant="ghost" className="gap-2 mb-4 text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour aux tutoriels
        </Button>
      </Link>
      <div className="flex items-center gap-6 mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] glow-orange">
          <Sparkles className="h-10 w-10 text-black" />
        </div>
        <div>
          <Badge className="mb-2 bg-[hsl(0,85%,60%)]/20 text-[hsl(0,85%,60%)]">Avancé • 20 min</Badge>
          <h1 className="font-display text-4xl font-black gradient-text-orange">TECHNIQUES DE PROMPTING</h1>
        </div>
      </div>
      <Card className="panel-3d p-6 max-w-4xl mb-6">
        <h3 className="font-display text-xl font-bold text-white mb-4">Techniques avancées</h3>
        <ul className="space-y-4">
          {[
            { title: "Structure d'un prompt efficace", desc: "Sujet + Style + Détails + Qualité technique" },
            { title: "Modificateurs de style", desc: "cinématique, photoréaliste, illustration, anime, oil painting..." },
            { title: "Prompts négatifs", desc: "Excluez ce que vous ne voulez pas: 'sans texte, sans watermark'" },
            { title: "Pondération des mots", desc: "Utilisez (mot:1.5) pour accentuer, (mot:0.5) pour atténuer" },
            { title: "Combinaison de concepts", desc: "Séparez les idées avec des virgules pour plus de clarté" }
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-[hsl(25,100%,55%)] shrink-0 mt-1" />
              <div><strong className="text-[hsl(25,100%,55%)]">{item.title}:</strong> <span className="text-muted-foreground">{item.desc}</span></div>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="panel-3d p-4 max-w-4xl border-[hsl(45,100%,55%)]/30">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-6 w-6 text-[hsl(45,100%,55%)]" />
          <p className="text-sm text-muted-foreground">Utilisez le bouton "Aide au prompt" disponible dans chaque section pour améliorer automatiquement vos prompts!</p>
        </div>
      </Card>
    </main>
  </div>
);

export default PromptingTechniques;
