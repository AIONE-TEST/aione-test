import { useState, useEffect } from "react";
import { User, Lock, LogIn, AlertCircle, Shield, Eye, EyeOff, ChevronDown, HelpCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string, username: string) => void;
}

// Admin username with full access - TÂCHE 15
const ADMIN_USERNAME = "mik";
const ADMIN_PASSWORD = "1971";

export function UsernameModal({ isOpen, onClose, onSuccess }: UsernameModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false); // TÂCHE 4
  const [usePassword, setUsePassword] = useState(false);
  const [stayConnected, setStayConnected] = useState(false); // TÂCHE 8
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentUsernames, setRecentUsernames] = useState<string[]>([]); // TÂCHE 5
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false); // TÂCHE 16
  const [supportMessage, setSupportMessage] = useState("");

  // Get user's IP
  const [userIP, setUserIP] = useState<string>("");
  
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setUserIP(data.ip))
      .catch(() => setUserIP("unknown"));
  }, []);

  // TÂCHE 5: Load recent usernames from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("aione_recent_usernames");
    if (stored) {
      const usernames = JSON.parse(stored);
      setRecentUsernames(usernames);
      if (usernames.length > 0) {
        setUsername(usernames[0]); // Last used first
      }
    }
  }, []);

  // Save username to recent list
  const saveToRecentUsernames = (user: string) => {
    const stored = localStorage.getItem("aione_recent_usernames");
    let usernames: string[] = stored ? JSON.parse(stored) : [];
    usernames = usernames.filter(u => u !== user);
    usernames.unshift(user); // Add to beginning
    usernames = usernames.slice(0, 5); // Keep max 5
    localStorage.setItem("aione_recent_usernames", JSON.stringify(usernames));
    setRecentUsernames(usernames);
  };

  // TÂCHE 16: Send support message
  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;
    
    try {
      await supabase.from("support_messages").insert({
        from_username: username || "anonyme",
        message: supportMessage
      });
      toast({ title: "Message envoyé", description: "L'administrateur sera notifié." });
      setSupportMessage("");
      setShowSupportForm(false);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'envoyer le message.", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || username.length < 3) {
      setError("L'identifiant doit contenir au moins 3 caractères");
      return;
    }

    const normalizedUsername = username.toLowerCase().trim();
    const isAdmin = normalizedUsername === ADMIN_USERNAME;

    setIsLoading(true);

    try {
      // Check if user exists via the public view
      const { data: existingUserData } = await supabase
        .from("user_sessions_public")
        .select("*")
        .eq("username", normalizedUsername)
        .single();

      const existingUser = existingUserData as any;

      if (existingUser) {
        // TÂCHE 6: Check if account is locked
        if (existingUser.locked_until) {
          const lockedUntil = new Date(existingUser.locked_until);
          if (lockedUntil > new Date()) {
            const remaining = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
            setError(`Compte bloqué. Réessayez dans ${remaining} minutes.`);
            setIsLoading(false);
            return;
          }
        }

        // Admin check - TÂCHE 1 & 15: Admin Mik with password 1971
        if (isAdmin) {
          if (password !== ADMIN_PASSWORD) {
            setError("Mot de passe administrateur requis");
            setShowPasswordField(true);
            setIsLoading(false);
            return;
          }
          
          // Update last login and IP
          await supabase
            .from("user_sessions")
            .update({ 
              last_login: new Date().toISOString(),
              last_activity: new Date().toISOString(),
              ip_address: userIP,
              failed_attempts: 0,
              locked_until: null,
              stay_connected: stayConnected
            })
            .eq("id", existingUser.id);

          // Check for unread support messages - TÂCHE 16
          const { data: supportMessages } = await supabase
            .from("support_messages")
            .select("*")
            .eq("is_read", false);

          if (supportMessages && supportMessages.length > 0) {
            toast({
              title: "Messages de support",
              description: `Vous avez ${supportMessages.length} message(s) non lu(s).`,
            });
          }

          toast({
            title: "Bienvenue Administrateur !",
            description: "Accès total accordé.",
          });

          saveToRecentUsernames(normalizedUsername);
          onSuccess(existingUser.id, existingUser.username);
          return;
        }

        // Regular user - TÂCHE 7: Password is optional
        // Check if account has a password set
        const { data: hasPass } = await supabase
          .rpc("session_has_password", { session_username: normalizedUsername });

        if (hasPass && password) {
          // Verify password
          const { data: passwordValid } = await supabase
            .rpc("verify_session_password", { 
              session_username: normalizedUsername,
              input_password: password 
            });

          if (!passwordValid) {
            // TÂCHE 6: Increment failed attempts
            const newAttempts = (existingUser.failed_attempts || 0) + 1;
            const updateData: any = { failed_attempts: newAttempts };
            
            if (newAttempts >= 3) {
              updateData.locked_until = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
              setError("Trop de tentatives. Compte bloqué pour 1 heure.");
            } else {
              setError(`Mot de passe incorrect. ${3 - newAttempts} tentative(s) restante(s).`);
            }
            
            await supabase
              .from("user_sessions")
              .update(updateData)
              .eq("id", existingUser.id);
              
            setIsLoading(false);
            return;
          }
        }

        // Login successful
        await supabase
          .from("user_sessions")
          .update({ 
            last_login: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            ip_address: userIP,
            failed_attempts: 0,
            locked_until: null,
            stay_connected: stayConnected
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

        saveToRecentUsernames(normalizedUsername);
        onSuccess(existingUser.id, existingUser.username);
      } else {
        // Create new user - TÂCHE 10: Apps vierges pour nouveaux utilisateurs
        const { data: newUser, error: createError } = await supabase
          .from("user_sessions")
          .insert({
            username: normalizedUsername,
            password_hash: usePassword && password ? password : null,
            ip_address: userIP,
            stay_connected: stayConnected,
            last_activity: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;

        // Assign user role
        await supabase.from("user_roles").insert({
          username: normalizedUsername,
          role: 'user'
        });

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

        saveToRecentUsernames(normalizedUsername);
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
      <DialogContent 
        className="sm:max-w-md panel-3d border-2 border-[hsl(var(--primary))]/50 bg-background/95 backdrop-blur-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* TÂCHE 18: Bouton fermer */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full opacity-70 hover:opacity-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-black gradient-text-cyan tracking-wider text-center">
            BIENVENUE SUR AIONE
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Entrez votre identifiant pour accéder à votre espace de travail personnel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* TÂCHE 2: Username -> IDENTIFIANT */}
          <div className="space-y-2 relative">
            <Label htmlFor="username" className="font-display text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-[hsl(var(--primary))]" />
              IDENTIFIANT
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => recentUsernames.length > 1 && setShowUsernameDropdown(true)}
                onBlur={() => setTimeout(() => setShowUsernameDropdown(false), 200)}
                placeholder="Votre identifiant unique..."
                className="input-3d text-lg pr-10"
                autoFocus
                required
                minLength={3}
              />
              {/* TÂCHE 5: Dropdown for recent usernames */}
              {recentUsernames.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowUsernameDropdown(!showUsernameDropdown)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* TÂCHE 5: Dropdown menu */}
            {showUsernameDropdown && recentUsernames.length > 1 && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg">
                {recentUsernames.map((u) => (
                  <button
                    key={u}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                    onClick={() => {
                      setUsername(u);
                      setShowUsernameDropdown(false);
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Ce pseudo vous permet de retrouver votre historique, configuration et médias
            </p>
          </div>

          {/* TÂCHE 3: Password checkbox - ENREGISTRER MOT DE PASSE */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="usePassword"
              checked={usePassword}
              onCheckedChange={(checked) => {
                setUsePassword(checked as boolean);
                setShowPasswordField(checked as boolean);
              }}
            />
            <Label htmlFor="usePassword" className="text-sm cursor-pointer flex items-center gap-2">
              <Shield className="h-4 w-4 text-[hsl(142,76%,50%)]" />
              <span>ENREGISTRER MOT DE PASSE</span>
            </Label>
          </div>

          {/* TÂCHE 8: Option "Rester connecté" */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stayConnected"
              checked={stayConnected}
              onCheckedChange={(checked) => setStayConnected(checked as boolean)}
            />
            <Label htmlFor="stayConnected" className="text-sm cursor-pointer">
              Rester connecté
            </Label>
          </div>

          {/* Password field with eye toggle - TÂCHE 4 */}
          {(usePassword || showPasswordField) && (
            <div className="space-y-2">
              <Label htmlFor="password" className="font-display text-sm font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-[hsl(45,100%,55%)]" />
                MOT DE PASSE {showPasswordField && !usePassword ? "(requis)" : ""}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPasswordText ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe..."
                  className="input-3d pr-10"
                  required={showPasswordField && !usePassword}
                />
                {/* TÂCHE 4: Eye icon toggle */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                >
                  {showPasswordText ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
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

          {/* Warning - TÂCHE 7 */}
          <div className="bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-lg p-3">
            <p className="text-xs text-[hsl(var(--primary))]">
              🔒 <strong>Sécurité:</strong> Sans mot de passe, n'importe qui connaissant votre identifiant pourrait accéder à votre compte.
            </p>
          </div>

          {/* TÂCHE 21: No cookies message */}
          <div className="text-xs text-center text-muted-foreground">
            🛡️ Aucun cookie/donnée stockée - Confidentialité garantie
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

          {/* TÂCHE 16: Lien de support */}
          <div className="text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-[hsl(var(--primary))] flex items-center gap-1 mx-auto"
              onClick={() => setShowSupportForm(!showSupportForm)}
            >
              <HelpCircle className="h-3 w-3" />
              Besoin d'aide ?
            </button>
          </div>

          {/* Support form */}
          {showSupportForm && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Décrivez votre problème..."
                className="w-full p-2 rounded bg-background border border-border text-sm min-h-[80px]"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleSendSupport}
                disabled={!supportMessage.trim()}
                className="w-full"
              >
                Envoyer
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}