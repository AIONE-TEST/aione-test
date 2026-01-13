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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  colorClass: string;
  btn3dClass: string;
}

const navItems: NavItem[] = [
  { 
    id: "llms", 
    label: "LLMS", 
    icon: <MessageSquare className="h-4 w-4" />, 
    path: "/llms",
    colorClass: "text-[hsl(320,100%,60%)]",
    btn3dClass: "btn-3d-pink"
  },
  { 
    id: "video", 
    label: "VIDÉO", 
    icon: <Video className="h-4 w-4" />, 
    path: "/videos",
    colorClass: "text-[hsl(280,100%,65%)]",
    btn3dClass: "btn-3d-purple"
  },
  { 
    id: "image", 
    label: "IMAGE", 
    icon: <Image className="h-4 w-4" />, 
    path: "/images",
    colorClass: "text-[hsl(320,100%,60%)]",
    btn3dClass: "btn-3d-pink"
  },
  { 
    id: "retouch", 
    label: "RETOUCH", 
    icon: <Wand2 className="h-4 w-4" />, 
    path: "/retouch",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan"
  },
  { 
    id: "audio", 
    label: "AUDIO", 
    icon: <Music className="h-4 w-4" />, 
    path: "/audio",
    colorClass: "text-[hsl(45,100%,55%)]",
    btn3dClass: "btn-3d-yellow"
  },
  { 
    id: "3d", 
    label: "3D", 
    icon: <Box className="h-4 w-4" />, 
    path: "/3d",
    colorClass: "text-[hsl(142,76%,50%)]",
    btn3dClass: "btn-3d-green"
  },
  { 
    id: "apps", 
    label: "APPS", 
    icon: <AppWindow className="h-4 w-4" />, 
    path: "/apps",
    colorClass: "text-[hsl(174,100%,50%)]",
    btn3dClass: "btn-3d-cyan"
  },
  { 
    id: "api", 
    label: "API", 
    icon: <Key className="h-4 w-4" />, 
    path: "/keys",
    colorClass: "text-[hsl(25,100%,55%)]",
    btn3dClass: "btn-3d-orange"
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[140px] flex-col bg-[hsl(220,20%,8%)] border-r border-[hsl(220,15%,20%)]">
      {/* Logo AIONE */}
      <Link 
        to="/" 
        className="flex flex-col items-center gap-1 py-6 px-3 border-b border-[hsl(220,15%,20%)] hover:bg-[hsl(220,15%,12%)] transition-colors"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] glow-purple">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <span className="font-display text-2xl font-black gradient-text-pink text-glow-pink tracking-wider">
          AIONE
        </span>
        <span className="font-display text-[8px] text-[hsl(174,100%,50%)] tracking-[0.2em]">
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
                "flex items-center gap-2 px-3 py-2.5 rounded-lg font-display text-xs font-bold tracking-wide transition-all duration-200",
                isActive 
                  ? cn(item.btn3dClass, "text-white") 
                  : "btn-3d text-[hsl(215,20%,65%)] hover:text-white"
              )}
            >
              <span className={cn(isActive ? "text-white" : item.colorClass)}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version */}
      <div className="border-t border-[hsl(220,15%,20%)] p-3">
        <p className="text-center font-display text-[8px] text-[hsl(215,20%,45%)] tracking-wider">
          V2.0 <span className="text-[hsl(174,100%,50%)]">NEO</span>
        </p>
      </div>
    </aside>
  );
}
