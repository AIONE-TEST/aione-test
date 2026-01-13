// Vintage Postal Stamp Component - Tampon postal vintage "OK"
interface VintageStampProps {
  text?: string;
  className?: string;
}

export function VintageStamp({ text = "OK", className = "" }: VintageStampProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: "60px",
        height: "60px",
      }}
    >
      {/* Outer ring */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full"
        style={{ 
          filter: "url(#rough)",
          opacity: 0.85,
        }}
      >
        <defs>
          <filter id="rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
        
        {/* Outer circle with dotted pattern */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke="hsl(142,76%,50%)" 
          strokeWidth="3"
          strokeDasharray="4 2"
        />
        
        {/* Inner circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="38" 
          fill="none" 
          stroke="hsl(142,76%,50%)" 
          strokeWidth="2"
        />
        
        {/* Decorative dots around */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x = 50 + 42 * Math.cos(angle);
          const y = 50 + 42 * Math.sin(angle);
          return (
            <circle 
              key={i}
              cx={x} 
              cy={y} 
              r="1.5" 
              fill="hsl(142,76%,50%)"
              opacity={Math.random() > 0.3 ? 1 : 0.3}
            />
          );
        })}
      </svg>
      
      {/* Text */}
      <span 
        className="font-display text-xl font-black text-[hsl(142,76%,50%)] tracking-wider"
        style={{
          textShadow: "0 0 8px hsl(142,76%,50%)",
          transform: "rotate(-12deg)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
