import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Download, X, Play, Pause, Volume2, VolumeX, 
  Maximize2, SkipBack, SkipForward, RotateCcw,
  ZoomIn, ZoomOut, Copy, Camera, Expand, Image as ImageIcon,
  Film, Scissors
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MediaResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string | null;
  mediaType: "image" | "video" | "audio";
  prompt?: string;
  model?: string;
  onExtendVideo?: () => void;
  canExtend?: boolean;
}

export function MediaResultPopup({ 
  isOpen, 
  onClose, 
  mediaUrl, 
  mediaType,
  prompt,
  model,
  onExtendVideo,
  canExtend = false
}: MediaResultPopupProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!mediaUrl) return;
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `generated-${mediaType}-${Date.now()}.${mediaType === 'video' ? 'mp4' : mediaType === 'audio' ? 'mp3' : 'png'}`;
    link.click();
    toast({ title: "Téléchargement lancé !" });
  };

  const handleCopyToClipboard = async () => {
    if (!mediaUrl) return;
    try {
      await navigator.clipboard.writeText(mediaUrl);
      toast({ title: "Lien copié !" });
    } catch {
      toast({ title: "Erreur de copie", variant: "destructive" });
    }
  };

  const handleScreenshot = async () => {
    if (mediaType === "video" && videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const link = document.createElement("a");
        link.download = `screenshot-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast({ title: "Capture d'écran sauvegardée !" });
      }
    } else if (mediaType === "image" && mediaUrl) {
      handleDownload();
    }
  };

  const handleCaptureLastFrame = async () => {
    if (mediaType === "video" && videoRef.current) {
      // Seek to end
      videoRef.current.currentTime = videoRef.current.duration - 0.1;
      setTimeout(() => {
        handleScreenshot();
      }, 200);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-[hsl(220,20%,8%)] border-2 border-[hsl(280,100%,65%)]/50">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-[hsl(220,15%,20%)] flex flex-row items-center justify-between">
          <div className="flex-1">
            <DialogTitle className="font-display text-xl gradient-text-purple">
              RÉSULTAT GÉNÉRÉ
            </DialogTitle>
            {model && (
              <p className="text-sm text-muted-foreground mt-1">
                Modèle: <span className="text-[hsl(280,100%,65%)]">{model}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleDownload}
              className="btn-3d-green gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
            <Button 
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Media Content */}
        <div className="relative flex-1 bg-black/50 flex items-center justify-center min-h-[400px]">
          {mediaType === "image" && mediaUrl && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img 
                src={mediaUrl} 
                alt="Generated" 
                className="max-w-full max-h-[60vh] object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom / 100})` }}
              />
              {/* Image Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/60 rounded-full px-4 py-2">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-mono w-12 text-center">{zoom}%</span>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setZoom(100)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {mediaType === "video" && mediaUrl && (
            <div className="relative w-full h-full">
              <video 
                src={mediaUrl}
                className="w-full h-full max-h-[60vh] object-contain"
                controls={false}
                muted={isMuted}
                onTimeUpdate={(e) => {
                  const video = e.target as HTMLVideoElement;
                  setProgress((video.currentTime / video.duration) * 100);
                }}
              />
              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <Slider 
                  value={[progress]} 
                  max={100} 
                  step={0.1}
                  className="mb-3"
                  onValueChange={([val]) => setProgress(val)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-10 w-10" onClick={togglePlay}>
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider 
                      value={[isMuted ? 0 : volume]} 
                      max={100}
                      className="w-24"
                      onValueChange={([val]) => setVolume(val)}
                    />
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {mediaType === "audio" && mediaUrl && (
            <div className="w-full p-8">
              {/* Audio Visualizer */}
              <div className="h-32 bg-gradient-to-r from-[hsl(280,100%,65%)]/20 via-[hsl(320,100%,60%)]/20 to-[hsl(45,100%,55%)]/20 rounded-xl flex items-end justify-center gap-1 px-4 mb-6">
                {Array.from({ length: 40 }, (_, i) => (
                  <div 
                    key={i}
                    className="w-2 bg-gradient-to-t from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] rounded-full animate-pulse"
                    style={{ 
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }}
                  />
                ))}
              </div>
              {/* Audio Controls */}
              <div className="space-y-4">
                <Slider 
                  value={[progress]} 
                  max={100} 
                  step={0.1}
                  onValueChange={([val]) => setProgress(val)}
                />
                <div className="flex items-center justify-center gap-4">
                  <Button size="icon" variant="ghost" className="h-10 w-10">
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button size="icon" className="h-14 w-14 btn-3d-purple" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10">
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Slider 
                    value={[isMuted ? 0 : volume]} 
                    max={100}
                    className="w-32"
                    onValueChange={([val]) => setVolume(val)}
                  />
                </div>
              </div>
            </div>
          )}

          {!mediaUrl && (
            <div className="text-center text-muted-foreground p-8">
              <p className="font-display text-xl">Aucun média à afficher</p>
            </div>
          )}
        </div>

        {/* Prompt Info */}
        {prompt && (
          <div className="p-4 border-t border-[hsl(220,15%,20%)] bg-[hsl(220,20%,6%)]">
            <p className="text-xs text-muted-foreground mb-1">PROMPT UTILISÉ:</p>
            <p className="text-sm text-foreground">{prompt}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
