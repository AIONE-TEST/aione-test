import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Music, 
  ArrowLeft, 
  Lightbulb,
  Mic,
  Settings,
  Download,
  ArrowRight,
  Radio,
  ListMusic
} from "lucide-react";

const GenerateMusic = () => {
  const steps = [
    {
      number: 1,
      title: "Accédez à la section MUSIQUE",
      description: "Cliquez sur 'MUSIQUE' dans la sidebar pour ouvrir le générateur audio.",
      details: [
        "Plusieurs modes disponibles: Text-to-Music, Text-to-Speech, Sound FX",
        "Choisissez le mode selon votre besoin"
      ],
      icon: <Music className="h-6 w-6" />
    },
    {
      number: 2,
      title: "Sélectionnez le mode TEXT TO MUSIC",
      description: "Ce mode permet de créer des compositions musicales originales à partir de descriptions textuelles.",
      details: [
        "Suno AI V4 - Le plus avancé, génère chant + instrumental",
        "Mode Easy: décrivez simplement le style souhaité",
        "Mode Custom: contrôlez les paroles et la structure"
      ],
      icon: <Radio className="h-6 w-6" />,
      tip: "Suno V4 comprend les descriptions en français!"
    },
    {
      number: 3,
      title: "Décrivez votre composition",
      description: "Soyez précis sur le style, l'ambiance et les instruments.",
      details: [
        "Genre musical: rock, jazz, électro, hip-hop, classique, pop...",
        "Ambiance: énergique, mélancolique, relaxant, épique...",
        "Instruments: guitare acoustique, synthétiseur, piano, drums...",
        "Tempo: lent, modéré, rapide, groove"
      ],
      icon: <ListMusic className="h-6 w-6" />
    },
    {
      number: 4,
      title: "Ajoutez des paroles (optionnel)",
      description: "En mode Custom, vous pouvez écrire vos propres paroles avec des metatags.",
      details: [
        "[Verse] - Marque le début d'un couplet",
        "[Chorus] - Marque le refrain",
        "[Bridge] - Pour le pont musical",
        "[Drop] - Pour les moments intenses (électro/EDM)"
      ],
      icon: <Mic className="h-6 w-6" />,
      tip: "Laissez l'IA générer les paroles en mode Easy si vous n'avez pas d'idées"
    },
    {
      number: 5,
      title: "Configurez et générez",
      description: "Ajustez les paramètres de durée et lancez la génération.",
      details: [
        "Durée: 30 secondes à 4 minutes selon le modèle",
        "Suno génère deux versions à chaque fois",
        "Écoutez les deux et choisissez votre préférée"
      ],
      icon: <Settings className="h-6 w-6" />
    },
    {
      number: 6,
      title: "Téléchargez votre création",
      description: "Prévisualisez et téléchargez votre musique en MP3.",
      details: [
        "Lecteur audio intégré pour la prévisualisation",
        "Export en MP3 haute qualité",
        "Utilisez librement dans vos projets vidéo ou podcast"
      ],
      icon: <Download className="h-6 w-6" />
    }
  ];

  const examplePrompts = [
    {
      title: "Rock énergique",
      prompt: "Chanson rock énergique avec guitare électrique saturée, batterie puissante, chant masculin grave, style années 80, refrain accrocheur"
    },
    {
      title: "Lofi chill",
      prompt: "Beat lofi relaxant avec piano jazzy, vinyle crackle, basse groovy, ambiance nocturne, parfait pour étudier"
    },
    {
      title: "Épique cinématique",
      prompt: "Musique orchestrale épique avec cuivres puissants, percussions tribales, chorale, crescendo dramatique, style bande-annonce de film"
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
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] glow-yellow">
              <Music className="h-10 w-10 text-black" />
            </div>
            <div>
              <Badge className="mb-2 bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30">
                Intermédiaire • 12 min
              </Badge>
              <h1 className="font-display text-4xl font-black gradient-text-yellow text-glow-yellow tracking-wider">
                GÉNÉRER DE LA MUSIQUE AVEC SUNO
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                Créez des compositions musicales originales avec l'IA
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 max-w-4xl mb-8">
          {steps.map((step) => (
            <Card key={step.number} className="panel-3d p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] shrink-0">
                  <span className="font-display text-2xl font-black">{step.number}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[hsl(45,100%,55%)]">{step.icon}</span>
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
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(174,100%,50%)]/10 border border-[hsl(174,100%,50%)]/30">
                      <Lightbulb className="h-5 w-5 text-[hsl(174,100%,50%)] shrink-0" />
                      <span className="text-sm text-[hsl(174,100%,50%)]">
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
        <h2 className="font-display text-2xl font-bold text-white mb-4">Exemples de prompts musicaux</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-4xl mb-8">
          {examplePrompts.map((example, index) => (
            <Card key={index} className="panel-3d p-4">
              <h3 className="font-display font-bold text-[hsl(45,100%,55%)] mb-2">{example.title}</h3>
              <p className="text-xs text-muted-foreground italic">"{example.prompt}"</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="panel-3d p-6 max-w-4xl border-[hsl(142,76%,50%)]/30">
          <h3 className="font-display text-xl font-bold text-[hsl(142,76%,50%)] mb-4">
            🎵 Prêt à composer?
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/audio">
              <Button className="btn-3d-yellow gap-2">
                <Music className="h-4 w-4" />
                Aller au générateur de musique
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default GenerateMusic;
