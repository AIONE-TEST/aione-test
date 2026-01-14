// LED Indicator Component - Diode verte/rouge pour statut avec clignotement lent
interface StatusLEDProps {
  isActive: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  blink?: boolean;
}

export function StatusLED({ isActive, size = "md", className = "", blink = true }: StatusLEDProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer glow - slow blink animation for active LEDs */}
      <div 
        className={`absolute inset-0 rounded-full blur-sm ${
          isActive 
            ? "bg-[hsl(142,76%,50%)]" 
            : "bg-[hsl(0,100%,50%)]"
        } ${isActive && blink ? "animate-led-blink" : "opacity-60"}`}
      />
      {/* Main LED */}
      <div 
        className={`absolute inset-0 rounded-full ${
          isActive 
            ? "bg-gradient-to-b from-[hsl(142,76%,65%)] to-[hsl(142,76%,35%)]" 
            : "bg-gradient-to-b from-[hsl(0,100%,65%)] to-[hsl(0,100%,35%)]"
        } border border-white/30 ${isActive && blink ? "animate-led-blink-main" : ""}`}
        style={{
          boxShadow: isActive 
            ? "0 0 10px hsl(142,76%,50%), inset 0 1px 2px rgba(255,255,255,0.5)" 
            : "0 0 10px hsl(0,100%,50%), inset 0 1px 2px rgba(255,255,255,0.5)"
        }}
      />
      {/* Highlight */}
      <div 
        className="absolute top-0.5 left-0.5 w-1/2 h-1/2 rounded-full bg-white/40"
      />
    </div>
  );
}
