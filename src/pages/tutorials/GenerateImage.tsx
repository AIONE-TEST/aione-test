import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Image, 
  ArrowLeft, 
  Lightbulb,
  Wand2,
  Settings,
  Download,
  ArrowRight,
  Sparkles,
  Palette
} from "lucide-react";

const GenerateImage = () => {
  const steps = [
    {
      number: 1,
      title: "Accédez à la section IMAGE",
      description: "Cliquez sur 'IMAGE' dans la sidebar pour ouvrir le générateur d'images IA.",
      details: [
        "L'interface se compose d'un sélecteur de modèle, d'une zone de prompt, et d'options de configuration",
        "La zone de prévisualisation affiche vos images générées"
      ],
      icon: <Image className="h-6 w-6" />
    },
    {
      number: 2,
      title: "Sélectionnez un modèle IA",
      description: "Choisissez le modèle adapté à vos besoins dans le menu déroulant.",
      details: [
        "FLUX.1 Schnell (🟢 Gratuit) - Rapide, qualité correcte, idéal pour débuter",
        "FLUX.1 Dev - Qualité supérieure, plus de détails",
        "Stable Diffusion XL - Grande diversité de styles",
        "DALL-E 3 - Excellente compréhension des prompts complexes"
      ],
      icon: <Settings className="h-6 w-6" />,
      tip: "FLUX.1 Schnell est parfait pour apprendre sans dépenser de crédits"
    },
    {
      number: 3,
      title: "Rédigez votre prompt",
      description: "Décrivez l'image souhaitée de manière détaillée en français ou anglais.",
      details: [
        "Soyez précis: décrivez le sujet, le style, l'éclairage, l'ambiance",
        "Utilisez des modificateurs: 'photoréaliste', 'illustration', 'cinématique'",
        "Mentionnez la composition: 'plan large', 'gros plan', 'vue aérienne'",
        "Ajoutez des détails techniques: '8K', 'haute résolution', 'éclairage naturel'"
      ],
      icon: <Wand2 className="h-6 w-6" />,
      tip: "Utilisez le bouton 'Aide au prompt' pour améliorer automatiquement votre description"
    },
    {
      number: 4,
      title: "Configurez les options",
      description: "Ajustez le format et la qualité selon vos besoins.",
      details: [
        "Format: Carré (1:1), Paysage (16:9), Portrait (9:16)",
        "Qualité: Standard (rapide) ou HD (plus de détails)",
        "Style: Certains modèles proposent des presets de style"
      ],
      icon: <Palette className="h-6 w-6" />
    },
    {
      number: 5,
      title: "Générez et téléchargez",
      description: "Cliquez sur GÉNÉRER et patientez quelques secondes. Téléchargez ensuite votre création!",
      details: [
        "Le temps de génération varie de 5 à 30 secondes selon le modèle",
        "Utilisez le bouton de téléchargement pour sauvegarder l'image",
        "Vous pouvez régénérer avec le même prompt pour obtenir des variations"
      ],
      icon: <Download className="h-6 w-6" />
    }
  ];

  const examplePrompts = [
    {
      title: "Portrait photoréaliste",
      prompt: "Portrait d'une femme aux yeux verts, cheveux auburn ondulés, éclairage doré du coucher de soleil, style photographique professionnel, bokeh en arrière-plan, 8K, ultra détaillé"
    },
    {
      title: "Paysage fantastique",
      prompt: "Forêt enchantée avec des champignons lumineux géants, brume mystique, rayons de lumière filtrant à travers les arbres, ambiance féerique, illustration numérique, couleurs vibrantes"
    },
    {
      title: "Style anime",
      prompt: "Guerrière samouraï avec armure futuriste, katana lumineux, style anime japonais, couleurs néon, fond urbain cyberpunk, détails précis, illustration manga professionnelle"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-[373px] min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/tutorials">
            <Button variant="ghost" className="gap-2 mb-4 text-muted-foreground hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Retour aux tutoriels
            </Button>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(320,100%,60%)] to-[hsl(280,100%,65%)] glow-pink">
              <Image className="h-10 w-10 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30">
                Débutant • 10 min
              </Badge>
              <h1 className="font-display text-4xl font-black gradient-text-pink text-glow-pink tracking-wider">
                GÉNÉRER VOTRE PREMIÈRE IMAGE
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                Créez des images époustouflantes avec l'IA en quelques clics
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 max-w-4xl mb-8">
          {steps.map((step) => (
            <Card key={step.number} className="panel-3d p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(320,100%,60%)]/20 text-[hsl(320,100%,60%)] shrink-0">
                  <span className="font-display text-2xl font-black">{step.number}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[hsl(320,100%,60%)]">{step.icon}</span>
                    <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-[hsl(174,100%,50%)] shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {step.tip && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(45,100%,55%)]/10 border border-[hsl(45,100%,55%)]/30">
                      <Lightbulb className="h-5 w-5 text-[hsl(45,100%,55%)] shrink-0" />
                      <span className="text-sm text-[hsl(45,100%,55%)]">
                        <strong>Astuce:</strong> {step.tip}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Example Prompts */}
        <h2 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-[hsl(320,100%,60%)]" />
          Exemples de prompts efficaces
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-4xl mb-8">
          {examplePrompts.map((example, index) => (
            <Card key={index} className="panel-3d p-4">
              <h3 className="font-display font-bold text-[hsl(320,100%,60%)] mb-2">{example.title}</h3>
              <p className="text-xs text-muted-foreground italic">"{example.prompt}"</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="panel-3d p-6 max-w-4xl border-[hsl(142,76%,50%)]/30">
          <h3 className="font-display text-xl font-bold text-[hsl(142,76%,50%)] mb-4">
            🎨 Prêt à créer?
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/images">
              <Button className="btn-3d-pink gap-2">
                <Image className="h-4 w-4" />
                Aller au générateur d'images
              </Button>
            </Link>
            <Link to="/tutorials/prompting-techniques">
              <Button variant="outline" className="btn-3d gap-2">
                Techniques de prompting avancées
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default GenerateImage;
