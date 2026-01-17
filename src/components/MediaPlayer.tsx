import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, RotateCcw, ZoomIn, ZoomOut,
  Download, RefreshCw, ChevronLeft, ChevronRight, Square, Repeat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MediaPlayerProps {
  mediaUrl?: string | null;
  mediaType: "video" | "image" | "audio";
  onDownload?: () => void;
  className?: string;
  isGenerating?: boolean;
  placeholder?: React.ReactNode;
  onNewGeneration?: () => void;
}

export function MediaPlayer({
  mediaUrl,
  mediaType,
  onDownload,
  className,
  isGenerating = false,
  placeholder,
  onNewGeneration,
}: MediaPlayerProps) {
  // Video/Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Image states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video/Audio controls
  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skip = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(0, Math.min(duration, mediaRef.current.currentTime + seconds));
    }
  };

  const stop = () => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      mediaRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleLoop = () => {
    if (mediaRef.current) {
      mediaRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  // Image controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoom(1);
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  // Event handlers
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => setDuration(media.duration);
    const handleEnded = () => setIsPlaying(false);

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, [mediaUrl]);

  // Reset states when media changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setZoom(1);
    setRotation(0);
  }, [mediaUrl]);

  const renderControls = () => {
    if (!mediaUrl) return null;

    switch (mediaType) {
      case "video":
        return (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            {/* Progress bar */}
            <div className="mb-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between gap-2">
              {/* Left controls */}
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => skip(-10)}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => skip(10)}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                <span className="text-xs text-white font-mono ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                  />
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setZoom(zoom === 1 ? 1.5 : 1)}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={resetZoom}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={rotate}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              {onDownload && (
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress bar */}
            <div className="mb-3">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => skip(-10)}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-12 w-12 btn-3d-green rounded-full" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-10 w-10" onClick={stop}>
                  <Square className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => skip(10)}>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Time display */}
              <span className="text-sm text-white font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn("h-8 w-8", isLooping && "text-[hsl(142,76%,50%)]")} 
                  onClick={toggleLoop}
                >
                  <Repeat className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "panel-3d relative aspect-video flex items-center justify-center overflow-hidden group",
        className
      )}
    >
      {isGenerating ? (
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full border-4 border-[hsl(var(--primary))]/30 border-t-[hsl(var(--primary))] animate-spin" />
          <p className="font-display text-lg">Génération en cours...</p>
        </div>
      ) : mediaUrl ? (
        <>
          {mediaType === "video" && (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={mediaUrl}
              className="w-full h-full object-contain"
              style={{ transform: `scale(${zoom})` }}
              onClick={togglePlay}
            />
          )}
          {mediaType === "image" && (
            <img
              src={mediaUrl}
              alt="Generated"
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{ 
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          )}
          {mediaType === "audio" && (
            <div className="flex flex-col items-center gap-4 w-full px-8">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)] flex items-center justify-center animate-pulse-slow">
                <Volume2 className="h-12 w-12 text-white" />
              </div>
              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={mediaUrl}
                className="hidden"
              />
            </div>
          )}

          {/* Controls overlay - visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {renderControls()}
          </div>

          {/* New generation button */}
          {onNewGeneration && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onNewGeneration}
            >
              Nouvelle génération
            </Button>
          )}
        </>
      ) : (
        placeholder
      )}
    </div>
  );
}
