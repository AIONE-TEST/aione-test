import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Box, 
  ArrowLeft, 
  Lightbulb,
  Upload,
  Settings,
  Download,
  ArrowRight,
  Layers,
  Rotate3D
} from "lucide-react";

const Create3D = () => {
  const steps = [
    {
      number: 1,
      title: "Accédez à la section 3D",
      description: "Cliquez sur 'APPLIS IA' puis filtrez par catégorie '3D' pour voir les modèles disponibles.",
      details: [
        "Meshy AI - Texte vers 3D et Image vers 3D",
        "Luma Genie - Spécialisé dans les assets de jeux",
        "Tripo AI - Modèles haute qualité"
      ],
      icon: <Box className="h-6 w-6" />
    },
    {
      number: 2,
      title: "Choisissez le mode de génération",
      description: "Text-to-3D crée un modèle à partir de votre description. Image-to-3D convertit une image 2D.",
      details: [
        "Text-to-3D: Idéal pour les concepts abstraits ou créatifs",
        "Image-to-3D: Parfait pour reproduire des objets existants",
        "Le mode Image-to-3D nécessite une image de bonne qualité"
      ],
      icon: <Layers className="h-6 w-6" />,
      tip: "Pour Image-to-3D, utilisez une image avec un fond neutre et un éclairage uniforme"
    },
    {
      number: 3,
      title: "Décrivez votre objet 3D",
      description: "Soyez précis sur la forme, les matériaux et le style.",
      details: [
        "Forme: décrivez la géométrie (sphérique, angulaire, organique...)",
        "Matériaux: métal, bois, plastique, verre, pierre...",
        "Style: réaliste, low-poly, cartoon, steampunk...",
        "Détails: ornements, textures, usure, patine..."
      ],
      icon: <Rotate3D className="h-6 w-6" />
    },
    {
      number: 4,
      title: "Configurez la qualité",
      description: "Ajustez les paramètres de qualité du mesh et des textures.",
      details: [
        "Low-poly: Rapide, idéal pour les jeux mobiles",
        "Standard: Bon équilibre qualité/performance",
        "High-poly: Maximum de détails, pour le rendu cinématique"
      ],
      icon: <Settings className="h-6 w-6" />
    },
    {
      number: 5,
      title: "Générez et prévisualisez",
      description: "La génération prend 1-5 minutes. Vous pouvez prévisualiser le résultat en 3D.",
      details: [
        "Rotation 360° pour inspecter le modèle",
        "Vérifiez les détails et la topologie",
        "Régénérez si nécessaire avec un prompt ajusté"
      ],
      icon: <Rotate3D className="h-6 w-6" />
    },
    {
      number: 6,
      title: "Exportez votre modèle",
      description: "Téléchargez dans le format adapté à votre utilisation.",
      details: [
        "GLB/GLTF: Format universel, idéal pour le web",
        "OBJ: Compatible avec tous les logiciels 3D",
        "FBX: Préféré pour les moteurs de jeux (Unity, Unreal)"
      ],
      icon: <Download className="h-6 w-6" />,
      tip: "GLB est le meilleur choix pour la plupart des usages car il inclut textures et animations"
    }
  ];

  const examplePrompts = [
    {
      title: "Asset de jeu",
      prompt: "Épée médiévale fantastique avec lame en cristal bleu lumineux, garde en or avec dragon gravé, style RPG, prêt pour jeu vidéo"
    },
    {
      title: "Objet réaliste",
      prompt: "Tasse de café en céramique blanche avec anse, style minimaliste moderne, surface légèrement texturée, éclairage studio"
    },
    {
      title: "Personnage",
      prompt: "Robot steampunk avec engrenages apparents, corps en cuivre patiné, yeux lumineux verts, style victorien industriel"
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
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(142,76%,50%)] to-[hsl(174,100%,50%)] glow-green">
              <Box className="h-10 w-10 text-black" />
            </div>
            <div>
              <Badge className="mb-2 bg-[hsl(0,85%,60%)]/20 text-[hsl(0,85%,60%)] border-[hsl(0,85%,60%)]/30">
                Avancé • 25 min
              </Badge>
              <h1 className="font-display text-4xl font-black gradient-text-green text-glow-green tracking-wider">
                CRÉER DES MODÈLES 3D
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                Générez des objets 3D prêts pour les jeux ou l'impression
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 max-w-4xl mb-8">
          {steps.map((step) => (
            <Card key={step.number} className="panel-3d p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] shrink-0">
                  <span className="font-display text-2xl font-black">{step.number}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[hsl(142,76%,50%)]">{step.icon}</span>
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
        <h2 className="font-display text-2xl font-bold text-white mb-4">Exemples de prompts 3D</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-4xl mb-8">
          {examplePrompts.map((example, index) => (
            <Card key={index} className="panel-3d p-4">
              <h3 className="font-display font-bold text-[hsl(142,76%,50%)] mb-2">{example.title}</h3>
              <p className="text-xs text-muted-foreground italic">"{example.prompt}"</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="panel-3d p-6 max-w-4xl border-[hsl(142,76%,50%)]/30">
          <h3 className="font-display text-xl font-bold text-[hsl(142,76%,50%)] mb-4">
            🎮 Prêt à créer en 3D?
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/apps">
              <Button className="btn-3d-green gap-2">
                <Box className="h-4 w-4" />
                Voir les modèles 3D disponibles
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Create3D;
