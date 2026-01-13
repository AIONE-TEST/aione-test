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
  Flame
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
    icon: <MessageSquare className="h-5 w-5" />, 
    path: "/llms",
    colorClass: "text-[hsl(320,100%,60%)]",
    btn3dClass: "btn-3d-pink",
    glowClass: "glow-pink"
  },
  { 
    id: "video", 
    label: "VIDÉO", 
    icon: <Video className="h-5 w-5" />, 
    path: "/videos",
    colorClass: "text-[hsl(280,100%,65%)]",
    btn3dClass: "btn-3d-purple",
    glowClass: "glow-purple"
  },
  { 
    id: "image", 
    label: "IMAGE", 
    icon: <Image className="h-5 w-5" />, 
    path: "/images",
    colorClass: "text-[hsl(320,100%,60%)]",
    btn3dClass: "btn-3d-pink",
    glowClass: "glow-pink"
  },
  { 
    id: "retouch", 
    label: "RETOUCH", 
    icon: <Wand2 className="h-5 w-5" />, 
    path: "/retouch",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan",
    glowClass: "glow-cyan"
  },
  { 
    id: "audio", 
    label: "AUDIO", 
    icon: <Music className="h-5 w-5" />, 
    path: "/audio",
    colorClass: "text-[hsl(45,100%,55%)]",
    btn3dClass: "btn-3d-yellow",
    glowClass: "glow-yellow"
  },
  { 
    id: "3d", 
    label: "3D", 
    icon: <Box className="h-5 w-5" />, 
    path: "/3d",
    colorClass: "text-[hsl(142,76%,50%)]",
    btn3dClass: "btn-3d-green",
    glowClass: "glow-green"
  },
  { 
    id: "apps", 
    label: "APPS", 
    icon: <AppWindow className="h-5 w-5" />, 
    path: "/apps",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan",
    glowClass: "glow-cyan"
  },
  { 
    id: "api", 
    label: "API", 
    icon: <Key className="h-5 w-5" />, 
    path: "/keys",
    colorClass: "text-[hsl(45,100%,55%)]",
    btn3dClass: "btn-3d-yellow",
    glowClass: "glow-yellow"
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[160px] flex-col bg-gradient-to-b from-[hsl(220,20%,10%)] to-[hsl(220,25%,6%)] border-r-2 border-[hsl(220,15%,25%)] shadow-2xl">
      {/* Logo AIONE */}
      <Link 
        to="/" 
        className="flex flex-col items-center gap-2 py-6 px-4 border-b-2 border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)] transition-all duration-300 group"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(280,100%,65%)] via-[hsl(320,100%,60%)] to-[hsl(174,100%,50%)] glow-purple shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <Zap className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
        <span className="font-display text-3xl font-black gradient-text-pink text-glow-pink tracking-widest">
          AIONE
        </span>
        <span className="font-display text-[10px] text-[hsl(174,100%,50%)] tracking-[0.25em] uppercase">
          AI Gateway
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
                "flex items-center gap-3 px-4 py-3 rounded-xl font-display text-sm font-bold tracking-wider transition-all duration-300 transform",
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
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t-2 border-[hsl(220,15%,25%)] p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[hsl(25,100%,55%)] animate-pulse" />
            <span className="font-display text-[10px] text-[hsl(25,100%,55%)] tracking-wider">
              NSFW READY
            </span>
          </div>
          <p className="text-center font-display text-[10px] text-[hsl(215,20%,45%)] tracking-wider">
            V2.0 <span className="text-[hsl(174,100%,50%)] font-bold">NEO</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
