import { Link, useLocation } from "react-router-dom";
import { 
  MessageSquare, 
  Video, 
  Image, 
  Wand2, 
  Music, 
  AppWindow, 
  Flame,
  User,
  GraduationCap,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedGlobe } from "./AnimatedGlobe";
import { SessionTimer } from "./SessionTimer";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  colorClass: string;
  btn3dClass: string;
  glowClass: string;
}

// Ordre: VIDÉO, IMAGE, RETOUCHE, CHAT, MUSIQUE, CODAGE, APPLIS, TUTOS, COMPTE
const navItems: NavItem[] = [
  { 
    id: "video", 
    label: "VIDÉO", 
    icon: <Video className="h-10 w-10" />, 
    path: "/videos",
    colorClass: "text-[hsl(280,100%,65%)]",
    btn3dClass: "btn-3d-purple",
    glowClass: "glow-purple"
  },
  { 
    id: "image", 
    label: "IMAGE", 
    icon: <Image className="h-10 w-10" />, 
    path: "/images",
    colorClass: "text-[hsl(320,100%,60%)]",
    btn3dClass: "btn-3d-pink",
    glowClass: "glow-pink"
  },
  { 
    id: "retouch", 
    label: "RETOUCHE", 
    icon: <Wand2 className="h-10 w-10" />, 
    path: "/retouch",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan",
    glowClass: "glow-cyan"
  },
  { 
    id: "chat", 
    label: "CHAT", 
    icon: <MessageSquare className="h-10 w-10" />, 
    path: "/chat",
    colorClass: "text-[hsl(320,100%,60%)]",
    btn3dClass: "btn-3d-pink",
    glowClass: "glow-pink"
  },
  { 
    id: "music", 
    label: "MUSIQUE", 
    icon: <Music className="h-10 w-10" />, 
    path: "/audio",
    colorClass: "text-[hsl(45,100%,55%)]",
    btn3dClass: "btn-3d-yellow",
    glowClass: "glow-yellow"
  },
  { 
    id: "coding", 
    label: "CODAGE", 
    icon: <Code className="h-10 w-10" />, 
    path: "/code",
    colorClass: "text-[hsl(140,70%,50%)]",
    btn3dClass: "btn-3d-green",
    glowClass: "glow-green"
  },
  { 
    id: "apps", 
    label: "APPLIS IA", 
    icon: <AppWindow className="h-10 w-10" />, 
    path: "/apps",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan",
    glowClass: "glow-cyan"
  },
  { 
    id: "tutorials", 
    label: "TUTOS", 
    icon: <GraduationCap className="h-10 w-10" />, 
    path: "/tutorials",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan",
    glowClass: "glow-cyan"
  },
  { 
    id: "account", 
    label: "COMPTE", 
    icon: <User className="h-10 w-10" />, 
    path: "/account",
    colorClass: "text-[hsl(210,100%,60%)]",
    btn3dClass: "btn-3d-blue",
    glowClass: "glow-blue"
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[373px] flex-col bg-gradient-to-b from-[hsl(220,20%,8%)] to-[hsl(220,25%,4%)] border-r-2 border-[hsl(220,15%,25%)] shadow-2xl">
      {/* Logo AIONE with Animated Globe */}
      <Link 
        to="/" 
        className="flex flex-col items-center gap-3 py-6 px-4 border-b-2 border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)] transition-all duration-300 group"
      >
        <div className="transform group-hover:scale-110 transition-transform duration-300">
          <AnimatedGlobe size={100} />
        </div>
        <span className="font-display text-5xl font-black gradient-text-pink text-glow-pink tracking-widest">
          AIONE
        </span>
        <span className="font-display text-sm text-[hsl(174,100%,50%)] tracking-[0.3em] uppercase">
          AI GATEWAY
        </span>
      </Link>

      {/* Navigation Buttons */}
      <nav className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center justify-center gap-4 px-6 py-5 rounded-xl font-display text-lg font-bold tracking-wider transition-all duration-300 transform",
                isActive 
                  ? cn(item.btn3dClass, "text-white scale-105", item.glowClass) 
                  : "btn-3d text-[hsl(215,20%,65%)] hover:text-white hover:scale-102"
              )}
            >
              <span className={cn(
                "transition-all duration-300",
                isActive ? "text-white drop-shadow-lg" : item.colorClass
              )}>
                {item.icon}
              </span>
              <span className="flex-1 text-center text-lg font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t-2 border-[hsl(220,15%,25%)] p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-[hsl(25,100%,55%)] animate-pulse" />
            <span className="font-display text-base text-[hsl(25,100%,55%)] tracking-wider font-bold">
              NSFW READY
            </span>
          </div>
          <p className="text-center font-display text-sm text-[hsl(215,20%,45%)] tracking-wider">
            V2.0 <span className="text-[hsl(174,100%,50%)] font-bold">NEO</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
