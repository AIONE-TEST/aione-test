import { useState } from "react";
import { Image, Video, Music, Play, Maximize2, Download, Copy, X, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface GenerationItem {
  id: string;
  type: "image" | "video" | "audio" | "3d" | "retouch" | "chat";
  prompt: string | null;
  thumbnail_url: string | null;
  result_url: string | null;
  created_at: string;
  model_name: string | null;
  aspect_ratio: string | null;
}

interface GenerationGalleryProps {
  items: GenerationItem[];
  onDelete?: (id: string) => void;
  maxHeight?: string;
}

export function GenerationGallery({ items, onDelete, maxHeight = "500px" }: GenerationGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<GenerationItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = async (url: string | null, filename: string) => {
    if (!url) return;
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      toast({ title: "Téléchargement lancé !" });
    } catch (e) {
      toast({ title: "Erreur de téléchargement", variant: "destructive" });
    }
  };

  const handleCopyUrl = (url: string | null) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast({ title: "URL copiée !" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "audio": return <Music className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video": return "bg-[hsl(280,100%,65%)]/80";
      case "audio": return "bg-[hsl(25,100%,55%)]/80";
      default: return "bg-[hsl(320,100%,60%)]/80";
    }
  };

  return (
    <>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-display text-lg text-muted-foreground">AUCUNE GÉNÉRATION</p>
          <p className="text-sm text-muted-foreground mt-1">Vos créations apparaîtront ici</p>
        </div>
      ) : (
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto pr-2"
          style={{ maxHeight }}
        >
          {items.map((item) => (
            <Card 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "relative rounded-xl overflow-hidden cursor-pointer group",
                "border-2 hover:scale-[1.02] transition-all duration-200",
                "hover:shadow-lg hover:shadow-[hsl(var(--primary))]/20",
                item.type === "image" || item.type === "retouch" 
                  ? "border-[hsl(320,100%,60%)]/30 hover:border-[hsl(320,100%,60%)]/60" 
                  : item.type === "video" 
                    ? "border-[hsl(280,100%,65%)]/30 hover:border-[hsl(280,100%,65%)]/60"
                    : "border-[hsl(25,100%,55%)]/30 hover:border-[hsl(25,100%,55%)]/60",
                item.aspect_ratio === "9:16" ? "aspect-[9/16]" :
                item.aspect_ratio === "16:9" ? "aspect-video" :
                item.aspect_ratio === "4:3" ? "aspect-[4/3]" :
                "aspect-square"
              )}
            >
              {/* Thumbnail */}
              {item.thumbnail_url || item.result_url ? (
                item.type === "audio" ? (
                  <div className="w-full h-full bg-gradient-to-br from-[hsl(25,100%,55%)]/20 to-[hsl(45,100%,55%)]/20 flex flex-col items-center justify-center">
                    <Music className="h-10 w-10 text-[hsl(25,100%,55%)]" />
                    <span className="text-xs text-muted-foreground mt-2">Audio</span>
                  </div>
                ) : (
                  <img 
                    src={item.thumbnail_url || item.result_url || ""} 
                    alt={item.prompt || "Generated"} 
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {getTypeIcon(item.type)}
                </div>
              )}

              {/* Type badge */}
              <Badge className={cn(
                "absolute top-2 left-2 text-[10px] px-2 py-0.5 font-display font-bold",
                getTypeColor(item.type)
              )}>
                {item.type.toUpperCase()}
              </Badge>

              {/* Video play overlay */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-6 w-6 text-black ml-1" />
                  </div>
                </div>
              )}

              {/* Hover info */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-[10px] text-white/90 line-clamp-2">
                  {item.prompt || "Sans prompt"}
                </p>
                <p className="text-[9px] text-white/60 mt-1">
                  {formatDate(item.created_at)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden panel-3d">
          {selectedItem && (
            <>
              <DialogHeader className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeColor(selectedItem.type)}>
                      {selectedItem.type.toUpperCase()}
                    </Badge>
                    <DialogTitle className="font-display text-lg">
                      {selectedItem.model_name || "Génération"}
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyUrl(selectedItem.result_url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(
                        selectedItem.result_url, 
                        `${selectedItem.type}-${selectedItem.id}.${selectedItem.type === 'video' ? 'mp4' : selectedItem.type === 'audio' ? 'mp3' : 'png'}`
                      )}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsFullscreen(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => {
                          onDelete(selectedItem.id);
                          setSelectedItem(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {/* Media Content */}
              <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[60vh]">
                {selectedItem.type === "video" && selectedItem.result_url ? (
                  <video 
                    src={selectedItem.result_url} 
                    controls 
                    autoPlay
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : selectedItem.type === "audio" && selectedItem.result_url ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <Music className="h-20 w-20 text-[hsl(25,100%,55%)] mb-4" />
                    <audio src={selectedItem.result_url} controls className="w-full max-w-md" />
                  </div>
                ) : selectedItem.result_url ? (
                  <img 
                    src={selectedItem.result_url} 
                    alt={selectedItem.prompt || "Generated"} 
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground">Média non disponible</div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 border-t border-border space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">Prompt:</span>
                  <p className="text-sm">{selectedItem.prompt || "Aucun prompt"}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>📅 {formatDate(selectedItem.created_at)}</span>
                  {selectedItem.aspect_ratio && <span>📐 {selectedItem.aspect_ratio}</span>}
                  {selectedItem.model_name && <span>🤖 {selectedItem.model_name}</span>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Modal */}
      {isFullscreen && selectedItem && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          
          {selectedItem.type === "video" && selectedItem.result_url ? (
            <video 
              src={selectedItem.result_url} 
              controls 
              autoPlay
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : selectedItem.result_url ? (
            <img 
              src={selectedItem.result_url} 
              alt={selectedItem.prompt || "Generated"} 
              className="max-w-full max-h-full object-contain"
            />
          ) : null}
        </div>
      )}
    </>
  );
}
