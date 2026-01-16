import { useEffect, useState, useRef } from "react";

interface Satellite {
  id: number;
  orbitRadius: number;
  orbitDuration: number;
  size: number;
  delay: number;
  color: string;
  orbitTilt: number;
  direction: number;
}

interface TraversingObject {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
  size: number;
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

// Liste d'objets loufoques
const funnyEmojis = [
  "🚀", "🛸", "🌟", "⭐", "🪐", "☄️", "🌙", "🔮",
  "👽", "🤖", "👨‍🚀", "👩‍🚀", "🛰️", "🔭", "🎯", "💫",
  "🦄", "🐉", "🦋", "🐙", "🦑", "🐬", "🐋", "🦕",
  "🍕", "🍩", "🎸", "🎮", "💎", "🏆", "⚡", "🌈",
  "🎪", "🎭", "🎨", "🔥", "❄️", "🍀", "🌸", "🦅"
];

// Generate random satellites (classic orbiting around the planet) - EXPLOITER TOUT L'ESPACE
const generateSatellites = (): Satellite[] => {
  const colors = [
    "hsl(174,100%,50%)",
    "hsl(45,100%,55%)",
    "hsl(142,76%,50%)",
    "hsl(280,100%,65%)",
    "hsl(320,100%,60%)",
    "hsl(200,100%,60%)",
    "hsl(25,100%,55%)",
    "hsl(0,100%,60%)",
  ];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    // Orbites plus larges pour exploiter tout l'espace
    orbitRadius: 0.75 + (i * 0.08),
    orbitDuration: 3 + Math.random() * 5,
    size: 5 + Math.random() * 5,
    delay: i * 0.5,
    color: colors[i % colors.length],
    // Angles variés pour couvrir tout l'espace
    orbitTilt: -80 + (i * 20),
    direction: i % 2 === 0 ? 1 : -1,
  }));
};

// Generate random traversing objects (crossing the galaxy from end to end) - TOUT L'ESPACE
const generateTraversingObjects = (): TraversingObject[] => {
  return Array.from({ length: 30 }, (_, i) => {
    // Utiliser les 4 coins et les 4 bords pour maximiser la couverture
    const startSide = i % 4;
    let startX = 0, startY = 0, endX = 0, endY = 0;
    
    // Distribuer sur tout l'espace avec des trajectoires variées
    const offset = (i * 12) % 100;
    
    switch(startSide) {
      case 0: // Start from top
        startX = offset;
        startY = -5;
        endX = (100 - offset);
        endY = 105;
        break;
      case 1: // Start from right
        startX = 105;
        startY = offset;
        endX = -5;
        endY = (100 - offset);
        break;
      case 2: // Start from bottom
        startX = (100 - offset);
        startY = 105;
        endX = offset;
        endY = -5;
        break;
      case 3: // Start from left
        startX = -5;
        startY = (100 - offset);
        endX = 105;
        endY = offset;
        break;
    }
    
    return {
      id: i + 100,
      emoji: funnyEmojis[i % funnyEmojis.length],
      startX,
      startY,
      endX,
      endY,
      duration: 6 + (i % 10) * 2,
      delay: i * 0.8,
      size: 14 + (i % 5) * 3,
    };
  });
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
  const [traversingObjects] = useState(() => generateTraversingObjects());
  const [stars] = useState(() => generateStars(40));
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      
      if (delta > 30) {
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
        width: size * 2, 
        height: size * 2,
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
      </svg>

      {/* Traversing funny objects (crossing the galaxy from end to end) */}
      {traversingObjects.map((obj) => (
        <div
          key={obj.id}
          className="absolute pointer-events-none"
          style={{
            fontSize: obj.size,
            animation: `traverse-${obj.id} ${obj.duration}s linear infinite`,
            animationDelay: `${obj.delay}s`,
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.5))",
            zIndex: 5,
          }}
        >
          {obj.emoji}
        </div>
      ))}

      {/* Satellites with classic orbits around the planet */}
      {satellites.map((sat) => (
        <div
          key={sat.id}
          className="absolute"
          style={{
            width: size * 2,
            height: size * 2,
            top: 0,
            left: 0,
            animation: `spin-satellite-${sat.direction > 0 ? 'cw' : 'ccw'} ${sat.orbitDuration}s linear infinite`,
            animationDelay: `${sat.delay}s`,
            transform: `rotateX(${sat.orbitTilt}deg)`,
          }}
        >
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
          <div
            className="absolute rounded-full border opacity-10"
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
          `,
          zIndex: 10,
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
        
        {/* Rotating continents layer - STYLE ABSTRAIT */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `rotateY(${rotation}deg)`,
            transformStyle: "preserve-3d",
            perspective: "1000px"
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Amérique du Nord - forme abstraite */}
            <path 
              d={`M ${20 + Math.sin(rotation * Math.PI / 180) * 15} 20 
                  Q ${35 + Math.sin(rotation * Math.PI / 180) * 12} 15 
                    ${40 + Math.sin(rotation * Math.PI / 180) * 10} 30 
                  L ${35 + Math.sin(rotation * Math.PI / 180) * 14} 45 
                  Q ${25 + Math.sin(rotation * Math.PI / 180) * 16} 40 
                    ${20 + Math.sin(rotation * Math.PI / 180) * 15} 20`}
              fill="hsl(142,55%,38%)"
              opacity={Math.cos(rotation * Math.PI / 180) > -0.3 ? 0.85 : 0.25}
            />
            
            {/* Amérique du Sud - forme abstraite */}
            <path 
              d={`M ${28 + Math.sin(rotation * Math.PI / 180) * 14} 52 
                  Q ${35 + Math.sin(rotation * Math.PI / 180) * 12} 55 
                    ${32 + Math.sin(rotation * Math.PI / 180) * 13} 70 
                  L ${25 + Math.sin(rotation * Math.PI / 180) * 15} 78 
                  Q ${22 + Math.sin(rotation * Math.PI / 180) * 14} 65 
                    ${28 + Math.sin(rotation * Math.PI / 180) * 14} 52`}
              fill="hsl(120,50%,35%)"
              opacity={Math.cos(rotation * Math.PI / 180) > -0.3 ? 0.85 : 0.25}
            />
            
            {/* Europe/Afrique - forme abstraite */}
            <path 
              d={`M ${55 + Math.sin((rotation + 120) * Math.PI / 180) * 12} 25 
                  Q ${62 + Math.sin((rotation + 120) * Math.PI / 180) * 10} 30 
                    ${60 + Math.sin((rotation + 120) * Math.PI / 180) * 11} 50 
                  L ${55 + Math.sin((rotation + 120) * Math.PI / 180) * 13} 72 
                  Q ${48 + Math.sin((rotation + 120) * Math.PI / 180) * 14} 55 
                    ${55 + Math.sin((rotation + 120) * Math.PI / 180) * 12} 25`}
              fill="hsl(45,45%,42%)"
              opacity={Math.cos((rotation + 120) * Math.PI / 180) > -0.3 ? 0.85 : 0.25}
            />
            
            {/* Asie - forme abstraite */}
            <path 
              d={`M ${68 + Math.sin((rotation + 180) * Math.PI / 180) * 15} 22 
                  Q ${85 + Math.sin((rotation + 180) * Math.PI / 180) * 12} 28 
                    ${82 + Math.sin((rotation + 180) * Math.PI / 180) * 14} 45 
                  L ${70 + Math.sin((rotation + 180) * Math.PI / 180) * 16} 50 
                  Q ${65 + Math.sin((rotation + 180) * Math.PI / 180) * 15} 35 
                    ${68 + Math.sin((rotation + 180) * Math.PI / 180) * 15} 22`}
              fill="hsl(30,50%,45%)"
              opacity={Math.cos((rotation + 180) * Math.PI / 180) > -0.3 ? 0.85 : 0.25}
            />
            
            {/* Australie - forme abstraite */}
            <path 
              d={`M ${75 + Math.sin((rotation + 220) * Math.PI / 180) * 10} 60 
                  Q ${85 + Math.sin((rotation + 220) * Math.PI / 180) * 8} 62 
                    ${82 + Math.sin((rotation + 220) * Math.PI / 180) * 9} 72 
                  L ${73 + Math.sin((rotation + 220) * Math.PI / 180) * 11} 70 
                  Z`}
              fill="hsl(25,55%,48%)"
              opacity={Math.cos((rotation + 220) * Math.PI / 180) > -0.3 ? 0.85 : 0.25}
            />
            
            {/* Îles supplémentaires pour plus de détails */}
            <circle 
              cx={45 + Math.sin((rotation + 90) * Math.PI / 180) * 8} 
              cy="55" 
              r="3" 
              fill="hsl(100,45%,40%)"
              opacity={Math.cos((rotation + 90) * Math.PI / 180) > -0.2 ? 0.7 : 0.2}
            />
            <circle 
              cx={78 + Math.sin((rotation + 150) * Math.PI / 180) * 6} 
              cy="48" 
              r="2.5" 
              fill="hsl(35,50%,45%)"
              opacity={Math.cos((rotation + 150) * Math.PI / 180) > -0.2 ? 0.7 : 0.2}
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

      {/* CSS Animation for satellites and traversing objects */}
      <style>{`
        @keyframes spin-satellite-cw {
          from { transform: rotateX(var(--tilt, 0deg)) rotateZ(0deg); }
          to { transform: rotateX(var(--tilt, 0deg)) rotateZ(360deg); }
        }
        @keyframes spin-satellite-ccw {
          from { transform: rotateX(var(--tilt, 0deg)) rotateZ(360deg); }
          to { transform: rotateX(var(--tilt, 0deg)) rotateZ(0deg); }
        }
        ${traversingObjects.map(obj => `
          @keyframes traverse-${obj.id} {
            0% {
              left: ${obj.startX}%;
              top: ${obj.startY}%;
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            100% {
              left: ${obj.endX}%;
              top: ${obj.endY}%;
              opacity: 0;
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}
