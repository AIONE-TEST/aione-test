import { useState, useEffect } from "react";
import { Clock, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export function SessionTimer() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart] = useState(() => new Date());
  const [sessionDuration, setSessionDuration] = useState("00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Calculate session duration
      const diff = now.getTime() - sessionStart.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setSessionDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 panel-3d rounded-xl border border-[hsl(220,15%,25%)]">
      {/* Current Date & Time */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-[hsl(174,100%,50%)]" />
        <div className="flex flex-col">
          <span className="font-display text-xs text-muted-foreground">
            {formatDate(currentTime)}
          </span>
          <span className="font-display text-sm text-[hsl(174,100%,50%)] font-bold tracking-wider">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-[hsl(220,15%,25%)]" />

      {/* Session Duration */}
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-[hsl(45,100%,55%)]" />
        <div className="flex flex-col">
          <span className="font-display text-xs text-muted-foreground">
            SESSION
          </span>
          <span className="font-display text-sm text-[hsl(45,100%,55%)] font-bold tracking-wider">
            {sessionDuration}
          </span>
        </div>
      </div>
    </div>
  );
}