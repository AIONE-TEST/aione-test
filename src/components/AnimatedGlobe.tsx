import { useEffect, useState, useRef } from "react";
import earthGif from "@/assets/earth-globe.gif";

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

// Liste d'objets loufoques - ENRICHIE avec mains, visages, smileys, animaux, véhicules, personnages
const funnyEmojis = [
  // Espace & Science
  "🚀", "🛸", "🌟", "⭐", "🪐", "☄️", "🌙", "🔮", "👽", "🤖", "👨‍🚀", "👩‍🚀", "🛰️", "🔭", "🎯", "💫",
  // Animaux
  "🦄", "🐉", "🦋", "🐙", "🦑", "🐬", "🐋", "🦕", "🦅", "🐕", "🐈", "🦊", "🐺", "🦁", "🐯", "🐻", "🐼", "🐨", "🐸", "🦀", "🐢", "🐍", "🦎", "🦖",
  // Mains & Gestes
  "👋", "🤚", "✋", "🖐️", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏",
  // Visages & Smileys
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🫢", "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "🫤", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👾", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾",
  // Personnages
  "👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👩‍🦱", "🧑‍🦱", "👨‍🦱", "👩‍🦰", "🧑‍🦰", "👨‍🦰", "👱‍♀️", "👱", "👱‍♂️", "👩‍🦳", "🧑‍🦳", "👨‍🦳", "👩‍🦲", "🧑‍🦲", "👨‍🦲", "🧔‍♀️", "🧔", "🧔‍♂️", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳", "👳‍♂️", "🧕", "👮‍♀️", "👮", "👮‍♂️", "👷‍♀️", "👷", "👷‍♂️", "💂‍♀️", "💂", "💂‍♂️", "🕵️‍♀️", "🕵️", "🕵️‍♂️", "👩‍⚕️", "🧑‍⚕️", "👨‍⚕️", "👩‍🌾", "🧑‍🌾", "👨‍🌾", "👩‍🍳", "🧑‍🍳", "👨‍🍳", "👩‍🎓", "🧑‍🎓", "👨‍🎓", "👩‍🎤", "🧑‍🎤", "👨‍🎤", "👩‍🏫", "🧑‍🏫", "👨‍🏫", "👩‍🏭", "🧑‍🏭", "👨‍🏭", "👩‍💻", "🧑‍💻", "👨‍💻", "👩‍💼", "🧑‍💼", "👨‍💼", "👩‍🔧", "🧑‍🔧", "👨‍🔧", "👩‍🔬", "🧑‍🔬", "👨‍🔬", "👩‍🎨", "🧑‍🎨", "👨‍🎨", "👩‍🚒", "🧑‍🚒", "👨‍🚒", "👩‍✈️", "🧑‍✈️", "👨‍✈️", "🥷", "🦸‍♀️", "🦸", "🦸‍♂️", "🦹‍♀️", "🦹", "🦹‍♂️", "🧙‍♀️", "🧙", "🧙‍♂️", "🧚‍♀️", "🧚", "🧚‍♂️", "🧛‍♀️", "🧛", "🧛‍♂️", "🧜‍♀️", "🧜", "🧜‍♂️", "🧝‍♀️", "🧝", "🧝‍♂️", "🧞‍♀️", "🧞", "🧞‍♂️", "🧟‍♀️", "🧟", "🧟‍♂️", "🧌", "💆‍♀️", "💆", "💆‍♂️", "💇‍♀️", "💇", "💇‍♂️", "🚶‍♀️", "🚶", "🚶‍♂️", "🧍‍♀️", "🧍", "🧍‍♂️", "🧎‍♀️", "🧎", "🧎‍♂️", "🏃‍♀️", "🏃", "🏃‍♂️", "💃", "🕺", "🕴️", "👯‍♀️", "👯", "👯‍♂️", "🧖‍♀️", "🧖", "🧖‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️",
  // Véhicules & Transport
  "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚍", "🚘", "🚖", "🛞", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢",
  // Objets divers
  "🍕", "🍩", "🎸", "🎮", "💎", "🏆", "⚡", "🌈", "🎪", "🎭", "🎨", "🔥", "❄️", "🍀", "🌸"
];

// Generate random satellites (classic orbiting around the planet)
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
    orbitRadius: 0.55 + Math.random() * 0.3,
    orbitDuration: 4 + Math.random() * 6,
    size: 4 + Math.random() * 4,
    delay: Math.random() * 3,
    color: colors[i % colors.length],
    orbitTilt: -60 + Math.random() * 120,
    direction: Math.random() > 0.5 ? 1 : -1,
  }));
};

// Generate random traversing objects (crossing the galaxy from end to end)
const generateTraversingObjects = (): TraversingObject[] => {
  return Array.from({ length: 25 }, (_, i) => {
    // Random start and end positions (from edge to edge)
    const startSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let startX = 0, startY = 0, endX = 0, endY = 0;
    
    switch(startSide) {
      case 0: // Start from top
        startX = Math.random() * 100;
        startY = -10;
        endX = Math.random() * 100;
        endY = 110;
        break;
      case 1: // Start from right
        startX = 110;
        startY = Math.random() * 100;
        endX = -10;
        endY = Math.random() * 100;
        break;
      case 2: // Start from bottom
        startX = Math.random() * 100;
        startY = 110;
        endX = Math.random() * 100;
        endY = -10;
        break;
      case 3: // Start from left
        startX = -10;
        startY = Math.random() * 100;
        endX = 110;
        endY = Math.random() * 100;
        break;
    }
    
    return {
      id: i + 100,
      emoji: funnyEmojis[Math.floor(Math.random() * funnyEmojis.length)],
      startX,
      startY,
      endX,
      endY,
      duration: 8 + Math.random() * 20,
      delay: Math.random() * 15,
      size: 12 + Math.random() * 10,
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

export function AnimatedGlobe({ size = 120 }: { size?: number }) {
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

      {/* Globe centered - Using uploaded GIF */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{ 
          width: size, 
          height: size,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: `
            0 0 ${size/2}px hsl(200,100%,50%,0.3),
            0 0 ${size}px hsl(174,100%,50%,0.2)
          `,
          zIndex: 10,
        }}
      >
        <img 
          src={earthGif}
          alt="Earth"
          className="w-full h-full object-cover rounded-full"
          style={{
            filter: "brightness(1.1) contrast(1.1)"
          }}
        />
        
        {/* Atmosphere glow overlay */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 30% 25%, 
                hsl(174,100%,70%,0.15) 0%, 
                transparent 40%
              )
            `,
            boxShadow: `inset 0 0 ${size/4}px hsl(174,100%,50%,0.1)`
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
