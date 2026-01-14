import React, { useState, forwardRef } from "react";
import { Flame, AlertTriangle, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AdultDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  serviceName: string;
}

export const AdultDisclaimerModal = forwardRef<HTMLDivElement, AdultDisclaimerModalProps>(
  function AdultDisclaimerModal({ isOpen, onClose, onAccept, serviceName }, ref) {
    const [agreed, setAgreed] = useState(false);

    const handleAccept = () => {
      if (agreed) {
        onAccept();
        setAgreed(false);
      }
    };

    const handleClose = () => {
      setAgreed(false);
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent ref={ref} className="sm:max-w-md panel-3d border-2 border-[hsl(25,100%,55%)]/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-display text-xl text-[hsl(25,100%,55%)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(25,100%,55%)]/20">
                <Flame className="h-5 w-5 text-[hsl(25,100%,55%)] animate-pulse" />
              </div>
              Contenu pour Adultes
            </DialogTitle>
            <DialogDescription className="text-left">
              Cette application contient du contenu réservé aux personnes majeures.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Warning Box */}
            <div className="rounded-lg bg-[hsl(0,85%,60%)]/10 p-4 border border-[hsl(0,85%,60%)]/30">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-6 w-6 text-[hsl(0,85%,60%)] flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[hsl(0,85%,60%)]">
                    Avertissement Important
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Ce service ({serviceName}) peut générer du contenu explicite</li>
                    <li>• Vous devez avoir 18 ans ou plus pour continuer</li>
                    <li>• L'utilisation doit respecter les lois de votre pays</li>
                    <li>• Vous êtes responsable de l'usage que vous en faites</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Age Verification */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="adult-confirm"
                name="adult-confirm"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1 border-[hsl(25,100%,55%)]"
              />
              <Label
                htmlFor="adult-confirm"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Je confirme avoir <span className="text-[hsl(25,100%,55%)] font-bold">18 ans ou plus</span> et je comprends que ce service peut contenir du contenu pour adultes.
              </Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 btn-3d font-display text-sm"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!agreed}
                className="flex-1 btn-3d-orange font-display text-sm gap-2"
              >
                <Flame className="h-4 w-4" />
                Continuer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
