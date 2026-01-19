import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Video, 
  ArrowLeft, 
  Lightbulb,
  Upload,
  Settings,
  Timer,
  ArrowRight,
  Play,
  Clapperboard
} from "lucide-react";

const CreateVideo = () => {
  const steps = [
    {
      number: 1,
      title: "Accédez à la section VIDÉO",
      description: "Cliquez sur 'VIDÉO' dans la sidebar pour ouvrir le générateur de vidéos IA.",
      details: [
        "Deux modes disponibles: Text-to-Video et Image-to-Video",
        "Sélectionnez le mode adapté à votre projet"
      ],
      icon: <Video className="h-6 w-6" />
    },
    {
      number: 2,
      title: "Choisissez le mode de génération",
      description: "Text-to-Video crée une vidéo à partir de votre description. Image-to-Video anime une image existante.",
      details: [
        "Text-to-Video: Décrivez la scène et les mouvements souhaités",
        "Image-to-Video: Uploadez une image et décrivez l'animation désirée",
        "Le mode Image-to-Video est idéal pour animer des portraits ou des paysages"
      ],
      icon: <Clapperboard className="h-6 w-6" />,
      tip: "Commencez par Text-to-Video pour vous familiariser avec le système"
    },
    {
      number: 3,
      title: "Sélectionnez un modèle",
      description: "Choisissez le modèle adapté à vos besoins et budget.",
      details: [
        "Kling AI 1.0 - Bon rapport qualité/prix, mouvements fluides",
        "Kling AI 1.5 Pro - Qualité supérieure, meilleure cohérence",
        "Runway Gen-3 - Très haute qualité, idéal pour le pro",
        "Minimax Video - Alternative économique"
      ],
      icon: <Settings className="h-6 w-6" />
    },
    {
      number: 4,
      title: "Rédigez votre prompt avec des détails de mouvement",
      description: "Décrivez précisément les actions et mouvements de la scène.",
      details: [
        "Mentionnez les mouvements de caméra: 'travelling avant', 'panoramique', 'zoom lent'",
        "Décrivez les actions: 'la femme marche lentement', 'les feuilles tombent doucement'",
        "Précisez l'ambiance: 'atmosphère mystérieuse', 'lumière dorée du matin'",
        "Ajoutez le style: 'cinématique', 'documentaire', 'film d'action'"
      ],
      icon: <Play className="h-6 w-6" />,
      tip: "Les prompts courts et précis fonctionnent mieux que les descriptions trop longues"
    },
    {
      number: 5,
      title: "Configurez la durée et la qualité",
      description: "Ajustez les paramètres de sortie selon vos besoins.",
      details: [
        "Durée: 5 secondes (rapide) ou 10 secondes (plus de contenu)",
        "Qualité: Standard (720p) ou HD (1080p)",
        "Format: 16:9 (paysage), 9:16 (portrait), 1:1 (carré)"
      ],
      icon: <Timer className="h-6 w-6" />
    },
    {
      number: 6,
      title: "Générez et téléchargez",
      description: "Cliquez sur GÉNÉRER. La génération prend 2-5 minutes selon la durée et qualité.",
      details: [
        "Patientez pendant la génération - ne rafraîchissez pas la page",
        "Prévisualisez le résultat dans le lecteur intégré",
        "Téléchargez en MP4 pour utiliser dans vos projets"
      ],
      icon: <Upload className="h-6 w-6" />
    }
  ];

  const examplePrompts = [
    {
      title: "Scène cinématique",
      prompt: "Travelling lent vers l'avant dans une forêt brumeuse au lever du soleil, rayons de lumière filtrant entre les arbres, ambiance mystique, cinématique, 4K"
    },
    {
      title: "Portrait animé",
      prompt: "Femme aux cheveux longs regardant vers la caméra, légère brise faisant bouger ses cheveux, sourire subtil, éclairage naturel doux, style portrait professionnel"
    },
    {
      title: "Scène d'action",
      prompt: "Voiture de sport rouge traversant un désert poussiéreux à grande vitesse, vue aérienne drone suivant le véhicule, coucher de soleil dramatique, style film d'action"
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
              <Video className="h-10 w-10 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30">
                Intermédiaire • 15 min
              </Badge>
              <h1 className="font-display text-4xl font-black gradient-text-purple text-glow-purple tracking-wider">
                CRÉER UNE VIDÉO AVEC L'IA
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                Transformez vos idées en vidéos captivantes
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 max-w-4xl mb-8">
          {steps.map((step) => (
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
        <h2 className="font-display text-2xl font-bold text-white mb-4">Exemples de prompts vidéo</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-4xl mb-8">
          {examplePrompts.map((example, index) => (
            <Card key={index} className="panel-3d p-4">
              <h3 className="font-display font-bold text-[hsl(280,100%,65%)] mb-2">{example.title}</h3>
              <p className="text-xs text-muted-foreground italic">"{example.prompt}"</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="panel-3d p-6 max-w-4xl border-[hsl(142,76%,50%)]/30">
          <h3 className="font-display text-xl font-bold text-[hsl(142,76%,50%)] mb-4">
            🎬 Prêt à créer votre vidéo?
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/videos">
              <Button className="btn-3d-purple gap-2">
                <Video className="h-4 w-4" />
                Aller au générateur de vidéos
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default CreateVideo;
