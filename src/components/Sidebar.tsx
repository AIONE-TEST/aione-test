import { Link, useLocation } from "react-router-dom";
import { 
  MessageSquare, 
  Video, 
  Image, 
  Wand2, 
  Music, 
  Box, 
  Key, 
  AppWindow, 
  Zap,
  Flame,
  User,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  colorClass: string;
  btn3dClass: string;
  glowClass: string;
}

const navItems: NavItem[] = [
  { 
    id: "llms", 
    label: "LLMS", 
    icon: <MessageSquare className="h-6 w-6" />, 
    path: "/llms",
    colorClass: "text-[hsl(320,100%,60%)]",
    btn3dClass: "btn-3d-pink",
    glowClass: "glow-pink"
  },
  { 
    id: "video", 
    label: "VIDÉO", 
    icon: <Video className="h-6 w-6" />, 
    path: "/videos",
    colorClass: "text-[hsl(280,100%,65%)]",
    btn3dClass: "btn-3d-purple",
    glowClass: "glow-purple"
  },
  { 
    id: "image", 
    label: "IMAGE", 
    icon: <Image className="h-6 w-6" />, 
    path: "/images",
    colorClass: "text-[hsl(320,100%,60%)]",
    btn3dClass: "btn-3d-pink",
    glowClass: "glow-pink"
  },
  { 
    id: "retouch", 
    label: "RETOUCHE", 
    icon: <Wand2 className="h-6 w-6" />, 
    path: "/retouch",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan",
    glowClass: "glow-cyan"
  },
  { 
    id: "audio", 
    label: "AUDIO", 
    icon: <Music className="h-6 w-6" />, 
    path: "/audio",
    colorClass: "text-[hsl(45,100%,55%)]",
    btn3dClass: "btn-3d-yellow",
    glowClass: "glow-yellow"
  },
  { 
    id: "apps", 
    label: "APPLIS IA", 
    icon: <AppWindow className="h-6 w-6" />, 
    path: "/apps",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan",
    glowClass: "glow-cyan"
  },
  { 
    id: "api", 
    label: "API KEYS", 
    icon: <Key className="h-6 w-6" />, 
    path: "/keys",
    colorClass: "text-[hsl(45,100%,55%)]",
    btn3dClass: "btn-3d-yellow",
    glowClass: "glow-yellow"
  },
  { 
    id: "tutorials", 
    label: "TUTOS", 
    icon: <GraduationCap className="h-6 w-6" />, 
    path: "/tutorials",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan",
    glowClass: "glow-cyan"
  },
  { 
    id: "account", 
    label: "COMPTE", 
    icon: <User className="h-6 w-6" />, 
    path: "/account",
    colorClass: "text-[hsl(210,100%,60%)]",
    btn3dClass: "btn-3d-blue",
    glowClass: "glow-blue"
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[200px] flex-col bg-gradient-to-b from-[hsl(220,20%,10%)] to-[hsl(220,25%,6%)] border-r-2 border-[hsl(220,15%,25%)] shadow-2xl">
      {/* Logo AIONE */}
      <Link 
        to="/" 
        className="flex flex-col items-center gap-3 py-6 px-4 border-b-2 border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)] transition-all duration-300 group"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(280,100%,65%)] via-[hsl(320,100%,60%)] to-[hsl(174,100%,50%)] glow-purple shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <Zap className="h-10 w-10 text-white drop-shadow-lg" />
        </div>
        <span className="font-display text-4xl font-black gradient-text-pink text-glow-pink tracking-widest">
          AIONE
        </span>
        <span className="font-display text-xs text-[hsl(174,100%,50%)] tracking-[0.3em] uppercase">
          AI GATEWAY
        </span>
      </Link>

      {/* Navigation Buttons */}
      <nav className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-xl font-display text-base font-bold tracking-wider transition-all duration-300 transform",
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
              <span className="flex-1 text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t-2 border-[hsl(220,15%,25%)] p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[hsl(25,100%,55%)] animate-pulse" />
            <span className="font-display text-xs text-[hsl(25,100%,55%)] tracking-wider font-bold">
              NSFW READY
            </span>
          </div>
          <p className="text-center font-display text-xs text-[hsl(215,20%,45%)] tracking-wider">
            V2.0 <span className="text-[hsl(174,100%,50%)] font-bold">NEO</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
