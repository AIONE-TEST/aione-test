// Large Category Icons Component
import { 
  MessageSquare, 
  Video, 
  Image, 
  Wand2, 
  Music, 
  Box, 
  Code,
  Flame,
  FileText,
  Mic,
  Camera,
  Clapperboard
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  category: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLabel?: boolean;
}

const categoryConfig: Record<string, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  images: { 
    icon: <Image />, 
    color: "text-[hsl(320,100%,60%)]", 
    bgColor: "bg-[hsl(320,100%,60%)]/20",
    label: "IMAGE"
  },
  videos: { 
    icon: <Clapperboard />, 
    color: "text-[hsl(280,100%,65%)]", 
    bgColor: "bg-[hsl(280,100%,65%)]/20",
    label: "VIDÉO"
  },
  llms: { 
    icon: <MessageSquare />, 
    color: "text-[hsl(174,100%,50%)]", 
    bgColor: "bg-[hsl(174,100%,50%)]/20",
    label: "TEXTE"
  },
  audio: { 
    icon: <Music />, 
    color: "text-[hsl(45,100%,55%)]", 
    bgColor: "bg-[hsl(45,100%,55%)]/20",
    label: "AUDIO"
  },
  retouch: { 
    icon: <Wand2 />, 
    color: "text-[hsl(174,100%,50%)]", 
    bgColor: "bg-[hsl(174,100%,50%)]/20",
    label: "RETOUCH"
  },
  "3d": { 
    icon: <Box />, 
    color: "text-[hsl(142,76%,50%)]", 
    bgColor: "bg-[hsl(142,76%,50%)]/20",
    label: "3D"
  },
  code: { 
    icon: <Code />, 
    color: "text-[hsl(210,100%,60%)]", 
    bgColor: "bg-[hsl(210,100%,60%)]/20",
    label: "CODE"
  },
  uncensored: { 
    icon: <Flame />, 
    color: "text-[hsl(25,100%,55%)]", 
    bgColor: "bg-[hsl(25,100%,55%)]/20",
    label: "+18"
  },
  text: { 
    icon: <FileText />, 
    color: "text-[hsl(174,100%,50%)]", 
    bgColor: "bg-[hsl(174,100%,50%)]/20",
    label: "TEXTE"
  },
  voice: { 
    icon: <Mic />, 
    color: "text-[hsl(45,100%,55%)]", 
    bgColor: "bg-[hsl(45,100%,55%)]/20",
    label: "VOIX"
  },
  photo: { 
    icon: <Camera />, 
    color: "text-[hsl(320,100%,60%)]", 
    bgColor: "bg-[hsl(320,100%,60%)]/20",
    label: "PHOTO"
  },
};

const sizeClasses = {
  sm: { icon: "h-4 w-4", container: "h-8 w-8", text: "text-[10px]" },
  md: { icon: "h-6 w-6", container: "h-10 w-10", text: "text-xs" },
  lg: { icon: "h-8 w-8", container: "h-14 w-14", text: "text-sm" },
  xl: { icon: "h-10 w-10", container: "h-16 w-16", text: "text-base" },
};

export function CategoryIcon({ category, size = "md", className, showLabel = false }: CategoryIconProps) {
  const config = categoryConfig[category] || categoryConfig.text;
  const sizes = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-xl",
        sizes.container,
        config.bgColor,
        config.color
      )}>
        <div className={sizes.icon}>
          {config.icon}
        </div>
      </div>
      {showLabel && (
        <span className={cn("font-display font-bold tracking-wider", sizes.text, config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Multi-category display for apps with multiple capabilities
interface MultiCategoryIconsProps {
  categories: string[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MultiCategoryIcons({ categories, size = "sm", className }: MultiCategoryIconsProps) {
  const sizes = sizeClasses[size];
  
  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {categories.slice(0, 4).map((cat) => {
        const config = categoryConfig[cat] || categoryConfig.text;
        return (
          <div 
            key={cat}
            className={cn(
              "flex items-center justify-center rounded-lg",
              sizes.container,
              config.bgColor,
              config.color
            )}
            title={config.label}
          >
            <div className={sizes.icon}>
              {config.icon}
            </div>
          </div>
        );
      })}
      {categories.length > 4 && (
        <span className="font-display text-xs text-muted-foreground">
          +{categories.length - 4}
        </span>
      )}
    </div>
  );
}
