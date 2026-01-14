import { cn } from "@/lib/utils";

interface AnimatedFlameProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AnimatedFlame({ size = "lg", className }: AnimatedFlameProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20"
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Main flame - animated with CSS */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full animate-flame-realistic drop-shadow-[0_0_15px_hsl(0,100%,50%)]"
      >
        <defs>
          <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(25, 100%, 50%)" />
            <stop offset="30%" stopColor="hsl(15, 100%, 55%)" />
            <stop offset="60%" stopColor="hsl(0, 100%, 55%)" />
            <stop offset="100%" stopColor="hsl(45, 100%, 60%)" />
          </linearGradient>
          <linearGradient id="innerFlameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(45, 100%, 70%)" />
            <stop offset="50%" stopColor="hsl(35, 100%, 65%)" />
            <stop offset="100%" stopColor="hsl(25, 100%, 80%)" />
          </linearGradient>
          <filter id="flameBlur">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>
        
        {/* Outer glow */}
        <ellipse 
          cx="50" cy="75" 
          rx="25" ry="8" 
          fill="hsl(25, 100%, 50%)" 
          opacity="0.3"
          filter="url(#flameBlur)"
          className="animate-pulse"
        />
        
        {/* Main flame body */}
        <path
          d="M50 5 
             C55 25, 80 35, 75 55 
             C85 65, 70 85, 50 95 
             C30 85, 15 65, 25 55 
             C20 35, 45 25, 50 5"
          fill="url(#flameGradient)"
          className="animate-flame-flicker"
        />
        
        {/* Inner bright core */}
        <path
          d="M50 30 
             C53 42, 65 50, 60 65 
             C55 78, 50 85, 50 85 
             C50 85, 45 78, 40 65 
             C35 50, 47 42, 50 30"
          fill="url(#innerFlameGradient)"
          className="animate-flame-flicker-fast"
        />
        
        {/* Bright core center */}
        <ellipse 
          cx="50" cy="60" 
          rx="8" ry="15" 
          fill="hsl(50, 100%, 85%)" 
          opacity="0.8"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}