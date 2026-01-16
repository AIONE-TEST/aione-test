import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, HelpCircle, Lock } from "lucide-react";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string, username: string) => void;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // États pour le système de sécurité
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<string>("");

  // États pour l'aide
  const [showHelp, setShowHelp] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");

  // Vérification du verrouillage au chargement
  useEffect(() => {
    const checkLockout = () => {
      const lockoutEnd = localStorage.getItem("mik_lockout_end");
      const storedAttempts = localStorage.getItem("mik_attempts");

      if (storedAttempts) setAttempts(parseInt(storedAttempts));

      if (lockoutEnd) {
        const endTime = parseInt(lockoutEnd);
        if (Date.now() < endTime) {
          setIsLocked(true);
          // Démarrer le décompte
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
          // Verrouillage expiré
          setIsLocked(false);
          setAttempts(0);
          localStorage.removeItem("mik_lockout_end");
        }
      }
    };

    checkLockout();
  }, [isOpen]); // Vérifier à chaque ouverture

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
          const lockoutTime = Date.now() + 60 * 60 * 1000; // 1 heure
          localStorage.setItem("mik_lockout_end", lockoutTime.toString());
          setIsLocked(true);
          toast.error("SÉCURITÉ ACTIVÉE : Trop de tentatives. Accès bloqué 1h.");
        } else {
          toast.error(`Mot de passe incorrect. Essais restants : ${5 - newAttempts}`);
        }
        setLoading(false);
        return;
      } else {
        // Succès Admin : Reset des compteurs
        setAttempts(0);
        localStorage.removeItem("mik_attempts");
        localStorage.removeItem("mik_lockout_end");
      }
    }

    // --- PROCÉDURE DE CONNEXION ---
    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert([{ username: cleanUsername }])
        .select()
        .single();

      if (error) throw error;

      onSuccess(data.id, cleanUsername);
      toast.success(`Session initialisée : ${cleanUsername}`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion serveur");
    } finally {
      setLoading(false);
    }
  };

  const sendHelpRequest = async () => {
    if (!helpMessage.trim()) return;
    try {
      await supabase.from("admin_alerts").insert([
        {
          type: "HELP_REQUEST",
          message: helpMessage,
          status: "pending",
        },
      ]);
      toast.success("Alerte envoyée à l'administrateur.");
      setShowHelp(false);
      setHelpMessage("");
    } catch (e) {
      toast.error("Échec de l'envoi");
    }
  };

  // Rendu de la fenêtre d'aide (Prioritaire)
  if (showHelp) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-md p-6 bg-[#0F1115] border border-cyan-500/30 rounded-xl relative pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
          <h3 className="text-xl font-orbitron text-cyan-500 mb-4">ASSISTANCE</h3>
          <textarea
            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white mb-4 h-32 outline-none focus:border-cyan-500 font-sans"
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
    // CONTAINER PRINCIPAL : pointer-events-none permet de cliquer/scroller à travers le fond transparent
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* LA POP-UP : pointer-events-auto réactive les clics uniquement sur la fenêtre */}
      <div
        className={`w-full max-w-md p-8 bg-[#0F1115] border border-cyan-500/30 rounded-lg shadow-[0_0_40px_rgba(6,182,212,0.15)] relative pointer-events-auto transition-all ${isLocked ? "grayscale opacity-90" : ""}`}
      >
        {/* CROIX DE FERMETURE : Grisée et désactivée si bloqué */}
        <button
          onClick={isLocked ? undefined : onClose}
          disabled={isLocked}
          className={`absolute top-4 right-4 transition-colors ${isLocked ? "text-gray-700 cursor-not-allowed" : "text-gray-500 hover:text-cyan-500"}`}
          title={isLocked ? "Verrouillé" : "Fermer"}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-orbitron text-white text-center mb-8 tracking-widest flex items-center justify-center gap-3">
          {isLocked && <Lock className="text-red-500 animate-pulse" />}
          AIONE ACCESS
        </h2>

        {isLocked && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded text-center">
            <p className="text-red-500 font-orbitron text-xs font-bold mb-2">SYSTÈME VERROUILLÉ</p>
            <p className="text-white font-mono text-xl">{lockoutTimer}</p>
            <p className="text-gray-500 text-[10px] mt-2">Trop de tentatives incorrectes.</p>
          </div>
        )}

        <form onSubmit={handleLoginAttempt} className="space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLocked}
              className={`w-full bg-black/60 border p-3 rounded text-white font-orbitron text-sm outline-none transition-all placeholder:text-gray-600 ${isLocked ? "border-gray-800 text-gray-500 cursor-not-allowed" : "border-gray-800 focus:border-cyan-500"}`}
              placeholder="IDENTIFIANT"
              required
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked}
              className={`w-full bg-black/60 border p-3 rounded text-white font-orbitron text-sm outline-none transition-all placeholder:text-gray-600 ${isLocked ? "border-gray-800 text-gray-500 cursor-not-allowed" : "border-gray-800 focus:border-cyan-500"}`}
              placeholder="MOT DE PASSE (Optionnel sauf Admin)"
            />
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className={`w-full py-3 font-orbitron font-bold tracking-wider rounded transition-all duration-300 ${
              isLocked
                ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                : "bg-cyan-900/50 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black text-cyan-500"
            }`}
          >
            {loading ? "INITIALISATION..." : isLocked ? "ACCÈS REFUSÉ" : "ENTRER"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowHelp(true)}
            className="text-xs text-gray-500 hover:text-cyan-400 flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <HelpCircle size={14} />
            Besoin d'aide ?
          </button>
        </div>
      </div>
    </div>
  );
};
