import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
        } else {
          setSuccess("Compte créé avec succès ! Vous êtes maintenant connecté.");
          setTimeout(() => onClose(), 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError(null);
    setSuccess(null);
  };

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md panel-3d border-2 border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center gradient-text-cyan">
            {mode === "login" ? "Connexion" : "Inscription"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === "login" ? "default" : "outline"}
            onClick={() => switchMode("login")}
            className={cn("flex-1 gap-2", mode === "login" ? "btn-3d-cyan" : "btn-3d")}
          >
            <LogIn className="h-4 w-4" />
            Connexion
          </Button>
          <Button
            variant={mode === "signup" ? "default" : "outline"}
            onClick={() => switchMode("signup")}
            className={cn("flex-1 gap-2", mode === "signup" ? "btn-3d-pink" : "btn-3d")}
          >
            <UserPlus className="h-4 w-4" />
            Inscription
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-display text-sm">
                Nom d'affichage
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Votre nom"
                  className="input-3d pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="font-display text-sm">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="input-3d pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-display text-sm">
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-3d pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-[hsl(142,76%,50%)]/10 border border-[hsl(142,76%,50%)]/50 text-sm text-[hsl(142,76%,50%)]">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full gap-2",
              mode === "login" ? "btn-3d-cyan" : "btn-3d-pink"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {mode === "login" ? "Se connecter" : "Créer un compte"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">ou continuer avec</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full btn-3d gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
