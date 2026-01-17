import { useEffect, useState } from "react";
import { X, Download, ExternalLink, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingMediaPreviewProps {
  isOpen: boolean;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
  title?: string;
  prompt?: string;
  model?: string;
  position?: { x: number; y: number };
  onClose?: () => void;
}

export function FloatingMediaPreview({
  isOpen,
  mediaUrl,
  mediaType = "image",
  title,
  prompt,
  model,
  position,
  onClose,
}: FloatingMediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [calculatedPosition, setCalculatedPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (position) {
      // Calculer la position pour que la fenêtre ne sorte pas de l'écran
      const previewWidth = window.innerWidth * 0.5; // 50% de la page
      const previewHeight = window.innerHeight * 0.5;
      
      let x = position.x;
      let y = position.y;

      // Ajuster horizontalement
      if (x + previewWidth > window.innerWidth) {
        x = position.x - previewWidth - 20;
      }
      if (x < 0) x = 20;

      // Ajuster verticalement
      if (y + previewHeight > window.innerHeight) {
        y = window.innerHeight - previewHeight - 20;
      }
      if (y < 0) y = 20;

      setCalculatedPosition({ x, y });
    }
  }, [position]);

  if (!isOpen || !mediaUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `aione-${Date.now()}.${mediaType === 'video' ? 'mp4' : mediaType === 'audio' ? 'mp3' : 'png'}`;
    link.click();
  };

  return (
    <div
      className={cn(
        "fixed z-50 w-[50vw] max-w-[800px] max-h-[50vh]",
        "panel-3d overflow-hidden",
        "shadow-2xl shadow-black/50",
        "animate-in zoom-in-95 duration-200"
      )}
      style={{
        left: calculatedPosition.x,
        top: calculatedPosition.y,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/60 border-b border-border/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {model && (
            <span className="font-display text-xs font-bold text-[hsl(var(--primary))] shrink-0">
              {model}
            </span>
          )}
          {title && (
            <span className="text-xs text-muted-foreground truncate">
              {title}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => window.open(mediaUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 hover:bg-[hsl(0,100%,50%)]/20"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative bg-black/40 flex items-center justify-center" style={{ maxHeight: 'calc(50vh - 80px)' }}>
        {mediaType === "image" && (
          <img
            src={mediaUrl}
            alt={title || "Preview"}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {mediaType === "video" && (
          <div className="relative w-full">
            <video
              src={mediaUrl}
              className="w-full max-h-full object-contain"
              loop
              muted={isMuted}
              autoPlay={isPlaying}
            />
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-black/60"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-black/60"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {mediaType === "audio" && (
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] flex items-center justify-center">
              <Volume2 className="h-10 w-10 text-white" />
            </div>
            <audio
              src={mediaUrl}
              controls
              className="w-full max-w-md"
            />
          </div>
        )}
      </div>

      {/* Prompt */}
      {prompt && (
        <div className="px-3 py-2 bg-black/40 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground line-clamp-2">
            <span className="font-display font-bold text-foreground">Prompt:</span> {prompt}
          </p>
        </div>
      )}
    </div>
  );
}
