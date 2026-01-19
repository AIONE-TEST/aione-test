import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Key, 
  ArrowLeft, 
  ExternalLink,
  Lightbulb,
  Shield,
  Copy,
  CheckCircle,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

const AddApiKey = () => {
  const providers = [
    {
      name: "OpenAI",
      description: "GPT-4, DALL-E 3, Whisper",
      url: "https://platform.openai.com/api-keys",
      color: "hsl(142,76%,50%)"
    },
    {
      name: "Anthropic",
      description: "Claude 3, Claude 3.5 Sonnet",
      url: "https://console.anthropic.com/account/keys",
      color: "hsl(25,100%,55%)"
    },
    {
      name: "Replicate",
      description: "FLUX, Stable Diffusion, Kling",
      url: "https://replicate.com/account/api-tokens",
      color: "hsl(280,100%,65%)"
    },
    {
      name: "ElevenLabs",
      description: "Text-to-Speech, Voice Cloning",
      url: "https://elevenlabs.io/app/settings/api-keys",
      color: "hsl(320,100%,60%)"
    },
    {
      name: "Stability AI",
      description: "Stable Diffusion 3, SDXL",
      url: "https://platform.stability.ai/account/keys",
      color: "hsl(174,100%,50%)"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Accédez à la section API KEYS",
      description: "Cliquez sur 'COMPTE' dans la sidebar, puis sur l'onglet 'Clés API' pour voir la liste des services configurables.",
      icon: <Key className="h-6 w-6" />
    },
    {
      number: 2,
      title: "Choisissez un service à configurer",
      description: "Identifiez le service dont vous avez besoin (OpenAI pour GPT-4, Replicate pour les images, etc.).",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      number: 3,
      title: "Obtenez votre clé API",
      description: "Cliquez sur le lien du fournisseur pour créer un compte et générer votre clé API personnelle.",
      icon: <ExternalLink className="h-6 w-6" />
    },
    {
      number: 4,
      title: "Copiez et collez votre clé",
      description: "Copiez la clé générée et collez-la dans le champ correspondant sur AIONE. Validez pour activer le service.",
      icon: <Copy className="h-6 w-6" />
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
              <Key className="h-10 w-10 text-black" />
            </div>
            <div>
              <Badge className="mb-2 bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30">
                Débutant • 3 min
              </Badge>
              <h1 className="font-display text-4xl font-black gradient-text-yellow text-glow-yellow tracking-wider">
                AJOUTER UNE CLÉ API
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                Configurez vos clés API pour débloquer les modèles premium
              </p>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <Card className="panel-3d p-4 mb-8 max-w-4xl border-[hsl(45,100%,55%)]/30 bg-[hsl(45,100%,55%)]/5">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-[hsl(45,100%,55%)] shrink-0" />
            <div>
              <h4 className="font-display font-bold text-[hsl(45,100%,55%)] mb-1">Sécurité des clés API</h4>
              <p className="text-sm text-muted-foreground">
                Vos clés API sont stockées de manière sécurisée et chiffrée. Ne partagez jamais vos clés avec d'autres personnes. 
                Chaque fournisseur vous permet de révoquer et régénérer vos clés si nécessaire.
              </p>
            </div>
          </div>
        </Card>

        {/* Steps */}
        <div className="space-y-4 max-w-4xl mb-8">
          {steps.map((step, index) => (
            <Card key={step.number} className="panel-3d p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)] shrink-0">
                  <span className="font-display text-xl font-black">{step.number}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[hsl(45,100%,55%)]">{step.icon}</span>
                    <h3 className="font-display text-lg font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Providers List */}
        <h2 className="font-display text-2xl font-bold text-white mb-4">Fournisseurs disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mb-8">
          {providers.map((provider) => (
            <Card key={provider.name} className="panel-3d p-4 hover:scale-[1.02] transition-transform">
              <h3 className="font-display font-bold text-white mb-1" style={{ color: provider.color }}>
                {provider.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">{provider.description}</p>
              <a 
                href={provider.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm hover:underline"
                style={{ color: provider.color }}
              >
                Obtenir une clé <ExternalLink className="h-3 w-3" />
              </a>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <Card className="panel-3d p-6 max-w-4xl border-[hsl(174,100%,50%)]/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-[hsl(174,100%,50%)] shrink-0" />
            <div>
              <h4 className="font-display font-bold text-[hsl(174,100%,50%)] mb-2">Conseils importants</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-[hsl(174,100%,50%)] shrink-0 mt-0.5" />
                  <span>La plupart des fournisseurs offrent des crédits gratuits pour commencer</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-[hsl(174,100%,50%)] shrink-0 mt-0.5" />
                  <span>Vérifiez les tarifs et limites de chaque API avant de l'utiliser intensivement</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-[hsl(174,100%,50%)] shrink-0 mt-0.5" />
                  <span>Configurez des alertes de facturation pour éviter les surprises</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AddApiKey;
