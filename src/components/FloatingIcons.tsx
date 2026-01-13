import { 
  Brain, 
  Sparkles, 
  Bot, 
  Cpu, 
  Image, 
  Video, 
  Music, 
  Mic, 
  Camera, 
  Code, 
  Box, 
  Palette
} from "lucide-react";

interface FloatingIcon {
  icon: React.ReactNode;
  position: string;
  delay: string;
  color: string;
  size?: string;
}

const floatingIcons: FloatingIcon[] = [
  { 
    icon: <Sparkles className="h-6 w-6" />, 
    position: "top-20 left-[20%]", 
    delay: "0s",
    color: "text-[hsl(174,100%,50%)]"
  },
  { 
    icon: <Brain className="h-8 w-8" />, 
    position: "top-32 left-[15%]", 
    delay: "1s",
    color: "text-[hsl(142,76%,50%)]"
  },
  { 
    icon: <Bot className="h-6 w-6" />, 
    position: "top-48 left-[25%]", 
    delay: "0.5s",
    color: "text-[hsl(142,76%,50%)]"
  },
  { 
    icon: <Cpu className="h-7 w-7" />, 
    position: "top-56 left-[18%]", 
    delay: "1.5s",
    color: "text-[hsl(142,76%,50%)]"
  },
  { 
    icon: <Image className="h-6 w-6" />, 
    position: "top-[70%] left-[22%]", 
    delay: "2s",
    color: "text-[hsl(320,100%,60%)]"
  },
  { 
    icon: <Music className="h-6 w-6" />, 
    position: "top-[85%] left-[18%]", 
    delay: "0.8s",
    color: "text-[hsl(210,100%,60%)]"
  },
  { 
    icon: <Camera className="h-5 w-5" />, 
    position: "top-[90%] left-[28%]", 
    delay: "1.2s",
    color: "text-[hsl(45,100%,55%)]"
  },
  // Right side
  { 
    icon: <Code className="h-6 w-6" />, 
    position: "top-20 right-[15%]", 
    delay: "0.3s",
    color: "text-[hsl(280,100%,65%)]"
  },
  { 
    icon: <Box className="h-8 w-8" />, 
    position: "top-36 right-[20%]", 
    delay: "1.8s",
    color: "text-[hsl(280,100%,65%)]"
  },
  { 
    icon: <Palette className="h-6 w-6" />, 
    position: "top-52 right-[12%]", 
    delay: "0.7s",
    color: "text-[hsl(174,100%,50%)]"
  },
  { 
    icon: <Video className="h-7 w-7" />, 
    position: "top-[65%] right-[18%]", 
    delay: "1.3s",
    color: "text-[hsl(320,100%,60%)]"
  },
  { 
    icon: <Mic className="h-5 w-5" />, 
    position: "top-[80%] right-[25%]", 
    delay: "2.2s",
    color: "text-[hsl(25,100%,55%)]"
  },
];

export function FloatingIcons() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {floatingIcons.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.position} ${item.color} opacity-40 animate-pulse-glow`}
          style={{ 
            animationDelay: item.delay,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <div 
            className="animate-float"
            style={{ animationDelay: item.delay }}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
