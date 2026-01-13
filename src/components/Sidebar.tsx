import { Link, useLocation } from "react-router-dom";
import { 
  MessageSquare, 
  Video, 
  Image, 
  Wand2, 
  Music, 
  Box, 
  Key, 
  LayoutGrid, 
  AppWindow, 
  User,
  Zap,
  ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
}

const navItems: NavItem[] = [
  { 
    id: "llms", 
    label: "LLMS", 
    icon: <MessageSquare className="h-5 w-5" />, 
    path: "/llms",
    color: "text-[hsl(320,100%,60%)]",
    bgColor: "bg-[hsl(320,100%,60%)]"
  },
  { 
    id: "video", 
    label: "VIDÉO", 
    icon: <Video className="h-5 w-5" />, 
    path: "/videos",
    color: "text-[hsl(280,100%,65%)]",
    bgColor: "bg-[hsl(280,100%,65%)]"
  },
  { 
    id: "image", 
    label: "IMAGE", 
    icon: <Image className="h-5 w-5" />, 
    path: "/images",
    color: "text-[hsl(320,100%,60%)]",
    bgColor: "bg-[hsl(320,100%,60%)]"
  },
  { 
    id: "retouch", 
    label: "RETOUCH", 
    icon: <Wand2 className="h-5 w-5" />, 
    path: "/retouch",
    color: "text-[hsl(174,100%,50%)]",
    bgColor: "bg-[hsl(174,100%,50%)]"
  },
  { 
    id: "audio", 
    label: "AUDIO", 
    icon: <Music className="h-5 w-5" />, 
    path: "/audio",
    color: "text-[hsl(45,100%,55%)]",
    bgColor: "bg-[hsl(45,100%,55%)]"
  },
  { 
    id: "3d", 
    label: "3D", 
    icon: <Box className="h-5 w-5" />, 
    path: "/3d",
    color: "text-[hsl(142,76%,50%)]",
    bgColor: "bg-[hsl(142,76%,50%)]"
  },
  { 
    id: "cles", 
    label: "CLÉS", 
    icon: <Key className="h-5 w-5" />, 
    path: "/keys",
    color: "text-[hsl(45,100%,55%)]",
    bgColor: "bg-[hsl(45,100%,55%)]"
  },
  { 
    id: "apis", 
    label: "APIS", 
    icon: <LayoutGrid className="h-5 w-5" />, 
    path: "/apis",
    color: "text-[hsl(210,100%,60%)]",
    bgColor: "bg-[hsl(210,100%,60%)]"
  },
  { 
    id: "apps", 
    label: "APPS", 
    icon: <AppWindow className="h-5 w-5" />, 
    path: "/apps",
    color: "text-[hsl(174,100%,50%)]",
    bgColor: "bg-[hsl(174,100%,50%)]"
  },
  { 
    id: "perso", 
    label: "PERSO", 
    icon: <User className="h-5 w-5" />, 
    path: "/profile",
    color: "text-[hsl(25,100%,55%)]",
    bgColor: "bg-[hsl(25,100%,55%)]"
  },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border/50 bg-sidebar-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-40"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-border/50 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] glow-purple">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <span className="font-display text-lg font-bold gradient-text-pink">AIONE</span>
            <p className="text-[10px] text-muted-foreground">AI GATEWAY</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path.includes('category') && location.search.includes(item.id));
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-muted/50",
                isActive ? "bg-muted/70" : ""
              )}
            >
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                item.bgColor + "/20",
                item.color
              )}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className={cn("font-display text-xs tracking-wider", item.color)}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="border-t border-border/50 p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          {!isCollapsed && <span>Réduire</span>}
        </button>
        {!isCollapsed && (
          <p className="mt-2 px-3 text-[10px] text-muted-foreground">
            v2.0 <span className="text-[hsl(174,100%,50%)]">Neo</span>
          </p>
        )}
      </div>
    </aside>
  );
}
