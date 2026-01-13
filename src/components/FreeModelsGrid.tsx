import { AIModel } from "@/data/aiModels";
import { ModelCard } from "@/components/ModelCard";

interface FreeModelsGridProps {
  models: AIModel[];
  favorites: string[];
  onToggleFavorite: (modelId: string) => void;
}

export function FreeModelsGrid({ models, favorites, onToggleFavorite }: FreeModelsGridProps) {
  const freeModels = models.filter(m => m.isFree).slice(0, 8);

  if (freeModels.length === 0) return null;

  return (
    <section className="py-16">
      <div className="mb-8">
        <span className="text-sm font-medium text-[hsl(142,76%,50%)]">100% Gratuit</span>
        <h2 className="mt-2 font-display text-3xl font-bold">Modèles AI Gratuits</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Commencez à créer immédiatement avec nos modèles gratuits les plus puissants. 
          Aucune carte de crédit requise.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {freeModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isFavorite={favorites.includes(model.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
