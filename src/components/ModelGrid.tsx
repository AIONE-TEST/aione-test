import { AIModel } from "@/data/aiModels";
import { AppTileCard } from "./AppTileCard";
import { useState } from "react";
import { APIKeyModal } from "./APIKeyModal";

export function ModelGrid({ models }: { models: AIModel[] }) {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState("");

  return (
    <>
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
      <APIKeyModal isOpen={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} apiKeyName={selectedApiKeyName} />
    </>
  );
}
