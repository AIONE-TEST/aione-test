import { useState, useMemo } from "react";
import { aiModels, AICategory, APIStatus } from "@/data/aiModels";
import { Header } from "@/components/Header";
import { ModelCard } from "@/components/ModelCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { StatusFilter } from "@/components/StatusFilter";
import { SearchBar } from "@/components/SearchBar";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<AICategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<APIStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredModels = useMemo(() => {
    return aiModels.filter((model) => {
      // Filter by category
      if (selectedCategory !== "all" && model.category !== selectedCategory) {
        return false;
      }

      // Filter by status
      if (selectedStatus !== "all" && model.apiStatus !== selectedStatus) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.provider.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Sort: favorites first, then free, then active
  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      // Favorites first
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      // Then free models
      if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;

      // Then active models
      if (a.apiStatus !== b.apiStatus) {
        const order = { free: 0, active: 1, inactive: 2 };
        return order[a.apiStatus] - order[b.apiStatus];
      }

      return 0;
    });
  }, [filteredModels, favorites]);

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  // Stats
  const stats = useMemo(() => {
    const total = aiModels.length;
    const free = aiModels.filter((m) => m.isFree).length;
    const categories = new Set(aiModels.map((m) => m.category)).size;
    return { total, free, categories };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Découvrez les meilleurs modèles IA</span>
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                Tous les modèles IA
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                en un seul endroit
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Explorez notre catalogue complet de modèles d'intelligence artificielle.
              Images, vidéos, audio, LLMs et plus encore.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
                <TrendingUp className="h-6 w-6 text-primary" />
                {stats.total}+
              </div>
              <p className="text-sm text-muted-foreground">Modèles</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
                <Zap className="h-6 w-6 text-green-500" />
                {stats.free}
              </div>
              <p className="text-sm text-muted-foreground">Gratuits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {stats.categories}
              </div>
              <p className="text-sm text-muted-foreground">Catégories</p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un modèle, provider..."
              />
            </div>
            <StatusFilter
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </div>
          
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </section>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {sortedModels.length} modèle{sortedModels.length > 1 ? "s" : ""} trouvé
            {sortedModels.length > 1 ? "s" : ""}
            {selectedCategory !== "all" && ` dans ${selectedCategory}`}
          </p>
        </div>

        {/* Models Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isFavorite={favorites.includes(model.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </section>

        {/* Empty State */}
        {sortedModels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Aucun modèle trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos filtres ou votre recherche.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>AI ONE - Votre portail vers l'intelligence artificielle</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
