import { useState, useEffect } from "react";
import { Clock, Play, Image, Music, Wand2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { cn } from "@/lib/utils";
import { MediaResultPopup } from "./MediaResultPopup";

interface GenerationHistoryItem {
  id: string;
  created_at: string;
  type: string;
  prompt: string | null;
  result_url: string | null;
  thumbnail_url: string | null;
  model_name: string | null;
}

interface GenerationHistoryThumbnailsProps {
  type: "video" | "image" | "audio" | "retouch" | "3d";
  className?: string;
}

const typeIcons = {
  video: Video,
  image: Image,
  audio: Music,
  retouch: Wand2,
  "3d": Wand2,
};

export const GenerationHistoryThumbnails = ({ type, className }: GenerationHistoryThumbnailsProps) => {
  const { session } = useSession();
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryItem | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.id) return;

      const { data, error } = await supabase
        .from("generation_history")
        .select("id, created_at, type, prompt, result_url, thumbnail_url, model_name")
        .eq("session_id", session.id)
        .eq("type", type)
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        setHistory(data);
      }
    };

    fetchHistory();
  }, [session?.id, type]);

  const handleThumbnailClick = (item: GenerationHistoryItem) => {
    setSelectedItem(item);
    setShowPopup(true);
  };

  const Icon = typeIcons[type] || Image;

  if (history.length === 0) {
    return (
      <div className={cn("panel-3d p-3", className)}>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-display text-xs font-bold text-muted-foreground">HISTORIQUE RÉCENT</span>
        </div>
        <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
          <Icon className="h-4 w-4 mr-2 opacity-50" />
          Aucune génération récente
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("panel-3d p-3", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span className="font-display text-xs font-bold">HISTORIQUE RÉCENT</span>
          <span className="text-xs text-muted-foreground ml-auto">{history.length} éléments</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group transition-all hover:ring-2 hover:ring-[hsl(var(--primary))] hover:scale-105"
              onClick={() => handleThumbnailClick(item)}
            >
              {item.thumbnail_url || item.result_url ? (
                <>
                  {type === "video" ? (
                    <div className="w-full h-full bg-gradient-to-br from-[hsl(280,100%,65%)]/30 to-[hsl(320,100%,60%)]/30 flex items-center justify-center">
                      <img
                        src={item.thumbnail_url || item.result_url || ""}
                        alt={item.prompt || "Génération"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : type === "audio" ? (
                    <div className="w-full h-full bg-gradient-to-br from-[hsl(25,100%,55%)]/30 to-[hsl(45,100%,55%)]/30 flex items-center justify-center">
                      <Music className="h-6 w-6 text-[hsl(25,100%,55%)]" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.thumbnail_url || item.result_url || ""}
                      alt={item.prompt || "Génération"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              {/* Hover overlay with prompt preview */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-1 flex flex-col justify-end">
                <p className="text-[10px] text-white line-clamp-2 leading-tight">
                  {item.prompt || "Sans prompt"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Result Popup */}
      <MediaResultPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        mediaUrl={selectedItem?.result_url}
        mediaType={type === "video" ? "video" : type === "audio" ? "audio" : "image"}
        prompt={selectedItem?.prompt || undefined}
        model={selectedItem?.model_name || undefined}
      />
    </>
  );
};
