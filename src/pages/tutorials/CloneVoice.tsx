import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Mic, 
  ArrowLeft, 
  Lightbulb,
  Upload,
  Settings,
  Sliders,
  ArrowRight,
  AudioLines,
  AlertTriangle
} from "lucide-react";

const CloneVoice = () => {
  const steps = [
    {
      number: 1,
      title: "Préparez votre clé API ElevenLabs",
      description: "Le clonage vocal nécessite une clé API ElevenLabs avec un abonnement approprié.",
      details: [
        "Créez un compte sur elevenlabs.io",
        "Souscrivez à un plan Creator ou supérieur",
        "Copiez votre clé API depuis les paramètres",
        "Configurez la clé dans AIONE (section Compte > Clés API)"
      ],
      icon: <Settings className="h-6 w-6" />
    },
    {
      number: 2,
      title: "Préparez vos échantillons audio",
      description: "La qualité du clonage dépend directement de la qualité des échantillons fournis.",
      details: [
        "Durée minimale recommandée: 1-3 minutes d'audio propre",
        "Évitez le bruit de fond, la musique, les échos",
        "Privilégiez un microphone de qualité",
        "Parlez naturellement avec des intonations variées",
        "Formats acceptés: MP3, WAV, M4A"
      ],
      icon: <Mic className="h-6 w-6" />,
      tip: "Plus vos échantillons sont propres et variés, meilleur sera le clone"
    },
    {
      number: 3,
      title: "Uploadez vos échantillons",
      description: "Accédez au mode Voice Clone et uploadez vos fichiers audio.",
      details: [
        "Cliquez sur la zone d'upload ou glissez-déposez",
        "Vous pouvez uploader plusieurs fichiers",
        "Le système analyse automatiquement la voix",
        "Attendez la confirmation de traitement"
      ],
      icon: <Upload className="h-6 w-6" />
    },
    {
      number: 4,
      title: "Attendez l'entraînement du modèle",
      description: "ElevenLabs analyse vos échantillons pour créer le clone vocal.",
      details: [
        "Le traitement prend généralement 1-5 minutes",
        "Le système extrait les caractéristiques vocales",
        "Timbre, accent, rythme sont analysés",
        "Une notification confirme quand c'est prêt"
      ],
      icon: <AudioLines className="h-6 w-6" />
    },
    {
      number: 5,
      title: "Testez et ajustez les paramètres",
      description: "Générez un premier échantillon et affinez les réglages.",
      details: [
        "Stability: Plus haut = plus constant, plus bas = plus expressif",
        "Similarity: Contrôle la fidélité au clone",
        "Style Exaggeration: Accentue le style vocal",
        "Testez avec différents types de textes"
      ],
      icon: <Sliders className="h-6 w-6" />,
      tip: "Commencez avec Stability à 50% et Similarity à 75%, puis ajustez"
    },
    {
      number: 6,
      title: "Générez vos narrations",
      description: "Utilisez votre clone vocal pour créer du contenu audio.",
      details: [
        "Entrez le texte à faire narrer",
        "Choisissez la langue de sortie",
        "Générez et prévisualisez",
        "Exportez en MP3 ou WAV haute qualité"
      ],
      icon: <AudioLines className="h-6 w-6" />
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
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(174,100%,50%)] to-[hsl(142,76%,50%)] glow-cyan">
              <Mic className="h-10 w-10 text-black" />
            </div>
            <div>
              <Badge className="mb-2 bg-[hsl(0,85%,60%)]/20 text-[hsl(0,85%,60%)] border-[hsl(0,85%,60%)]/30">
                Avancé • 20 min
              </Badge>
              <h1 className="font-display text-4xl font-black gradient-text-cyan text-glow-cyan tracking-wider">
                CLONER UNE VOIX AVEC ELEVENLABS
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                Reproduisez fidèlement une voix ou créez des narrations professionnelles
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <Card className="panel-3d p-4 mb-8 max-w-4xl border-[hsl(0,85%,60%)]/30 bg-[hsl(0,85%,60%)]/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-[hsl(0,85%,60%)] shrink-0" />
            <div>
              <h4 className="font-display font-bold text-[hsl(0,85%,60%)] mb-1">Usage responsable</h4>
              <p className="text-sm text-muted-foreground">
                Le clonage vocal doit être utilisé de manière éthique. Ne clonez jamais une voix sans le consentement explicite 
                de la personne concernée. L'utilisation pour la fraude ou l'usurpation d'identité est illégale.
              </p>
            </div>
          </div>
        </Card>

        {/* Steps */}
        <div className="space-y-6 max-w-4xl mb-8">
          {steps.map((step) => (
            <Card key={step.number} className="panel-3d p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)] shrink-0">
                  <span className="font-display text-2xl font-black">{step.number}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[hsl(174,100%,50%)]">{step.icon}</span>
                    <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-[hsl(45,100%,55%)] shrink-0 mt-0.5" />
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

        {/* CTA */}
        <Card className="panel-3d p-6 max-w-4xl border-[hsl(142,76%,50%)]/30">
          <h3 className="font-display text-xl font-bold text-[hsl(142,76%,50%)] mb-4">
            🎤 Prêt à cloner une voix?
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/audio">
              <Button className="btn-3d-cyan gap-2">
                <Mic className="h-4 w-4" />
                Aller au clonage vocal
              </Button>
            </Link>
            <Link to="/tutorials/add-api-key">
              <Button variant="outline" className="btn-3d gap-2">
                Configurer ma clé ElevenLabs
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default CloneVoice;
