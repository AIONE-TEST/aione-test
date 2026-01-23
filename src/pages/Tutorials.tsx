import { useState } from "react";
import { 
  GraduationCap, 
  Rocket, 
  Key, 
  Image, 
  Video, 
  Music, 
  Mic, 
  Box, 
  Wand2, 
  MessageSquare, 
  Sparkles,
  Play,
  ExternalLink,
  Clock,
  Star,
  ChevronRight,
  Youtube
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  duration: string;
  youtubeUrl?: string;
  steps: string[];
  colorClass: string;
  bgClass: string;
}

const tutorials: Tutorial[] = [
  {
    id: "getting-started",
    title: "Premiers pas avec AIONE",
    description: "Découvrez l'interface, naviguez entre les sections et comprenez les bases de la plateforme.",
    icon: <Rocket className="h-8 w-8" />,
    difficulty: "Débutant",
    duration: "5 min",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    steps: [
      "Explorez la sidebar pour naviguer entre les catégories",
      "Découvrez la section APPLIS IA pour voir tous les modèles",
      "Comprenez les indicateurs LED (vert = actif, rouge = clé requise)",
      "Testez les modèles gratuits sans configuration"
    ],
    colorClass: "text-[hsl(280,100%,65%)]",
    bgClass: "bg-[hsl(280,100%,65%)]"
  },
  {
    id: "add-api-key",
    title: "Ajouter une clé API",
    description: "Apprenez à configurer vos clés API pour débloquer les modèles premium.",
    icon: <Key className="h-8 w-8" />,
    difficulty: "Débutant",
    duration: "3 min",
    youtubeUrl: "https://www.youtube.com/watch?v=2EaE0bYH6d0",
    steps: [
      "Allez dans la section API KEYS",
      "Cliquez sur le service que vous souhaitez activer",
      "Suivez le lien pour obtenir votre clé sur le site officiel",
      "Collez votre clé et validez"
    ],
    colorClass: "text-[hsl(45,100%,55%)]",
    bgClass: "bg-[hsl(45,100%,55%)]"
  },
  {
    id: "generate-image",
    title: "Générer votre première image",
    description: "Créez des images époustouflantes avec l'IA en quelques clics.",
    icon: <Image className="h-8 w-8" />,
    difficulty: "Débutant",
    duration: "10 min",
    youtubeUrl: "https://www.youtube.com/watch?v=HK6y8DAPN_0",
    steps: [
      "Sélectionnez la section IMAGE dans la sidebar",
      "Choisissez un modèle (FLUX.1 Schnell est gratuit)",
      "Écrivez un prompt descriptif en français ou anglais",
      "Ajustez le format et la qualité",
      "Cliquez sur GÉNÉRER et admirez le résultat!"
    ],
    colorClass: "text-[hsl(320,100%,60%)]",
    bgClass: "bg-[hsl(320,100%,60%)]"
  },
  {
    id: "create-video",
    title: "Créer une vidéo avec l'IA",
    description: "Transformez vos idées en vidéos captivantes grâce aux modèles de génération vidéo.",
    icon: <Video className="h-8 w-8" />,
    difficulty: "Intermédiaire",
    duration: "15 min",
    youtubeUrl: "https://www.youtube.com/watch?v=3n3RhyFCs6k",
    steps: [
      "Naviguez vers la section VIDÉO",
      "Choisissez entre texte-vers-vidéo ou image-vers-vidéo",
      "Sélectionnez un modèle (Kling AI offre des crédits gratuits)",
      "Rédigez un prompt avec des détails sur le mouvement",
      "Définissez la durée et la qualité souhaitées",
      "Lancez la génération et patientez quelques minutes"
    ],
    colorClass: "text-[hsl(280,100%,65%)]",
    bgClass: "bg-[hsl(280,100%,65%)]"
  },
  {
    id: "generate-music",
    title: "Générer de la musique avec Suno",
    description: "Créez des compositions musicales originales avec l'intelligence artificielle.",
    icon: <Music className="h-8 w-8" />,
    difficulty: "Intermédiaire",
    duration: "12 min",
    youtubeUrl: "https://www.youtube.com/watch?v=TfF-wCBbYk8",
    steps: [
      "Accédez à la section AUDIO",
      "Sélectionnez Suno AI comme modèle",
      "Décrivez le style musical souhaité (rock, jazz, électro...)",
      "Ajoutez des paroles ou laissez l'IA les générer",
      "Choisissez la durée du morceau",
      "Téléchargez votre création"
    ],
    colorClass: "text-[hsl(45,100%,55%)]",
    bgClass: "bg-[hsl(45,100%,55%)]"
  },
  {
    id: "clone-voice",
    title: "Cloner une voix avec ElevenLabs",
    description: "Reproduisez fidèlement une voix ou créez des narrations professionnelles.",
    icon: <Mic className="h-8 w-8" />,
    difficulty: "Avancé",
    duration: "20 min",
    youtubeUrl: "https://www.youtube.com/watch?v=8RvYwSJKRiQ",
    steps: [
      "Configurez votre clé API ElevenLabs",
      "Uploadez un échantillon audio de la voix à cloner (minimum 1 minute)",
      "Attendez que le modèle soit entraîné",
      "Testez la voix clonée avec un texte court",
      "Ajustez les paramètres de stabilité et de clarté",
      "Exportez vos narrations en MP3 ou WAV"
    ],
    colorClass: "text-[hsl(174,100%,50%)]",
    bgClass: "bg-[hsl(174,100%,50%)]"
  },
  {
    id: "create-3d",
    title: "Créer des modèles 3D",
    description: "Générez des objets 3D prêts pour les jeux ou l'impression avec l'IA.",
    icon: <Box className="h-8 w-8" />,
    difficulty: "Avancé",
    duration: "25 min",
    youtubeUrl: "https://www.youtube.com/watch?v=x60s1xw2zIE",
    steps: [
      "Rendez-vous dans la section 3D",
      "Choisissez entre génération depuis texte ou image",
      "Décrivez l'objet avec précision (matériaux, style, détails)",
      "Sélectionnez la qualité du mesh",
      "Exportez en GLB, OBJ ou FBX",
      "Importez dans Blender ou votre moteur de jeu"
    ],
    colorClass: "text-[hsl(142,76%,50%)]",
    bgClass: "bg-[hsl(142,76%,50%)]"
  },
  {
    id: "retouch-images",
    title: "Retoucher des images",
    description: "Améliorez, agrandissez et transformez vos images existantes.",
    icon: <Wand2 className="h-8 w-8" />,
    difficulty: "Intermédiaire",
    duration: "15 min",
    youtubeUrl: "https://www.youtube.com/watch?v=5fB5v3XGzCo",
    steps: [
      "Accédez à la section RETOUCHE",
      "Uploadez l'image à modifier",
      "Choisissez l'action: upscale, remove background, enhance",
      "Ajustez les paramètres selon vos besoins",
      "Prévisualisez le résultat",
      "Téléchargez l'image optimisée"
    ],
    colorClass: "text-[hsl(174,100%,50%)]",
    bgClass: "bg-[hsl(174,100%,50%)]"
  },
  {
    id: "use-llms",
    title: "Utiliser les LLMs efficacement",
    description: "Maîtrisez les modèles de langage pour la rédaction, le code et plus encore.",
    icon: <MessageSquare className="h-8 w-8" />,
    difficulty: "Débutant",
    duration: "8 min",
    youtubeUrl: "https://www.youtube.com/watch?v=E4g2HksxRxY",
    steps: [
      "Naviguez vers la section LLMS",
      "Comparez les différents modèles (GPT-4, Claude, Gemini...)",
      "Choisissez selon votre besoin (créativité, précision, vitesse)",
      "Structurez vos questions clairement",
      "Utilisez le contexte pour des réponses plus pertinentes"
    ],
    colorClass: "text-[hsl(320,100%,60%)]",
    bgClass: "bg-[hsl(320,100%,60%)]"
  },
  {
    id: "prompting-techniques",
    title: "Techniques de prompting avancées",
    description: "Découvrez les secrets des experts pour obtenir des résultats exceptionnels.",
    icon: <Sparkles className="h-8 w-8" />,
    difficulty: "Avancé",
    duration: "20 min",
    youtubeUrl: "https://www.youtube.com/watch?v=T9aRN5JkmL8",
    steps: [
      "Apprenez la structure d'un prompt efficace",
      "Utilisez des modificateurs de style (cinématique, photoréaliste...)",
      "Maîtrisez les prompts négatifs pour exclure ce que vous ne voulez pas",
      "Explorez les techniques de pondération des mots-clés",
      "Combinez plusieurs concepts avec des séparateurs",
      "Sauvegardez vos meilleurs prompts pour les réutiliser"
    ],
    colorClass: "text-[hsl(25,100%,55%)]",
    bgClass: "bg-[hsl(25,100%,55%)]"
  }
];

const difficultyColors = {
  "Débutant": "bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30",
  "Intermédiaire": "bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] border-[hsl(45,100%,55%)]/30",
  "Avancé": "bg-[hsl(0,85%,60%)]/20 text-[hsl(0,85%,60%)] border-[hsl(0,85%,60%)]/30"
};

const Tutorials = () => {
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);

  const toggleTutorial = (id: string) => {
    setExpandedTutorial(expandedTutorial === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(174,100%,50%)] to-[hsl(142,76%,50%)] glow-cyan">
              <GraduationCap className="h-10 w-10 text-black" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-black gradient-text-cyan text-glow-cyan tracking-wider">
                TUTORIELS
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                APPRENEZ À MAÎTRISER TOUTES LES FONCTIONNALITÉS D'AIONE
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-8">
            <Card className="px-6 py-4 panel-3d border-[hsl(142,76%,50%)]/30">
              <div className="flex items-center gap-3">
                <Star className="h-7 w-7 text-[hsl(142,76%,50%)]" />
                <span className="font-display text-3xl font-black text-[hsl(142,76%,50%)]">
                  {tutorials.filter(t => t.difficulty === "Débutant").length}
                </span>
                <span className="text-base text-muted-foreground font-display">DÉBUTANT</span>
              </div>
            </Card>
            <Card className="px-6 py-4 panel-3d border-[hsl(45,100%,55%)]/30">
              <div className="flex items-center gap-3">
                <Star className="h-7 w-7 text-[hsl(45,100%,55%)]" />
                <span className="font-display text-3xl font-black text-[hsl(45,100%,55%)]">
                  {tutorials.filter(t => t.difficulty === "Intermédiaire").length}
                </span>
                <span className="text-base text-muted-foreground font-display">INTERMÉDIAIRE</span>
              </div>
            </Card>
            <Card className="px-6 py-4 panel-3d border-[hsl(0,85%,60%)]/30">
              <div className="flex items-center gap-3">
                <Star className="h-7 w-7 text-[hsl(0,85%,60%)]" />
                <span className="font-display text-3xl font-black text-[hsl(0,85%,60%)]">
                  {tutorials.filter(t => t.difficulty === "Avancé").length}
                </span>
                <span className="text-base text-muted-foreground font-display">AVANCÉ</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tutorials.map((tutorial, index) => (
            <Card
              key={tutorial.id}
              className={cn(
                "panel-3d p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer",
                expandedTutorial === tutorial.id && "border-[hsl(var(--primary))]/50"
              )}
              onClick={() => toggleTutorial(tutorial.id)}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-xl shrink-0",
                  `${tutorial.bgClass}/20`
                )}>
                  <span className={tutorial.colorClass}>{tutorial.icon}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-xs text-muted-foreground">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <Badge className={cn("text-xs font-display", difficultyColors[tutorial.difficulty])}>
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  <h3 className={cn("font-display text-xl font-bold", tutorial.colorClass)}>
                    {tutorial.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <Clock className="h-4 w-4" />
                  <span className="font-display text-sm">{tutorial.duration}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {tutorial.description}
              </p>

              {/* Expanded Content */}
              {expandedTutorial === tutorial.id && (
                <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2">
                  <h4 className="font-display text-sm font-bold mb-3 text-[hsl(174,100%,50%)]">
                    ÉTAPES DU TUTORIEL
                  </h4>
                  <ol className="space-y-2 mb-6">
                    {tutorial.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3 text-sm">
                        <span className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full shrink-0 text-xs font-bold",
                          `${tutorial.bgClass}/20 ${tutorial.colorClass}`
                        )}>
                          {stepIndex + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link 
                      to={`/tutorials/${tutorial.id}`}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button 
                        className="w-full gap-2 font-display transition-all duration-200 hover:scale-105 btn-3d-green"
                      >
                        <Play className="h-4 w-4" />
                        COMMENCER
                      </Button>
                    </Link>
                    {tutorial.youtubeUrl && (
                      <a 
                        href={tutorial.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button 
                          variant="outline"
                          className="gap-2 btn-3d font-display transition-all duration-200 hover:scale-105"
                        >
                          <Youtube className="h-4 w-4 text-[hsl(0,85%,60%)]" />
                          VIDÉO
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Expand indicator */}
              {expandedTutorial !== tutorial.id && (
                <div className="flex items-center justify-center mt-2">
                  <ChevronRight className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    expandedTutorial === tutorial.id && "rotate-90"
                  )} />
                </div>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Tutorials;
