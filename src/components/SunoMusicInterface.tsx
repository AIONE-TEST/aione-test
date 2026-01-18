import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Download,
  Heart,
  Share2,
  MoreHorizontal,
  Music,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SunoMusicInterfaceProps {
  audioUrl?: string;
  title?: string;
  artist?: string;
  isGenerating?: boolean;
  onGenerate?: () => void;
}

export function SunoMusicInterface({
  audioUrl,
  title = "Piste générée",
  artist = "AIONE Music",
  isGenerating = false,
  onGenerate
}: SunoMusicInterfaceProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Waveform simulation data
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate simulated waveform
  useEffect(() => {
    const bars = 100;
    const data = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
    setWaveformData(data);
  }, [audioUrl]);

  // Draw waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const barCount = waveformData.length;
    const barWidth = width / barCount - 1;
    const progress = duration > 0 ? currentTime / duration : 0;
    
    ctx.clearRect(0, 0, width, height);
    
    waveformData.forEach((value, index) => {
      const x = index * (barWidth + 1);
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;
      
      // Gradient based on progress
      const isPlayed = index / barCount < progress;
      
      if (isPlayed) {
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, 'hsl(280, 100%, 65%)');
        gradient.addColorStop(1, 'hsl(320, 100%, 60%)');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = 'hsl(220, 15%, 30%)';
      }
      
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    });
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [waveformData, currentTime, duration, isPlaying]);

  useEffect(() => {
    drawWaveform();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawWaveform]);

  // Audio controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          loop={isLooping}
        />
      )}

      {/* Main Player Card */}
      <div className="panel-3d p-6 space-y-6">
        {/* Header with track info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] flex items-center justify-center shadow-lg shadow-[hsl(280,100%,65%)]/30">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{artist}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full transition-all",
                isLiked && "text-[hsl(350,100%,60%)]"
              )}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="relative h-24 bg-[hsl(220,20%,10%)] rounded-xl overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={96}
            className="w-full h-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const progress = x / rect.width;
              handleSeek([progress * duration]);
            }}
          />
          
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/50"
            style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          
          {/* Generating overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-[hsl(280,100%,65%)] animate-pulse" />
                <span className="font-display text-sm">Génération en cours...</span>
              </div>
            </div>
          )}
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Progress slider */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full",
                isLooping && "text-[hsl(280,100%,65%)] bg-[hsl(280,100%,65%)]/10"
              )}
              onClick={() => setIsLooping(!isLooping)}
            >
              <Repeat className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Shuffle className="h-5 w-5" />
            </Button>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => skip(-10)}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] hover:scale-105 transition-transform shadow-lg shadow-[hsl(280,100%,65%)]/30"
              onClick={audioUrl ? togglePlay : onGenerate}
            >
              {isGenerating ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => skip(10)}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Right controls - Volume */}
          <div className="flex items-center gap-2 w-32">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full shrink-0"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
