import React, { useState, useEffect } from "react";
import { LayoutGrid, Star, History, Settings, Sun, Globe } from "lucide-react";
import { UsernameModal } from "../components/UsernameModal";

export default function Index() {
  const [time, setTime] = useState(new Date());
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const languages = ["FR", "EN", "ES", "DE", "ZH", "IT", "RU", "HI", "RO", "PL", "AR"];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = (id: string, name: string) => {
    console.log("Connecté en tant que:", name);
    setIsLoginOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0A0C10] overflow-hidden">
      <UsernameModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />

      <nav className="w-24 border-r border-white/5 flex flex-col items-center py-8 bg-[#0F1115] z-50">
        <div className="text-cyan-500 mb-10">
          <LayoutGrid size={28} />
        </div>

        <div className="flex flex-col gap-8">
          <button className="p-3 text-gray-500 hover:text-cyan-400 transition-colors">
            <Star size={24} />
          </button>
          <button className="p-3 text-gray-500 hover:text-cyan-400 transition-colors">
            <History size={24} />
          </button>
          <button className="p-3 text-gray-500 hover:text-cyan-400 transition-colors">
            <Settings size={24} />
          </button>
        </div>

        <div className="mt-auto w-full px-2 flex flex-col gap-3 pb-4">
          <div className="flex flex-col items-center gap-1 bg-white/5 py-1.5 rounded-lg border border-white/5">
            <Globe size={12} className="text-cyan-500/40" />
            <select className="bg-transparent text-[9px] text-cyan-400 outline-none font-bold cursor-pointer font-orbitron">
              {languages.map((l) => (
                <option key={l} value={l} className="bg-[#0F1115]">
                  {l}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.open("https://www.google.com/maps", "_blank")}
            className="w-full aspect-square bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-around py-3 transition-all hover:border-cyan-500/40 group shadow-lg"
          >
            <Sun size={28} className="text-yellow-500 animate-spin-slow" />
            <div className="text-center">
              <span className="block text-base font-bold text-white leading-none">18°C</span>
              <span className="text-[8px] text-cyan-400 font-bold uppercase opacity-60">Paris, FR</span>
            </div>
            <div className="text-[7px] text-gray-500 font-bold font-orbitron">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | 2026
            </div>
          </button>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden bg-[#0A0C10]">{/* Ton contenu principal original ici */}</main>
    </div>
  );
}
