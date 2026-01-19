import { useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { aiModels } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { AppTileCard } from "@/components/AppTileCard";
import { APIKeyModal } from "@/components/APIKeyModal";
import { PromoBanner } from "@/components/PromptBanner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Video, Image, Wand2, Flame, Music, MessageSquare, Box, Check } from "lucide-react";

const categoryConfigs = [
  {
    id: "activated",
    label: "APPLIS ACTIVÉES",
    icon: <Check className="h-5 w-5" />,
    color: "text-green-500",
    borderColor: "border-green-500/20",
  },
  {
    id: "videos",
    label: "VIDÉOS",
    icon: <Video className="h-5 w-5" />,
    color: "text-purple-500",
    borderColor: "border-purple-500/20",
  },
  {
    id: "images",
    label: "IMAGES",
    icon: <Image className="h-5 w-5" />,
    color: "text-pink-500",
    borderColor: "border-pink-500/20",
  },
  {
    id: "retouch",
    label: "RETOUCHES",
    icon: <Wand2 className="h-5 w-5" />,
    color: "text-cyan-500",
    borderColor: "border-cyan-500/20",
  },
  {
    id: "adult",
    label: "CONTENU ADULTE",
    icon: <Flame className="h-5 w-5" />,
    color: "text-red-500",
    borderColor: "border-red-500/20",
  },
  {
    id: "audio",
    label: "MUSIQUE",
    icon: <Music className="h-5 w-5" />,
    color: "text-yellow-500",
    borderColor: "border-yellow-500/20",
  },
  {
    id: "llms",
    label: "CHAT IA",
    icon: <MessageSquare className="h-5 w-5" />,
    color: "text-blue-500",
    borderColor: "border-blue-500/20",
  },
];

const Index = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState("");

  const allModels = useMemo(() => getModelsWithStatus(aiModels), [getModelsWithStatus]);

  const stats = useMemo(
    () => ({
      total: allModels.length,
      free: allModels.filter((m) => m.isFree).length,
      catCount: new Set(allModels.map((m) => m.category)).size,
    }),
    [allModels],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="ml-[300px] p-8">
        {/* HERO ORIGINAL RESTAURE */}
        <header className="text-center mb-12">
          <h1 className="font-display text-6xl font-black gradient-text-pink text-glow-pink mb-2 uppercase">AIONE</h1>
          <p className="font-display text-sm text-cyan-500 tracking-[0.5em] mb-8">AI GATEWAY</p>

          <div className="flex justify-center gap-12 border-y border-white/5 py-6">
            <div className="text-center">
              <p className="text-3xl font-black">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Modèles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-500">{stats.free}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Gratuits</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-pink-500">{stats.catCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Catégories</p>
            </div>
          </div>
        </header>

        <PromoBanner />

        {/* GRID DYNAMIQUE AVEC TAILLE DE CARTE ORIGINALE */}
        <div className="space-y-12">
          {categoryConfigs.map((cat) => {
            const models = allModels.filter((m) =>
              cat.id === "activated" ? m.apiStatus === "active" || m.isFree : m.category === cat.id,
            );
            if (models.length === 0) return null;

            return (
              <section key={cat.id} className={cn("p-6 rounded-3xl border-2 bg-white/[0.02]", cat.borderColor)}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={cat.color}>{cat.icon}</span>
                  <h2 className={cn("font-display text-xl font-black uppercase tracking-tighter", cat.color)}>
                    {cat.label}
                  </h2>
                  <Badge variant="outline" className={cn("font-black border-white/10", cat.color)}>
                    {models.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {models.map((model) => (
                    <AppTileCard
                      key={model.id}
                      model={model}
                      onOpenAPIKeyModal={(name: string) => {
                        setSelectedApiKeyName(name);
                        setApiKeyModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <APIKeyModal isOpen={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} apiKeyName={selectedApiKeyName} />
    </div>
  );
};

export default Index;
