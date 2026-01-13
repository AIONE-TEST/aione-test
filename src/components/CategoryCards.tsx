import { 
  MessageSquare, 
  Video, 
  Image, 
  Wand2, 
  Music, 
  Box, 
  LayoutGrid,
  AppWindow,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AICategory } from "@/data/aiModels";

interface CategoryInfo {
  id: AICategory | string;
  title: string;
  description: string;
  icon: React.ReactNode;
  freeCount: number;
  totalCount: number;
  color: string;
  bgColor: string;
  path: string;
}

interface CategoryCardsProps {
  categoryCounts: Record<string, { total: number; free: number }>;
}

export function CategoryCards({ categoryCounts }: CategoryCardsProps) {
  const categories: CategoryInfo[] = [
    {
      id: "llms",
      title: "Chat / LLMs",
      description: "GPT-5, Claude 4, Gemini Ultra et modèles conversationnels",
      icon: <MessageSquare className="h-6 w-6" />,
      freeCount: categoryCounts.llms?.free || 0,
      totalCount: categoryCounts.llms?.total || 0,
      color: "text-[hsl(320,100%,60%)]",
      bgColor: "bg-[hsl(320,100%,60%)]",
      path: "/chat"
    },
    {
      id: "videos",
      title: "Génération Vidéos",
      description: "Runway Gen-3, Sora, Kling AI et générateurs vidéo",
      icon: <Video className="h-6 w-6" />,
      freeCount: categoryCounts.videos?.free || 0,
      totalCount: categoryCounts.videos?.total || 0,
      color: "text-[hsl(280,100%,65%)]",
      bgColor: "bg-[hsl(280,100%,65%)]",
      path: "/?category=videos"
    },
    {
      id: "images",
      title: "Génération Images",
      description: "DALL-E 3, Midjourney, FLUX Pro et création d'images",
      icon: <Image className="h-6 w-6" />,
      freeCount: categoryCounts.images?.free || 0,
      totalCount: categoryCounts.images?.total || 0,
      color: "text-[hsl(320,100%,60%)]",
      bgColor: "bg-[hsl(320,100%,60%)]",
      path: "/?category=images"
    },
    {
      id: "retouch",
      title: "Retouche Photo/Vidéo",
      description: "Topaz, Adobe Firefly, Runway et outils de retouche",
      icon: <Wand2 className="h-6 w-6" />,
      freeCount: categoryCounts.retouch?.free || 0,
      totalCount: categoryCounts.retouch?.total || 0,
      color: "text-[hsl(174,100%,50%)]",
      bgColor: "bg-[hsl(174,100%,50%)]",
      path: "/?category=retouch"
    },
    {
      id: "audio",
      title: "Audio / Voix",
      description: "ElevenLabs, Suno, Udio et synthèse audio",
      icon: <Music className="h-6 w-6" />,
      freeCount: categoryCounts.audio?.free || 0,
      totalCount: categoryCounts.audio?.total || 0,
      color: "text-[hsl(45,100%,55%)]",
      bgColor: "bg-[hsl(45,100%,55%)]",
      path: "/?category=audio"
    },
    {
      id: "3d",
      title: "Génération 3D",
      description: "Meshy, Tripo AI et modélisation 3D automatique",
      icon: <Box className="h-6 w-6" />,
      freeCount: categoryCounts["3d"]?.free || 0,
      totalCount: categoryCounts["3d"]?.total || 0,
      color: "text-[hsl(142,76%,50%)]",
      bgColor: "bg-[hsl(142,76%,50%)]",
      path: "/?category=3d"
    },
    {
      id: "apis",
      title: "API Collection",
      description: "Bibliothèque complète de 200+ APIs AI",
      icon: <LayoutGrid className="h-6 w-6" />,
      freeCount: 50,
      totalCount: 200,
      color: "text-[hsl(210,100%,60%)]",
      bgColor: "bg-[hsl(210,100%,60%)]",
      path: "/apis"
    },
    {
      id: "apps",
      title: "Apps NO-CODE",
      description: "Créez des applications sans coder avec l'AI",
      icon: <AppWindow className="h-6 w-6" />,
      freeCount: 0,
      totalCount: 0,
      color: "text-[hsl(25,100%,55%)]",
      bgColor: "bg-[hsl(25,100%,55%)]",
      path: "/apps"
    },
    {
      id: "perso",
      title: "Espace Personnel",
      description: "Vos générations, favoris et paramètres",
      icon: <User className="h-6 w-6" />,
      freeCount: 0,
      totalCount: 0,
      color: "text-[hsl(174,100%,50%)]",
      bgColor: "bg-[hsl(174,100%,50%)]",
      path: "/profile"
    },
  ];

  return (
    <section className="py-16">
      <div className="mb-8 text-center">
        <span className="text-sm font-medium text-muted-foreground">9 Catégories Complètes</span>
        <h2 className="mt-2 font-display text-3xl font-bold">Explorez l'Univers AI</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          De la génération d'images aux modèles de langage, en passant par la création audio et 3D. 
          Tous les outils AI réunis en un seul endroit.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} to={category.path}>
            <Card className="group h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-[hsl(174,100%,50%)/0.3] hover:bg-card/70">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg ${category.bgColor}/20 p-2 ${category.color}`}>
                    {category.icon}
                  </div>
                  {category.freeCount > 0 && (
                    <div className="text-right">
                      <span className="text-sm font-semibold text-[hsl(142,76%,50%)]">
                        {category.freeCount} Gratuits
                      </span>
                    </div>
                  )}
                </div>
                {category.totalCount > 0 && (
                  <p className="text-xs text-muted-foreground">{category.totalCount} modèles</p>
                )}
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2 text-lg group-hover:text-[hsl(174,100%,50%)] transition-colors">
                  {category.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
