import { useEffect, useState } from "react";

export function AnimatedGlobe({ size = 80 }: { size?: number }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative rounded-full overflow-hidden"
      style={{ 
        width: size, 
        height: size,
        background: "linear-gradient(135deg, hsl(210,100%,25%) 0%, hsl(220,80%,15%) 50%, hsl(200,100%,35%) 100%)",
        boxShadow: `
          inset -${size/4}px -${size/8}px ${size/3}px hsl(220,50%,8%),
          inset ${size/6}px ${size/6}px ${size/4}px hsl(200,100%,60%,0.3),
          0 0 ${size/2}px hsl(200,100%,50%,0.3),
          0 0 ${size}px hsl(174,100%,50%,0.2)
        `
      }}
    >
      {/* Ocean base */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, 
              hsl(200,100%,45%,0.8) 0%, 
              hsl(210,100%,30%) 40%, 
              hsl(220,80%,20%) 100%
            )
          `
        }}
      />
      
      {/* Rotating continents layer */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: `rotateY(${rotation}deg)`,
          transformStyle: "preserve-3d",
          perspective: "1000px"
        }}
      >
        {/* Continent shapes - simplified */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* North America */}
          <ellipse 
            cx={25 + Math.sin(rotation * Math.PI / 180) * 20} 
            cy="30" 
            rx="15" 
            ry="12" 
            fill="hsl(142,50%,35%)"
            opacity={Math.cos(rotation * Math.PI / 180) > -0.3 ? 0.9 : 0.3}
          />
          {/* South America */}
          <ellipse 
            cx={30 + Math.sin(rotation * Math.PI / 180) * 18} 
            cy="60" 
            rx="8" 
            ry="14" 
            fill="hsl(142,50%,40%)"
            opacity={Math.cos(rotation * Math.PI / 180) > -0.3 ? 0.9 : 0.3}
          />
          {/* Europe/Africa */}
          <ellipse 
            cx={55 + Math.sin((rotation + 120) * Math.PI / 180) * 15} 
            cy="40" 
            rx="10" 
            ry="20" 
            fill="hsl(45,40%,40%)"
            opacity={Math.cos((rotation + 120) * Math.PI / 180) > -0.3 ? 0.9 : 0.3}
          />
          {/* Asia */}
          <ellipse 
            cx={70 + Math.sin((rotation + 180) * Math.PI / 180) * 20} 
            cy="35" 
            rx="18" 
            ry="10" 
            fill="hsl(25,50%,45%)"
            opacity={Math.cos((rotation + 180) * Math.PI / 180) > -0.3 ? 0.9 : 0.3}
          />
          {/* Australia */}
          <ellipse 
            cx={80 + Math.sin((rotation + 220) * Math.PI / 180) * 12} 
            cy="65" 
            rx="8" 
            ry="6" 
            fill="hsl(25,60%,50%)"
            opacity={Math.cos((rotation + 220) * Math.PI / 180) > -0.3 ? 0.9 : 0.3}
          />
        </svg>
      </div>

      {/* Cloud layer */}
      <div 
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          transform: `rotateY(${rotation * 0.7}deg)`,
          background: `
            radial-gradient(ellipse at 20% 20%, white 0%, transparent 30%),
            radial-gradient(ellipse at 60% 40%, white 0%, transparent 25%),
            radial-gradient(ellipse at 80% 70%, white 0%, transparent 20%)
          `
        }}
      />

      {/* Atmosphere glow */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 30% 25%, 
              hsl(174,100%,70%,0.2) 0%, 
              transparent 40%
            )
          `,
          boxShadow: `inset 0 0 ${size/4}px hsl(174,100%,50%,0.1)`
        }}
      />

      {/* Highlight */}
      <div 
        className="absolute rounded-full"
        style={{
          top: "8%",
          left: "15%",
          width: "25%",
          height: "15%",
          background: "linear-gradient(135deg, hsl(0,0%,100%,0.4) 0%, transparent 100%)",
          borderRadius: "50%"
        }}
      />
    </div>
  );
}
