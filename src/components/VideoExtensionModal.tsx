import { useState } from "react";
import { Film, ChevronLeft, ChevronRight, Timer, Wand2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface VideoExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  modelName: string;
  onExtend: (options: ExtensionOptions) => Promise<void>;
}

interface ExtensionOptions {
  direction: "start" | "end" | "both";
  duration: number; // in seconds
  preserveStyle: boolean;
}

// TÂCHE 23 & 24: Extension vidéo pour Runway Gen-3 et Kling AI
export function VideoExtensionModal({ 
  isOpen, 
  onClose, 
  videoUrl, 
  modelName,
  onExtend 
}: VideoExtensionModalProps) {
  const [direction, setDirection] = useState<"start" | "end" | "both">("end");
  const [duration, setDuration] = useState(5);
  const [isExtending, setIsExtending] = useState(false);

  const isRunway = modelName.toLowerCase().includes("runway");
  const isKling = modelName.toLowerCase().includes("kling");

  const handleExtend = async () => {
    setIsExtending(true);
    try {
      await onExtend({
        direction,
        duration,
        preserveStyle: true
      });
      onClose();
    } catch (error) {
      console.error("Extension error:", error);
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg panel-3d">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
            <Film className="h-5 w-5 text-[hsl(280,100%,65%)]" />
            EXTENSION VIDÉO
          </DialogTitle>
          <DialogDescription>
            Étendez votre vidéo avec {modelName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Video Preview */}
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video 
              src={videoUrl} 
              className="w-full h-full object-contain"
              controls
              muted
            />
          </div>

          {/* Direction Selection - TÂCHE 23: Runway supports direction */}
          {isRunway && (
            <div className="space-y-3">
              <Label className="font-display text-sm font-bold">
                DIRECTION DE L'EXTENSION
              </Label>
              <RadioGroup
                value={direction}
                onValueChange={(v) => setDirection(v as any)}
                className="flex gap-2"
              >
                <div className={cn(
                  "flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  direction === "start" 
                    ? "border-[hsl(280,100%,65%)] bg-[hsl(280,100%,65%)]/10" 
                    : "border-border hover:border-muted-foreground"
                )}>
                  <RadioGroupItem value="start" id="start" />
                  <Label htmlFor="start" className="cursor-pointer flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Début
                  </Label>
                </div>
                <div className={cn(
                  "flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  direction === "end" 
                    ? "border-[hsl(280,100%,65%)] bg-[hsl(280,100%,65%)]/10" 
                    : "border-border hover:border-muted-foreground"
                )}>
                  <RadioGroupItem value="end" id="end" />
                  <Label htmlFor="end" className="cursor-pointer flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    Fin
                  </Label>
                </div>
                <div className={cn(
                  "flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  direction === "both" 
                    ? "border-[hsl(280,100%,65%)] bg-[hsl(280,100%,65%)]/10" 
                    : "border-border hover:border-muted-foreground"
                )}>
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="cursor-pointer flex items-center gap-2">
                    Les deux
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Duration Selection - TÂCHE 24: Kling uses duration in seconds */}
          <div className="space-y-3">
            <Label className="font-display text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-[hsl(280,100%,65%)]" />
                DURÉE D'EXTENSION
              </span>
              <span className="text-[hsl(280,100%,65%)]">{duration} secondes</span>
            </Label>
            <Slider
              value={[duration]}
              onValueChange={([v]) => setDuration(v)}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1s</span>
              <span>5s</span>
              <span>10s</span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-[hsl(280,100%,65%)]" />
              Le style et les mouvements du clip original seront conservés.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={handleExtend}
            disabled={isExtending}
            className="flex-1 btn-3d-purple"
          >
            {isExtending ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Film className="h-4 w-4 mr-2" />
                Étendre la vidéo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}