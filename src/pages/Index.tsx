import { useState, useMemo } from "react";
import { aiModels } from "@/data/aiModels";
import { Sidebar } from "@/components/Sidebar";
import { FloatingIcons } from "@/components/FloatingIcons";
import { HeroSection } from "@/components/HeroSection";
import { CategoryCards } from "@/components/CategoryCards";
import { FreeModelsGrid } from "@/components/FreeModelsGrid";

const Index = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = aiModels.length;
    const free = aiModels.filter((m) => m.isFree).length;
    const categoriesSet = new Set(aiModels.map((m) => m.category));
    return { total, free, categories: categoriesSet.size };
  }, []);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; free: number }> = {};
    
    aiModels.forEach((model) => {
      const cat = model.category;
      if (!counts[cat]) {
        counts[cat] = { total: 0, free: 0 };
      }
      counts[cat].total++;
      if (model.isFree) {
        counts[cat].free++;
      }
    });
    
    return counts;
  }, []);

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Floating Icons Background */}
      <FloatingIcons />

      {/* Main Content */}
      <main className="ml-40 min-h-screen">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Hero Section */}
          <HeroSection 
            totalModels={stats.total} 
            freeModels={stats.free}
            categories={stats.categories}
          />

          {/* Category Cards */}
          <CategoryCards categoryCounts={categoryCounts} />

          {/* Free Models Grid */}
          <FreeModelsGrid 
            models={aiModels}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 ml-0">
          <div className="container mx-auto max-w-6xl px-4 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-display gradient-text-pink">AIONE</span> - AI Gateway • Tous droits réservés © 2025
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
