import { useState, useMemo } from "react";
import { 
  History, Upload, Image, Video, Music, MessageSquare, 
  ExternalLink, Trash2, FolderOpen, ChevronDown, ChevronUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  type: "image" | "video" | "audio" | "chat";
  url?: string;
  thumbnail?: string;
  prompt?: string;
  model?: string;
  modelLogo?: string;
  createdAt: Date;
  isUploaded?: boolean;
}

interface MediaHistoryPanelProps {
  category: string;
  currentMedia?: string | null;
  onSelectMedia?: (media: MediaItem) => void;
  onPreviewMedia?: (media: MediaItem) => void;
  className?: string;
}

// Données de démo
const mockGeneratedMedia: MediaItem[] = [
  { id: "1", type: "image", url: "https://placehold.co/512x512/1a1a2e/00d4aa?text=Gen1", createdAt: new Date(Date.now() - 3600000), model: "FLUX.1", prompt: "Paysage fantastique" },
  { id: "2", type: "video", url: "https://placehold.co/512x288/1a1a2e/ff6b9d?text=Video1", createdAt: new Date(Date.now() - 7200000), model: "Runway Gen-3", prompt: "Animation fluide" },
  { id: "3", type: "image", url: "https://placehold.co/512x512/1a1a2e/a855f7?text=Gen2", createdAt: new Date(Date.now() - 10800000), model: "Midjourney", prompt: "Portrait artistique" },
  { id: "4", type: "audio", url: "#", createdAt: new Date(Date.now() - 14400000), model: "Suno AI", prompt: "Musique épique" },
  { id: "5", type: "chat", modelLogo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg", createdAt: new Date(Date.now() - 18000000), model: "GPT-4o" },
];

const mockUploadedMedia: MediaItem[] = [
  { id: "u1", type: "image", url: "https://placehold.co/512x512/2a2a3e/00d4aa?text=Upload1", createdAt: new Date(Date.now() - 86400000), isUploaded: true },
  { id: "u2", type: "video", url: "https://placehold.co/512x288/2a2a3e/ff6b9d?text=Upload2", createdAt: new Date(Date.now() - 172800000), isUploaded: true },
];

const typeIcons = {
  image: <Image className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
  audio: <Music className="h-3 w-3" />,
  chat: <MessageSquare className="h-3 w-3" />,
};

const typeColors = {
  image: "text-[hsl(320,100%,60%)]",
  video: "text-[hsl(280,100%,65%)]",
  audio: "text-[hsl(25,100%,55%)]",
  chat: "text-[hsl(45,100%,55%)]",
};

export function MediaHistoryPanel({ 
  category, 
  currentMedia, 
  onSelectMedia, 
  onPreviewMedia,
  className 
}: MediaHistoryPanelProps) {
  const [generatedOpen, setGeneratedOpen] = useState(true);
  const [uploadedOpen, setUploadedOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Filtrer par catégorie
  const generatedMedia = useMemo(() => {
    return mockGeneratedMedia.filter(m => {
      if (category === "videos") return m.type === "video";
      if (category === "images") return m.type === "image";
      if (category === "audio") return m.type === "audio";
      if (category === "llms") return m.type === "chat";
      return true;
    });
  }, [category]);

  const uploadedMedia = useMemo(() => {
    return mockUploadedMedia.filter(m => {
      if (category === "videos") return m.type === "video";
      if (category === "images" || category === "retouch") return m.type === "image";
      return true;
    });
  }, [category]);

  const isCurrentMedia = (url?: string) => url && currentMedia === url;

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "< 1h";
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  };

  const renderMediaItem = (item: MediaItem) => {
    const isCurrent = isCurrentMedia(item.url);
    
    return (
      <div
        key={item.id}
        className={cn(
          "relative group rounded-lg overflow-hidden cursor-pointer transition-all duration-200",
          "border-2",
          isCurrent 
            ? "border-[hsl(var(--primary))] opacity-50 cursor-not-allowed" 
            : "border-transparent hover:border-[hsl(var(--primary))]/50",
          "bg-black/20"
        )}
        onMouseEnter={() => !isCurrent && setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => !isCurrent && onSelectMedia?.(item)}
      >
        {/* Thumbnail */}
        <div className="aspect-square relative">
          {item.type === "chat" ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(45,100%,25%)]/30 to-[hsl(45,100%,15%)]/30">
              {item.modelLogo ? (
                <img src={item.modelLogo} alt={item.model} className="w-8 h-8 rounded-lg" />
              ) : (
                <MessageSquare className="h-8 w-8 text-[hsl(45,100%,55%)]" />
              )}
            </div>
          ) : item.type === "audio" ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(25,100%,25%)]/30 to-[hsl(25,100%,15%)]/30">
              <Music className="h-8 w-8 text-[hsl(25,100%,55%)]" />
            </div>
          ) : (
            <img 
              src={item.url || item.thumbnail} 
              alt="" 
              className="w-full h-full object-cover"
            />
          )}

          {/* Type badge */}
          <div className={cn(
            "absolute top-1 left-1 rounded px-1 py-0.5 bg-black/60",
            typeColors[item.type]
          )}>
            {typeIcons[item.type]}
          </div>

          {/* Time */}
          <div className="absolute bottom-1 right-1 text-[8px] font-display bg-black/60 px-1 rounded">
            {formatTime(item.createdAt)}
          </div>

          {/* Disabled overlay */}
          {isCurrent && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-[10px] font-display text-muted-foreground">ACTIF</span>
            </div>
          )}

          {/* Hover actions */}
          {hoveredItem === item.id && !isCurrent && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 animate-in fade-in duration-150">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 bg-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary))]/40"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewMedia?.(item);
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              {item.isUploaded && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-[hsl(0,100%,50%)]/20 hover:bg-[hsl(0,100%,50%)]/40"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3 w-3 text-[hsl(0,100%,60%)]" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Model name */}
        {item.model && (
          <div className="px-1.5 py-1 bg-black/40">
            <p className="text-[9px] font-display truncate text-muted-foreground">
              {item.model}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("panel-3d flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50 shrink-0">
        <History className="h-4 w-4 text-[hsl(var(--primary))]" />
        <span className="font-display text-sm font-bold">HISTORIQUE</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {/* Médias générés */}
          <Collapsible open={generatedOpen} onOpenChange={setGeneratedOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <Image className="h-3.5 w-3.5 text-[hsl(320,100%,60%)]" />
                <span className="font-display text-xs font-bold">GÉNÉRÉS</span>
                <Badge variant="outline" className="text-[8px] px-1.5 h-4">
                  {generatedMedia.length}
                </Badge>
              </div>
              {generatedOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {generatedMedia.map(renderMediaItem)}
              </div>
              {generatedMedia.length === 0 && (
                <p className="text-center text-[10px] text-muted-foreground py-4">
                  Aucune génération
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Médias uploadés */}
          <Collapsible open={uploadedOpen} onOpenChange={setUploadedOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <Upload className="h-3.5 w-3.5 text-[hsl(174,100%,50%)]" />
                <span className="font-display text-xs font-bold">UPLOADÉS</span>
                <Badge variant="outline" className="text-[8px] px-1.5 h-4">
                  {uploadedMedia.length}
                </Badge>
              </div>
              {uploadedOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {uploadedMedia.map(renderMediaItem)}
              </div>
              {uploadedMedia.length === 0 && (
                <p className="text-center text-[10px] text-muted-foreground py-4">
                  Aucun upload
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Lien vers bibliothèque */}
      <div className="p-2 border-t border-border/50 shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-7 text-[10px] gap-1 hover:bg-white/5"
        >
          <FolderOpen className="h-3 w-3" />
          OUVRIR BIBLIOTHÈQUE
        </Button>
      </div>
    </div>
  );
}
