import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string, username: string, remember: boolean) => void;
}

export default function UsernameModal({ isOpen, onClose, onSuccess }: UsernameModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Veuillez entrer un pseudo");
      return;
    }

    if (isLocked) {
      toast.error("Trop de tentatives. Veuillez réessayer plus tard.");
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists via the public view
      const { data: existingUser, error: lookupError } = await supabase
        .from("user_sessions_public")
        .select("id, username")
        .eq("username", username.trim())
        .maybeSingle();

      if (lookupError) {
        console.error("Lookup error:", lookupError);
      }

      if (existingUser) {
        // User exists - check if they have a password
        const { data: hasPassword } = await supabase
          .rpc("session_has_password", { session_username: username.trim() });

        if (hasPassword) {
          // User has password - verify it
          if (!password) {
            setNeedsPassword(true);
            setIsLoading(false);
            return;
          }

          const { data: passwordValid } = await supabase
            .rpc("verify_session_password", { 
              input_password: password,
              session_username: username.trim()
            });

          if (!passwordValid) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);
            
            if (newAttempts >= 5) {
              setIsLocked(true);
              toast.error("Compte verrouillé après 5 tentatives.");
            } else {
              toast.error(`Mot de passe incorrect. ${5 - newAttempts} tentative(s) restante(s).`);
            }
            setIsLoading(false);
            return;
          }
        }

        // Update last login
        await supabase
          .from("user_sessions")
          .update({ last_login: new Date().toISOString() })
          .eq("id", existingUser.id);

        toast.success(`Bienvenue, ${username}!`);
        onSuccess(existingUser.id, username, rememberMe);
      } else {
        // New user - create session
        const { data: newSession, error: insertError } = await supabase
          .from("user_sessions")
          .insert({ 
            username: username.trim(),
            last_login: new Date().toISOString()
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          toast.error("Erreur lors de la création de la session");
          setIsLoading(false);
          return;
        }

        toast.success(`Bienvenue, ${username}! Votre compte a été créé.`);
        onSuccess(newSession.id, username, rememberMe);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)] border-2 border-[hsl(174,100%,50%,0.3)] shadow-[0_0_50px_hsl(174,100%,50%,0.15)]">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-[hsl(174,100%,50%,0.2)] to-[hsl(280,100%,65%,0.2)] border border-[hsl(174,100%,50%,0.3)]">
              <Sparkles className="h-10 w-10 text-[hsl(174,100%,50%)]" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-display font-black gradient-text-cyan tracking-wider">
            BIENVENUE
          </DialogTitle>
          <DialogDescription className="text-[hsl(215,20%,55%)] font-display tracking-wide">
            Entrez votre pseudo pour accéder à AIONE
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[hsl(215,20%,70%)] font-display tracking-wide flex items-center gap-2">
              <User className="h-4 w-4 text-[hsl(174,100%,50%)]" />
              PSEUDO
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre pseudo..."
              className="bg-[hsl(220,20%,15%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-[hsl(174,100%,50%)] focus:ring-[hsl(174,100%,50%,0.3)] font-display tracking-wide text-lg py-6"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {needsPassword && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[hsl(215,20%,70%)] font-display tracking-wide flex items-center gap-2">
                <Lock className="h-4 w-4 text-[hsl(280,100%,65%)]" />
                MOT DE PASSE
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe..."
                className="bg-[hsl(220,20%,15%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-[hsl(280,100%,65%)] focus:ring-[hsl(280,100%,65%,0.3)] font-display tracking-wide text-lg py-6"
                disabled={isLoading || isLocked}
              />
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-[hsl(174,100%,50%,0.5)] data-[state=checked]:bg-[hsl(174,100%,50%)] data-[state=checked]:border-[hsl(174,100%,50%)]"
            />
            <Label htmlFor="remember" className="text-[hsl(215,20%,55%)] font-display text-sm tracking-wide cursor-pointer">
              Se souvenir de moi
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full btn-3d-cyan text-white font-display font-bold text-lg tracking-wider py-6 group"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                CONNEXION...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                ENTRER
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
