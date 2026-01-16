import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string, username: string) => void;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Optionnel selon ta base
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert([{ username: username.trim() }])
        .select()
        .single();

      if (error) throw error;
      onSuccess(data.id, username.trim());
      toast.success(`Bienvenue sur AIONE, ${username}`);
    } catch (error) {
      toast.error("Erreur de connexion");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-8 bg-[#1A1D23] border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        <h2 className="text-2xl font-orbitron text-white text-center mb-6 tracking-widest">ACCÈS UNITÉ CENTRALE</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cyan-500 text-xs font-orbitron mb-2">IDENTIFIANT</label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-cyan-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-cyan-500 text-xs font-orbitron mb-2">MOT DE PASSE (OPTIONNEL)</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron text-sm tracking-tighter rounded-lg transition-all shadow-lg"
          >
            {loading ? "AUTHENTIFICATION..." : "INITIALISER LA SESSION"}
          </button>
        </form>
      </div>
    </div>
  );
};
