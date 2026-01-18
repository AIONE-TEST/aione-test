import { useState, useEffect } from "react";
import { User, Lock, LogIn, AlertCircle, Shield, Eye, EyeOff, ChevronDown, HelpCircle, X, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupportedLanguage } from "@/i18n/translations";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string, username: string) => void;
}

// TÂCHE 2.1: Suppression des mots de passe en dur - Utiliser les fonctions RPC
const ADMIN_USERNAME = "Mik";

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export function UsernameModal({ isOpen, onClose, onSuccess }: UsernameModalProps) {
  const { login } = useSession();
  const { t, language, setLanguage } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [stayConnected, setStayConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentUsernames, setRecentUsernames] = useState<string[]>([]);
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [userIP, setUserIP] = useState<string>("");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Récupération IP utilisateur
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setUserIP(data.ip))
      .catch(() => setUserIP("unknown"));
  }, []);

  // Chargement des pseudos récents
  useEffect(() => {
    const stored = localStorage.getItem("aione_recent_usernames");
    if (stored) {
      const usernames = JSON.parse(stored);
      setRecentUsernames(usernames);
      if (usernames.length > 0) {
        setUsername(usernames[0]);
      }
    }
  }, []);

  const saveToRecentUsernames = (user: string) => {
    const stored = localStorage.getItem("aione_recent_usernames");
    let usernames: string[] = stored ? JSON.parse(stored) : [];
    usernames = usernames.filter((u) => u !== user);
    usernames.unshift(user);
    usernames = usernames.slice(0, 5);
    localStorage.setItem("aione_recent_usernames", JSON.stringify(usernames));
    setRecentUsernames(usernames);
  };

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;

    try {
      await supabase.from("support_messages").insert({
        from_username: username || "anonyme",
        message: supportMessage,
      });
      toast({ title: t.messageSent, description: "" });
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
      setError(t.errorUsernameTooShort);
      return;
    }

    // RESPECT CASSE STRICT: Mik doit être exactement "Mik" (majuscule M, minuscules i et k)
    const trimmedUsername = username.trim();
    const isAdmin = trimmedUsername === ADMIN_USERNAME; // Comparaison EXACTE avec casse
    
    // Pour les non-admins, on normalise en minuscules
    // Pour l'admin, on garde la casse exacte
    const normalizedUsername = isAdmin ? trimmedUsername : trimmedUsername.toLowerCase();

    // BUG FIX CRITIQUE: Admin DOIT OBLIGATOIREMENT entrer son mot de passe
    if (isAdmin) {
      if (!password) {
        setError("⚠️ Mot de passe OBLIGATOIRE pour l'administrateur Mik");
        setShowPasswordField(true);
        setUsePassword(true);
        return;
      }
      // Vérification mot de passe admin STRICT avec casse
      if (password !== "1971") {
        setError("❌ Mot de passe incorrect");
        return;
      }
    }

    setIsLoading(true);

    try {
      const { data: existingUserData } = await supabase
        .from("user_sessions_public")
        .select("*")
        .eq("username", normalizedUsername)
        .single();

      const existingUser = existingUserData as any;

      if (existingUser) {
        // Vérification blocage
        if (existingUser.locked_until) {
          const lockedUntil = new Date(existingUser.locked_until);
          if (lockedUntil > new Date()) {
            const remaining = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
            setError(`${t.errorAccountLocked} (${remaining} min)`);
            setIsLoading(false);
            return;
          }
        }

        // Vérification admin - TÂCHE 2.1: Utiliser RPC sécurisé
        if (isAdmin) {
          const { data: adminValid } = await supabase.rpc("verify_admin_password", {
            admin_username: normalizedUsername,
            admin_password: password
          });

          if (!adminValid) {
            setError(t.errorPasswordRequired);
            setShowPasswordField(true);
            setIsLoading(false);
            return;
          }

          await supabase
            .from("user_sessions")
            .update({
              last_login: new Date().toISOString(),
              last_activity: new Date().toISOString(),
              ip_address: userIP,
              failed_attempts: 0,
              locked_until: null,
              stay_connected: stayConnected,
            })
            .eq("id", existingUser.id);

          // Notification messages support pour admin
          const { data: supportMessages } = await supabase.from("support_messages").select("*").eq("is_read", false);

          if (supportMessages && supportMessages.length > 0) {
            toast({
              title: "Messages de support",
              description: `Vous avez ${supportMessages.length} message(s) non lu(s).`,
            });
          }

          toast({
            title: t.successLogin,
            description: "Bienvenue Administrateur !",
          });

          saveToRecentUsernames(normalizedUsername);
          login(existingUser.id, existingUser.username);
          onSuccess(existingUser.id, existingUser.username);
          onClose();
          return;
        }

        // Vérification mot de passe utilisateur via RPC sécurisé
        const { data: hasPass } = await supabase.rpc("session_has_password", { session_username: normalizedUsername });

        if (hasPass) {
          if (!password) {
            setError(t.errorPasswordRequired);
            setShowPasswordField(true);
            setIsLoading(false);
            return;
          }

          const { data: passwordValid } = await supabase.rpc("verify_session_password", {
            session_username: normalizedUsername,
            input_password: password,
          });

          if (!passwordValid) {
            const newAttempts = (existingUser.failed_attempts || 0) + 1;
            const updateData: any = { failed_attempts: newAttempts };

            // TÂCHE 1.5: BLOCAGE APRÈS 10 TENTATIVES
            if (newAttempts >= 10) {
              updateData.locked_until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
              setError(t.errorAccountLocked);
            } else {
              setError(`${t.errorWrongPassword} (${10 - newAttempts} essais restants)`);
            }

            await supabase.from("user_sessions").update(updateData).eq("id", existingUser.id);

            setIsLoading(false);
            return;
          }
        }

        // Connexion réussie
        await supabase
          .from("user_sessions")
          .update({
            last_login: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            ip_address: userIP,
            failed_attempts: 0,
            locked_until: null,
            stay_connected: stayConnected,
          })
          .eq("id", existingUser.id);

        await supabase.from("activity_logs").insert({
          session_id: existingUser.id,
          username: existingUser.username,
          ip_address: userIP,
          action: "login",
          details: { source: "username_modal" },
        });

        toast({
          title: t.successLogin,
          description: `Bienvenue ${existingUser.username} !`,
        });

        saveToRecentUsernames(normalizedUsername);
        login(existingUser.id, existingUser.username);
        onSuccess(existingUser.id, existingUser.username);
        onClose();
      } else {
        // Création nouveau compte
        const { data: newUser, error: createError } = await supabase
          .from("user_sessions")
          .insert({
            username: normalizedUsername,
            password_hash: usePassword && password ? password : null,
            ip_address: userIP,
            stay_connected: stayConnected,
            last_activity: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;

        await supabase.from("user_roles").insert({
          username: normalizedUsername,
          role: "user",
        });

        await supabase.from("activity_logs").insert({
          session_id: newUser.id,
          username: newUser.username,
          ip_address: userIP,
          action: "signup",
          details: { source: "username_modal", has_password: usePassword && !!password },
        });

        await supabase.from("user_notes").insert({
          session_id: newUser.id,
          content: "",
          format: "txt",
        });

        toast({
          title: t.successAccountCreated,
          description: `Bienvenue ${newUser.username} !`,
        });

        saveToRecentUsernames(normalizedUsername);
        login(newUser.id, newUser.username);
        onSuccess(newUser.id, newUser.username);
        onClose();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentLang = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md panel-3d border-2 border-[hsl(var(--primary))]/50 bg-background/95 backdrop-blur-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        {/* TÂCHE 1.15: Sélecteur de langue */}
        <div className="absolute left-4 top-4 relative">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <Globe className="h-3 w-3" />
            {currentLang.flag} {currentLang.code.toUpperCase()}
          </Button>
          {showLanguageDropdown && (
            <div className="absolute z-50 top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[150px]">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  className="w-full px-3 py-2 text-left hover:bg-muted text-sm flex items-center gap-2"
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguageDropdown(false);
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Croix de fermeture - permet de visualiser le site sans s'identifier */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full opacity-70 hover:opacity-100 hover:bg-[hsl(0,100%,50%)]/20 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader className="mt-4">
          <DialogTitle className="font-display text-2xl font-black gradient-text-cyan tracking-wider text-center">
            {t.loginTitle}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {t.loginDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2 relative">
            <Label htmlFor="username" className="font-display text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-[hsl(var(--primary))]" />
              {t.identifierLabel}
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => recentUsernames.length > 1 && setShowUsernameDropdown(true)}
                onBlur={() => setTimeout(() => setShowUsernameDropdown(false), 200)}
                placeholder={t.identifierPlaceholder}
                className="input-3d text-lg pr-10"
                autoFocus
                required
                minLength={3}
              />
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
          </div>

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
              <span>{t.savePassword}</span>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="stayConnected"
              checked={stayConnected}
              onCheckedChange={(checked) => setStayConnected(checked as boolean)}
            />
            <Label htmlFor="stayConnected" className="text-sm cursor-pointer">
              {t.stayConnected}
            </Label>
          </div>

          {(usePassword || showPasswordField) && (
            <div className="space-y-2">
              <Label htmlFor="password" className="font-display text-sm font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-[hsl(45,100%,55%)]" />
                {t.passwordLabel}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPasswordText ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="input-3d pr-10"
                  required={showPasswordField && !usePassword}
                />
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
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* TÂCHE 1.14: Message de confidentialité */}
          <div className="text-xs text-center text-muted-foreground">
            🛡️ {t.noCookiesMessage}
          </div>

          {userIP && <div className="text-xs text-muted-foreground text-center">IP: {userIP}</div>}

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
                {t.loginButton}
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-[hsl(var(--primary))] flex items-center gap-1 mx-auto"
              onClick={() => setShowSupportForm(!showSupportForm)}
            >
              <HelpCircle className="h-3 w-3" />
              {t.needHelp}
            </button>
          </div>

          {showSupportForm && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder={t.helpPlaceholder}
                className="w-full p-2 rounded bg-background border border-border text-sm min-h-[80px]"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleSendSupport}
                disabled={!supportMessage.trim()}
                className="w-full"
              >
                {t.sendMessage}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
