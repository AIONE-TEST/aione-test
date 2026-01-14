import { useState, useEffect } from "react";
import { History, X, ExternalLink, Clock, Image, Video, Music } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface GenerationItem {
  id: string;
  type: string;
  model_name: string | null;
  prompt: string | null;
  result_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  credits_used: number | null;
}

interface GenerationHistoryProps {
  type?: "image" | "video" | "audio" | "retouch" | "all";
  className?: string;
  maxItems?: number;
}

export function GenerationHistory({ 
  type = "all", 
  className,
  maxItems = 10 
}: GenerationHistoryProps) {
  const [history, setHistory] = useState<GenerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GenerationItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [type]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("generation_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(maxItems);

      if (type !== "all") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching generation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (itemType: string) => {
    switch (itemType) {
      case "image":
      case "retouch":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Music className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <Card className={cn("panel-3d p-3", className)}>
        <div className="flex items-center gap-2 mb-2">
          <History className="h-4 w-4 text-[hsl(280,100%,65%)]" />
          <span className="font-display text-xs font-bold">HISTORIQUE RÉCENT</span>
        </div>
        <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
          Chargement...
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className={cn("panel-3d p-3", className)}>
        <div className="flex items-center gap-2 mb-2">
          <History className="h-4 w-4 text-[hsl(280,100%,65%)]" />
          <span className="font-display text-xs font-bold">HISTORIQUE RÉCENT</span>
        </div>
        <div className="text-center py-4 text-muted-foreground text-sm">
          Aucune génération récente
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("panel-3d p-3", className)}>
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-[hsl(280,100%,65%)]" />
        <span className="font-display text-xs font-bold">HISTORIQUE RÉCENT</span>
        <Badge className="ml-auto bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)] text-[10px]">
          {history.length} éléments
        </Badge>
      </div>

      <ScrollArea className="h-[120px]">
        <div className="flex gap-2 pb-2">
          {history.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex-shrink-0 w-20 cursor-pointer group relative",
                "rounded-lg overflow-hidden border border-border/50",
                "hover:border-[hsl(280,100%,65%)] transition-all duration-200"
              )}
              onClick={() => setSelectedItem(item)}
            >
              {/* Thumbnail */}
              <div className="relative h-16 bg-muted/50">
                {item.thumbnail_url || item.result_url ? (
                  <img
                    src={item.thumbnail_url || item.result_url || ""}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getTypeIcon(item.type)}
                  </div>
                )}
                <div className="absolute top-1 right-1">
                  <Badge className="text-[8px] px-1 py-0 bg-black/60">
                    {item.type}
                  </Badge>
                </div>
              </div>
              
              {/* Time */}
              <div className="p-1 text-center">
                <p className="text-[9px] text-muted-foreground truncate">
                  {formatDate(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Detail Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <Card 
            className="panel-3d max-w-lg w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(selectedItem.type)}
                <span className="font-display font-bold">{selectedItem.model_name || "Génération"}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSelectedItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {(selectedItem.thumbnail_url || selectedItem.result_url) && (
              <div className="rounded-lg overflow-hidden mb-4">
                {selectedItem.type === "video" ? (
                  <video 
                    src={selectedItem.result_url || ""} 
                    controls 
                    className="w-full"
                  />
                ) : (
                  <img
                    src={selectedItem.result_url || selectedItem.thumbnail_url || ""}
                    alt="Result"
                    className="w-full"
                  />
                )}
              </div>
            )}

            {selectedItem.prompt && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
                <p className="text-sm bg-muted/30 rounded p-2">{selectedItem.prompt}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(selectedItem.created_at)}
              </div>
              {selectedItem.credits_used && (
                <Badge variant="outline">{selectedItem.credits_used} crédits</Badge>
              )}
              {selectedItem.result_url && (
                <a 
                  href={selectedItem.result_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ouvrir
                </a>
              )}
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
