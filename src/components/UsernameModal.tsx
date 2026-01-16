import React, { useState } from "react";
import { X } from "lucide-react";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string, name: string) => void;
}

const UsernameModal = ({ isOpen, onClose, onSuccess }: UsernameModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === "mik" && password === "1971") {
      onSuccess("mik-admin-id", "Mik");
      onClose();
      return;
    }
    if (username.trim()) {
      onSuccess(crypto.randomUUID(), username);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="w-full max-w-md p-8 bg-[#1A1F2C] border border-white/10 rounded-2xl relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black font-orbitron tracking-widest text-white uppercase">Identification</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 font-orbitron tracking-wider">PSEUDO</label>
            <input
              type="text"
              className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-white outline-none focus:border-cyan-500 transition-all font-orbitron"
              placeholder="IDENTIFIANT..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-400 font-orbitron tracking-wider">PASSWORD</label>
            <input
              type="password"
              className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-white outline-none focus:border-cyan-500 transition-all font-orbitron"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-lg transition-all font-orbitron text-xs tracking-[0.3em]"
          >
            ACCÉDER AU SYSTÈME
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
