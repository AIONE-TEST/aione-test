import React, { useState } from "react";
import { X } from "lucide-react";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string, name: string, remember: boolean) => void;
}

export const UsernameModal = ({ isOpen, onClose, onSuccess }: UsernameModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // LOGIQUE BYPASS STRICTE
    if (username.toLowerCase() === "mik" && password === "1971") {
      onSuccess("mik-admin-id", "Mik", remember);
      onClose();
      return;
    }
    if (username.trim()) {
      onSuccess(crypto.randomUUID(), username, remember);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl p-6 bg-[#0F1115] border border-white/10 rounded-xl relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Connexion</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Pseudo</label>
            <input
              type="text"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500 transition-all uppercase"
              placeholder="Entrez votre pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-cyan-500 transition-all"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all"
          >
            Continuer
          </button>
        </form>
      </div>
    </div>
  );
};
