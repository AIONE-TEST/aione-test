import { cn } from "@/lib/utils";

interface EarthFallbackProps {
  size?: number;
  className?: string;
}

export function EarthFallback({ size = 80, className }: EarthFallbackProps) {
  return (
    <div 
      className={cn("relative rounded-full overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      {/* Earth-like planet with gradient */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="earthGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="hsl(200, 80%, 70%)" />
            <stop offset="40%" stopColor="hsl(210, 70%, 50%)" />
            <stop offset="70%" stopColor="hsl(200, 60%, 35%)" />
            <stop offset="100%" stopColor="hsl(220, 50%, 20%)" />
          </radialGradient>
          <radialGradient id="landGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(142, 60%, 45%)" />
            <stop offset="100%" stopColor="hsl(142, 50%, 30%)" />
          </radialGradient>
          <filter id="earthGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer glow */}
        <circle cx="50" cy="50" r="48" fill="hsl(200, 80%, 50%)" opacity="0.2" filter="url(#earthGlow)" />
        
        {/* Ocean base */}
        <circle cx="50" cy="50" r="45" fill="url(#earthGradient)" />
        
        {/* Continents/land masses */}
        <ellipse cx="35" cy="35" rx="15" ry="12" fill="url(#landGradient)" opacity="0.8" />
        <ellipse cx="60" cy="45" rx="18" ry="10" fill="url(#landGradient)" opacity="0.7" />
        <ellipse cx="45" cy="65" rx="12" ry="8" fill="url(#landGradient)" opacity="0.75" />
        <ellipse cx="70" cy="30" rx="8" ry="6" fill="url(#landGradient)" opacity="0.65" />
        
        {/* Cloud cover */}
        <ellipse cx="25" cy="40" rx="10" ry="4" fill="white" opacity="0.3" />
        <ellipse cx="55" cy="25" rx="12" ry="3" fill="white" opacity="0.25" />
        <ellipse cx="65" cy="60" rx="8" ry="3" fill="white" opacity="0.2" />
        
        {/* Atmosphere edge glow */}
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="hsl(200, 100%, 70%)" 
          strokeWidth="2" 
          opacity="0.3"
        />
        
        {/* Highlight */}
        <ellipse 
          cx="35" cy="30" 
          rx="15" ry="10" 
          fill="white" 
          opacity="0.15"
        />
      </svg>
    </div>
  );
}