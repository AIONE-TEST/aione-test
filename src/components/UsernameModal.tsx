import { useState, useEffect } from "react";
import { User, Lock, LogIn, AlertCircle, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string, username: string) => void;
}

// Admin username with full access
const ADMIN_USERNAME = "mik";

export function UsernameModal({ isOpen, onClose, onSuccess }: UsernameModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usePassword, setUsePassword] = useState(true); // Recommended by default
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get user's IP
  const [userIP, setUserIP] = useState<string>("");
  
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setUserIP(data.ip))
      .catch(() => setUserIP("unknown"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || username.length < 3) {
      setError("Le pseudo doit contenir au moins 3 caractères");
      return;
    }

    // Check for admin bypass
    const isAdmin = username.toLowerCase().trim() === ADMIN_USERNAME;

    setIsLoading(true);

    try {
      // Check if user exists - use view for read (no password_hash exposed)
      const { data: existingUser } = await supabase
        .from("user_sessions_public")
        .select("*")
        .eq("username", username.toLowerCase().trim())
        .maybeSingle();

      if (existingUser) {
        // Check if user has a password set using secure RPC
        const { data: hasPassword } = await supabase
          .rpc("session_has_password", { session_username: username.toLowerCase().trim() });
        
        // Admin bypass OR user without password - direct login
        if (isAdmin || !hasPassword) {
          // Update last login and IP
          await supabase
            .from("user_sessions")
            .update({ 
              last_login: new Date().toISOString(),
              ip_address: userIP 
            })
            .eq("id", existingUser.id);

          // Log activity
          await supabase.from("activity_logs").insert({
            session_id: existingUser.id,
            username: existingUser.username,
            ip_address: userIP,
            action: "login",
            details: { source: "username_modal", admin: isAdmin }
          });

          toast({
            title: isAdmin ? "Bienvenue Administrateur !" : "Bienvenue !",
            description: isAdmin ? "Accès total accordé." : `Ravi de vous revoir, ${existingUser.username} !`,
          });

          onSuccess(existingUser.id!, existingUser.username!);
          return;
        }

        // User exists with password - check password if required
        if (!password) {
          setError("Ce compte est protégé par un mot de passe");
          setIsLoading(false);
          setShowPassword(true);
          return;
        }

        // Verify password using secure RPC (never exposes hash)
        const { data: isValid } = await supabase
          .rpc("verify_session_password", { 
            session_username: username.toLowerCase().trim(), 
            input_password: password 
          });
        
        if (!isValid) {
          setError("Mot de passe incorrect");
          setIsLoading(false);
          return;
        }

        // Update last login and IP
        await supabase
          .from("user_sessions")
          .update({ 
            last_login: new Date().toISOString(),
            ip_address: userIP 
          })
          .eq("id", existingUser.id);

        // Log activity
        await supabase.from("activity_logs").insert({
          session_id: existingUser.id,
          username: existingUser.username,
          ip_address: userIP,
          action: "login",
          details: { source: "username_modal" }
        });

        toast({
          title: "Bienvenue !",
          description: `Ravi de vous revoir, ${existingUser.username} !`,
        });

        onSuccess(existingUser.id, existingUser.username);
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from("user_sessions")
          .insert({
            username: username.toLowerCase().trim(),
            password_hash: usePassword && password ? password : null,
            ip_address: userIP,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Log activity
        await supabase.from("activity_logs").insert({
          session_id: newUser.id,
          username: newUser.username,
          ip_address: userIP,
          action: "signup",
          details: { source: "username_modal", has_password: usePassword && !!password }
        });

        // Create default note for user
        await supabase.from("user_notes").insert({
          session_id: newUser.id,
          content: "",
          format: "txt"
        });

        toast({
          title: "Compte créé !",
          description: `Bienvenue ${newUser.username} ! Votre espace de travail est prêt.`,
        });

        onSuccess(newUser.id, newUser.username);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md panel-3d border-2 border-[hsl(var(--primary))]/50" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-black gradient-text-cyan tracking-wider text-center">
            BIENVENUE SUR AIONE
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Entrez votre pseudo pour accéder à votre espace de travail personnel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-display text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-[hsl(var(--primary))]" />
              PSEUDO
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre pseudo unique..."
              className="input-3d text-lg"
              autoFocus
              required
              minLength={3}
            />
            <p className="text-xs text-muted-foreground">
              Ce pseudo vous permet de retrouver votre historique, configuration et médias
            </p>
          </div>

          {/* Password checkbox - Now recommended */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="usePassword"
              checked={usePassword}
              onCheckedChange={(checked) => setUsePassword(checked as boolean)}
            />
            <Label htmlFor="usePassword" className="text-sm cursor-pointer flex items-center gap-2">
              <Shield className="h-4 w-4 text-[hsl(142,76%,50%)]" />
              <span>Créer un mot de passe <span className="text-[hsl(142,76%,50%)] font-bold">(Recommandé)</span></span>
            </Label>
          </div>

          {/* Password field */}
          {(usePassword || showPassword) && (
            <div className="space-y-2">
              <Label htmlFor="password" className="font-display text-sm font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-[hsl(45,100%,55%)]" />
                MOT DE PASSE {showPassword ? "(requis)" : "(optionnel mais recommandé)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe..."
                className="input-3d"
                required={showPassword}
              />
              <p className="text-xs text-[hsl(45,100%,55%)]">
                ⚠️ Un mot de passe protège votre compte et vos données
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Warning */}
          <div className="bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-lg p-3">
            <p className="text-xs text-[hsl(var(--primary))]">
              🔒 <strong>Sécurité:</strong> Sans mot de passe, n'importe qui connaissant votre pseudo pourrait accéder à votre compte.
            </p>
          </div>

          {/* IP display */}
          {userIP && (
            <div className="text-xs text-muted-foreground text-center">
              IP: {userIP}
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full btn-3d-cyan h-12 font-display font-bold text-lg gap-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                ENTRER
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
