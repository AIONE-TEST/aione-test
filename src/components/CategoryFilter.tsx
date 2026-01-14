import { AICategory } from "@/data/aiModels";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  Video, 
  MessageSquare, 
  Music, 
  Wand2, 
  Box, 
  Code, 
  ShieldOff,
  LayoutGrid
} from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: AICategory | "all";
  onCategoryChange: (category: AICategory | "all") => void;
}

const categories: { id: AICategory | "all"; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "TOUS", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "videos", label: "VIDÉO", icon: <Video className="h-4 w-4" /> },
  { id: "images", label: "IMAGE", icon: <Image className="h-4 w-4" /> },
  { id: "retouch", label: "RETOUCHE", icon: <Wand2 className="h-4 w-4" /> },
  { id: "adult", label: "CONTENU ADULTE", icon: <ShieldOff className="h-4 w-4" /> },
  { id: "audio", label: "MUSIQUE", icon: <Music className="h-4 w-4" /> },
  { id: "llms", label: "CHAT", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "3d", label: "3D", icon: <Box className="h-4 w-4" /> },
  { id: "code", label: "CODAGE", icon: <Code className="h-4 w-4" /> },
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="gap-2"
        >
          {category.icon}
          {category.label}
        </Button>
      ))}
    </div>
  );
}
