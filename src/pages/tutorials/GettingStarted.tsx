import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Rocket, 
  ArrowLeft, 
  CheckCircle, 
  Lightbulb,
  MousePointer,
  Eye,
  Zap,
  ArrowRight
} from "lucide-react";

const GettingStarted = () => {
  const steps = [
    {
      number: 1,
      title: "Découvrez l'interface principale",
      description: "L'interface AIONE se compose d'une sidebar à gauche (menu de navigation) et d'une zone de travail principale à droite.",
      details: [
        "La sidebar contient tous les raccourcis vers les différentes sections",
        "Le logo AIONE animé en haut vous ramène à l'accueil",
        "Chaque bouton change de couleur lorsque sa section est active"
      ],
      icon: <MousePointer className="h-6 w-6" />,
      tip: "Survolez chaque bouton pour voir son effet visuel 3D"
    },
    {
      number: 2,
      title: "Explorez les catégories principales",
      description: "AIONE regroupe les fonctionnalités IA en 8 catégories principales accessibles depuis la sidebar.",
      details: [
        "VIDÉO - Génération de vidéos avec l'IA (Kling AI, Runway, etc.)",
        "IMAGE - Création d'images (FLUX, Stable Diffusion, DALL-E)",
        "RETOUCHE - Amélioration et modification d'images existantes",
        "CHAT - Discussion avec les LLMs (GPT-4, Claude, Gemini)",
        "MUSIQUE - Génération audio (Suno, ElevenLabs TTS/SFX)",
        "CODAGE - Assistance au développement avec l'IA",
        "APPLIS IA - Catalogue de tous les modèles disponibles",
        "TUTOS - Guides d'utilisation (vous êtes ici!)"
      ],
      icon: <Eye className="h-6 w-6" />,
      tip: "Commencez par la section APPLIS IA pour voir tous les modèles disponibles"
    },
    {
      number: 3,
      title: "Comprenez les indicateurs LED",
      description: "Chaque modèle IA affiche un indicateur LED coloré indiquant son statut de disponibilité.",
      details: [
        "🟢 LED VERTE = Modèle gratuit, prêt à utiliser immédiatement",
        "🟡 LED JAUNE = Modèle avec crédits limités ou quota",
        "🔴 LED ROUGE = Clé API requise pour utiliser ce modèle",
        "⚫ LED GRISE = Modèle temporairement indisponible"
      ],
      icon: <Zap className="h-6 w-6" />,
      tip: "Filtrez par statut 'Gratuit' pour voir uniquement les modèles sans configuration"
    },
    {
      number: 4,
      title: "Testez votre premier modèle gratuit",
      description: "Lancez-vous avec un modèle gratuit pour découvrir la puissance de l'IA sans aucune configuration.",
      details: [
        "Allez dans la section IMAGE ou CHAT",
        "Sélectionnez un modèle avec LED verte (ex: FLUX.1 Schnell)",
        "Écrivez un prompt simple en français ou anglais",
        "Cliquez sur GÉNÉRER et admirez le résultat!"
      ],
      icon: <CheckCircle className="h-6 w-6" />,
      tip: "Pour les images, essayez 'Un chat astronaute sur la lune, style réaliste'"
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
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] glow-purple">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30">
                Débutant • 5 min
              </Badge>
              <h1 className="font-display text-4xl font-black gradient-text-purple text-glow-purple tracking-wider">
                PREMIERS PAS AVEC AIONE
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                Découvrez l'interface et maîtrisez les bases de la plateforme
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 max-w-4xl">
          {steps.map((step, index) => (
            <Card key={step.number} className="panel-3d p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)] shrink-0">
                  <span className="font-display text-2xl font-black">{step.number}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[hsl(280,100%,65%)]">{step.icon}</span>
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
                  
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(45,100%,55%)]/10 border border-[hsl(45,100%,55%)]/30">
                    <Lightbulb className="h-5 w-5 text-[hsl(45,100%,55%)] shrink-0" />
                    <span className="text-sm text-[hsl(45,100%,55%)]">
                      <strong>Astuce:</strong> {step.tip}
                    </span>
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex justify-center mt-4">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-[hsl(280,100%,65%)] to-transparent" />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Next Steps */}
        <Card className="panel-3d p-6 mt-8 max-w-4xl border-[hsl(142,76%,50%)]/30">
          <h3 className="font-display text-xl font-bold text-[hsl(142,76%,50%)] mb-4">
            🎉 Félicitations! Vous êtes prêt!
          </h3>
          <p className="text-muted-foreground mb-4">
            Vous maîtrisez maintenant les bases d'AIONE. Continuez votre apprentissage avec ces tutoriels recommandés:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/tutorials/add-api-key">
              <Button className="btn-3d-yellow gap-2">
                Configurer vos clés API
              </Button>
            </Link>
            <Link to="/tutorials/generate-image">
              <Button className="btn-3d-pink gap-2">
                Générer votre première image
              </Button>
            </Link>
            <Link to="/images">
              <Button variant="outline" className="btn-3d gap-2">
                Aller à IMAGE
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default GettingStarted;
