import { useEffect, useState, useRef } from "react";

interface Satellite {
  id: number;
  orbitRadius: number;
  orbitDuration: number;
  size: number;
  delay: number;
  color: string;
  orbitTilt: number;
  direction: number; // 1 or -1 for direction
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDuration: number;
  delay: number;
}

// Generate random satellites
const generateSatellites = (): Satellite[] => {
  const colors = [
    "hsl(174,100%,50%)",
    "hsl(45,100%,55%)",
    "hsl(142,76%,50%)",
    "hsl(280,100%,65%)",
    "hsl(320,100%,60%)",
    "hsl(200,100%,60%)",
  ];
  
  return Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    orbitRadius: 1.2 + Math.random() * 0.5,
    orbitDuration: 4 + Math.random() * 8,
    size: 2 + Math.random() * 2,
    delay: Math.random() * 5,
    color: colors[i % colors.length],
    orbitTilt: -60 + Math.random() * 120,
    direction: Math.random() > 0.5 ? 1 : -1,
  }));
};

// Generate random stars
const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 1.5,
    opacity: 0.3 + Math.random() * 0.7,
    twinkleDuration: 1 + Math.random() * 3,
    delay: Math.random() * 3,
  }));
};

export function AnimatedGlobe({ size = 80 }: { size?: number }) {
  const [rotation, setRotation] = useState(0);
  const [satellites] = useState(() => generateSatellites());
  const [stars] = useState(() => generateStars(30));
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      
      if (delta > 30) { // ~33fps for smooth animation
        setRotation(prev => (prev + 0.8) % 360);
        lastTimeRef.current = time;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative"
      style={{ 
        width: size * 1.8, 
        height: size * 1.8,
      }}
    >
      {/* Background Stars */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
      >
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="white"
            className="animate-pulse"
            style={{
              opacity: star.opacity * 0.6,
              animationDuration: `${star.twinkleDuration}s`,
              animationDelay: `${star.delay}s`,
              filter: "blur(0.3px)",
            }}
          />
        ))}
        {/* Distant asteroids/debris */}
        {[...Array(5)].map((_, i) => (
          <ellipse
            key={`asteroid-${i}`}
            cx={15 + i * 18}
            cy={10 + (i % 3) * 35}
            rx={1}
            ry={0.6}
            fill="hsl(30, 30%, 60%)"
            opacity={0.4}
            style={{
              transform: `rotate(${i * 30}deg)`,
              transformOrigin: `${15 + i * 18}px ${10 + (i % 3) * 35}px`,
            }}
          />
        ))}
      </svg>

      {/* Satellites with random orbits */}
      {satellites.map((sat) => (
        <div
          key={sat.id}
          className="absolute"
          style={{
            width: size * 1.8,
            height: size * 1.8,
            top: 0,
            left: 0,
            animation: `spin-satellite-${sat.direction > 0 ? 'cw' : 'ccw'} ${sat.orbitDuration}s linear infinite`,
            animationDelay: `${sat.delay}s`,
            transform: `rotateX(${sat.orbitTilt}deg)`,
          }}
        >
          {/* Satellite body */}
          <div
            className="absolute rounded-full"
            style={{
              width: sat.size,
              height: sat.size,
              background: sat.color,
              boxShadow: `0 0 ${sat.size * 3}px ${sat.color}, 0 0 ${sat.size * 6}px ${sat.color}40`,
              top: "50%",
              left: `${50 - sat.orbitRadius * 50}%`,
              transform: "translateY(-50%)",
            }}
          />
          {/* Orbit trail (subtle) */}
          <div
            className="absolute rounded-full border opacity-15"
            style={{
              width: `${sat.orbitRadius * 100}%`,
              height: `${sat.orbitRadius * 100}%`,
              top: `${50 - sat.orbitRadius * 50}%`,
              left: `${50 - sat.orbitRadius * 50}%`,
              borderColor: sat.color,
              borderWidth: "0.5px",
            }}
          />
        </div>
      ))}

      {/* Globe centered */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{ 
          width: size, 
          height: size,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
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
          {/* Continent shapes */}
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

      {/* CSS Animation for satellites */}
      <style>{`
        @keyframes spin-satellite-cw {
          from { transform: rotateX(var(--tilt, 0deg)) rotateZ(0deg); }
          to { transform: rotateX(var(--tilt, 0deg)) rotateZ(360deg); }
        }
        @keyframes spin-satellite-ccw {
          from { transform: rotateX(var(--tilt, 0deg)) rotateZ(360deg); }
          to { transform: rotateX(var(--tilt, 0deg)) rotateZ(0deg); }
        }
      `}</style>
    </div>
  );
}
