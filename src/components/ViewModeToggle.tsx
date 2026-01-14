import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewModeToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  className?: string;
}

export function ViewModeToggle({ viewMode, onViewModeChange, className }: ViewModeToggleProps) {
  return (
    <div className={cn("flex gap-1 p-1 rounded-lg bg-muted/30", className)}>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        className={cn(
          "h-7 w-7 p-0",
          viewMode === "grid" ? "btn-3d-cyan" : ""
        )}
        onClick={() => onViewModeChange("grid")}
        title="Vue mosaïque"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        className={cn(
          "h-7 w-7 p-0",
          viewMode === "list" ? "btn-3d-cyan" : ""
        )}
        onClick={() => onViewModeChange("list")}
        title="Vue détails"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
