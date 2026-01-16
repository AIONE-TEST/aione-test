import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, HelpCircle, Lock } from "lucide-react";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string, username: string, remember: boolean) => void;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sécurité
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<string>("");

  // Aide
  const [showHelp, setShowHelp] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");

  // Gestion du verrouillage
  useEffect(() => {
    const checkLockout = () => {
      const lockoutEnd = localStorage.getItem("mik_lockout_end");
      const storedAttempts = localStorage.getItem("mik_attempts");
      if (storedAttempts) setAttempts(parseInt(storedAttempts));
      if (lockoutEnd) {
        const endTime = parseInt(lockoutEnd);
        if (Date.now() < endTime) {
          setIsLocked(true);
          const interval = setInterval(() => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
              setIsLocked(false);
              setAttempts(0);
              localStorage.removeItem("mik_lockout_end");
              localStorage.removeItem("mik_attempts");
              clearInterval(interval);
            } else {
              const minutes = Math.floor((remaining / 1000 / 60) % 60);
              const seconds = Math.floor((remaining / 1000) % 60);
              setLockoutTimer(`${minutes}m ${seconds}s`);
            }
          }, 1000);
          return () => clearInterval(interval);
        } else {
          setIsLocked(false);
          setAttempts(0);
          localStorage.removeItem("mik_lockout_end");
        }
      }
    };
    checkLockout();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const cleanUsername = username.trim();
    if (!cleanUsername) return;
    setLoading(true);

    // --- SÉCURITÉ ADMIN "MIK" ---
    if (cleanUsername.toLowerCase() === "mik") {
      if (password !== "1971") {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem("mik_attempts", newAttempts.toString());
        if (newAttempts >= 5) {
          const lockoutTime = Date.now() + 60 * 60 * 1000;
          localStorage.setItem("mik_lockout_end", lockoutTime.toString());
          setIsLocked(true);
          toast.error("SÉCURITÉ : Accès bloqué 1h.");
        } else {
          toast.error(`Mot de passe incorrect. Essais : ${5 - newAttempts}`);
        }
        setLoading(false);
        return;
      } else {
        setAttempts(0);
        localStorage.removeItem("mik_attempts");
        localStorage.removeItem("mik_lockout_end");
      }
    }

    try {
      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await supabase
        .from("user_sessions_public")
        .select("id, username")
        .eq("username", cleanUsername)
        .maybeSingle();

      let sessionId: string;

      if (existingUser) {
        // Utilisateur existant - utiliser son ID
        sessionId = existingUser.id!;
        
        // Mettre à jour last_login
        await supabase
          .from("user_sessions")
          .update({ last_login: new Date().toISOString() })
          .eq("id", sessionId);
      } else {
        // Nouvel utilisateur - créer une session
        const { data: newSession, error: insertError } = await supabase
          .from("user_sessions")
          .insert([{ username: cleanUsername }])
          .select("id")
          .single();

        if (insertError) throw insertError;
        sessionId = newSession.id;
      }

      onSuccess(sessionId, cleanUsername, rememberMe);
      toast.success(`Bienvenue ${cleanUsername}`);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur connexion");
    } finally {
      setLoading(false);
    }
  };

  const sendHelpRequest = async () => {
    if (!helpMessage.trim()) return;
    try {
      await supabase.from("notifications").insert([{ 
        title: "HELP_REQUEST",
        message: helpMessage,
        type: "help"
      }]);
      toast.success("Alerte envoyée.");
      setShowHelp(false);
      setHelpMessage("");
    } catch (e) {
      toast.error("Erreur d'envoi");
    }
  };

  if (showHelp) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-md p-6 bg-[#0F1115] border border-cyan-500/30 rounded-xl relative pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
          <h3 className="text-xl font-orbitron text-cyan-500 mb-4">ASSISTANCE</h3>
          <textarea
            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white mb-4 h-32 outline-none font-sans"
            value={helpMessage}
            onChange={(e) => setHelpMessage(e.target.value)}
            placeholder="Décrivez votre problème..."
          />
          <button
            onClick={sendHelpRequest}
            className="w-full py-2 bg-cyan-600 text-white font-orbitron rounded hover:bg-cyan-500"
          >
            ENVOYER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div
        className={`w-full max-w-lg p-10 bg-[#0F1115] border border-cyan-500/30 rounded-xl shadow-[0_0_60px_rgba(6,182,212,0.2)] relative pointer-events-auto transition-all ${isLocked ? "grayscale opacity-90" : ""}`}
      >
        <button
          onClick={isLocked ? undefined : onClose}
          disabled={isLocked}
          className={`absolute top-4 right-4 ${isLocked ? "text-gray-700" : "text-gray-500 hover:text-cyan-500"}`}
        >
          <X size={28} />
        </button>

        <h2 className="text-3xl font-orbitron text-white text-center mb-10 tracking-widest font-bold">
          {isLocked ? (
            <span className="text-red-500 flex items-center justify-center gap-2">
              <Lock /> VERROUILLÉ
            </span>
          ) : (
            "AIONE ACCESS"
          )}
        </h2>

        {isLocked && <div className="mb-6 text-center text-red-500 font-mono text-xl">{lockoutTimer}</div>}

        <form onSubmit={handleLoginAttempt} className="space-y-8">
          <div className="space-y-2">
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLocked}
              className={`w-full bg-black/60 border-b-2 border-t-0 border-x-0 border-gray-700 p-4 text-white font-orbitron text-2xl focus:border-cyan-500 outline-none transition-all placeholder:text-gray-700 text-center ${isLocked ? "cursor-not-allowed" : ""}`}
              placeholder="IDENTIFIANT"
              required
            />
          </div>

          <div className="space-y-2 relative">
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked}
              className={`w-full bg-black/60 border-b-2 border-t-0 border-x-0 border-gray-700 p-4 text-white font-orbitron text-2xl focus:border-cyan-500 outline-none transition-all placeholder:text-gray-700 text-center ${isLocked ? "cursor-not-allowed" : ""}`}
              placeholder="******"
            />
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <label htmlFor="remember" className="text-gray-400 text-xs font-orbitron cursor-pointer hover:text-white">
              SE SOUVENIR DE MOI
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className={`w-full py-5 font-orbitron font-bold text-xl tracking-widest rounded transition-all duration-300 mt-4 ${
              isLocked
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-cyan-900/40 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black text-cyan-400"
            }`}
          >
            {loading ? "..." : isLocked ? "REFUSÉ" : "ENTRER"}
          </button>
        </form>

        <button
          onClick={() => setShowHelp(true)}
          className="absolute bottom-3 right-4 text-[10px] text-gray-700 hover:text-cyan-600 flex items-center gap-1 transition-colors opacity-70 hover:opacity-100"
        >
          <HelpCircle size={10} />
          Besoin d'aide ?
        </button>
      </div>
    </div>
  );
};
