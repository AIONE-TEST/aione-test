import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { getModelLogo } from "@/data/modelLogos";
import { AIModel } from "@/data/aiModels";

interface GenerationCanvasProps {
  selectedModel: AIModel | null;
  generatedContent?: string | null;
  isGenerating?: boolean;
  contentType?: "image" | "video" | "audio" | "3d";
}

export function GenerationCanvas({
  selectedModel,
  generatedContent,
  isGenerating = false,
  contentType = "image",
}: GenerationCanvasProps) {
  const [imageError, setImageError] = useState(false);

  if (isGenerating) {
    return (
      <div className="relative aspect-video w-full rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(174,100%,50%)]/5 via-transparent to-[hsl(320,100%,60%)]/5" />
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-[hsl(var(--primary))] animate-spin" />
            <div className="absolute inset-0 animate-pulse-glow">
              <Sparkles className="h-12 w-12 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Génération en cours...</p>
        </div>
      </div>
    );
  }

  if (generatedContent) {
    return (
      <div className="relative aspect-video w-full rounded-xl bg-muted/30 border border-border/50 overflow-hidden">
        {contentType === "image" && (
          <img
            src={generatedContent}
            alt="Generated content"
            className="w-full h-full object-contain"
          />
        )}
        {contentType === "video" && (
          <video
            src={generatedContent}
            controls
            className="w-full h-full object-contain"
          />
        )}
        {contentType === "audio" && (
          <div className="flex items-center justify-center h-full">
            <audio src={generatedContent} controls className="w-3/4" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(174,100%,50%)]/5 via-transparent to-[hsl(320,100%,60%)]/5" />
      
      <div className="flex flex-col items-center gap-4 z-10 text-center px-4">
        {selectedModel ? (
          <>
            <div className="h-16 w-16 rounded-xl bg-muted/50 border border-border/50 overflow-hidden p-2">
              {!imageError ? (
                <img
                  src={getModelLogo(selectedModel.id, selectedModel.provider)}
                  alt={selectedModel.provider}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground font-display">
                  {selectedModel.provider.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground">Prêt à générer</h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez un modèle et décrivez votre{" "}
                {contentType === "image" ? "image" : contentType === "video" ? "vidéo" : contentType === "audio" ? "audio" : "création"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] flex items-center justify-center glow-purple">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground">Prêt à générer</h3>
              <p className="text-sm text-muted-foreground">
                Sélectionnez un modèle et décrivez votre création
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
