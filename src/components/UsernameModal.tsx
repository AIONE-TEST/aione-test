import React, { useState, useEffect } from "react";
import { LayoutGrid, Star, History, Settings, Sun, MapPin, Globe, Clock } from "lucide-react";
import { UsernameModal } from "@/components/UsernameModal";

export default function Index() {
  const [time, setTime] = useState(new Date());
  const languages = ["FR", "EN", "ES", "DE", "ZH", "IT", "RU", "HI", "RO", "PL", "AR"];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-[#0A0C10] overflow-hidden">
      {/* BARRE LATÉRALE - CLONAGE ORIGINAL */}
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
          {/* BOUTON TCHAT SUPPRIMÉ ICI */}
          <button className="p-3 text-gray-500 hover:text-cyan-400 transition-colors">
            <Settings size={24} />
          </button>
        </div>

        {/* GROS BOUTON DYNAMIQUE DANS L'ESPACE VIDE RESTANT */}
        <div className="mt-auto w-full px-2 flex flex-col gap-3">
          {/* Sélecteur de langue */}
          <div className="bg-black/40 p-2 rounded-lg border border-white/5 flex flex-col items-center gap-1">
            <Globe size={12} className="text-cyan-500 opacity-50" />
            <select className="bg-transparent text-[9px] text-cyan-400 outline-none font-bold cursor-pointer font-orbitron">
              {languages.map((l) => (
                <option key={l} value={l} className="bg-[#0F1115]">
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Bloc Météo / Maps */}
          <button
            onClick={() => window.open("https://www.google.com/maps", "_blank")}
            className="w-full aspect-[3/4] bg-gradient-to-b from-cyan-950/20 to-black border border-cyan-500/20 rounded-xl flex flex-col items-center justify-between py-4 transition-all hover:border-cyan-500/50 group"
          >
            <div className="relative">
              <Sun size={32} className="text-yellow-400 animate-[spin_8s_linear_infinite]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping opacity-20" />
            </div>

            <div className="text-center">
              <span className="block text-lg font-bold text-white leading-none">18°C</span>
              <span className="text-[8px] text-cyan-400 uppercase tracking-tighter opacity-70">Paris, FR</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <MapPin size={12} className="text-cyan-500 group-hover:animate-bounce" />
              <div className="text-[7px] text-gray-500 font-bold leading-none text-center font-orbitron">
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                <br />
                2026
              </div>
            </div>
          </button>
        </div>
      </nav>

      {/* ZONE PRINCIPALE - TON CODE ORIGINAL DOIT CONTINUER ICI */}
      <main className="flex-1 relative">{/* Ton contenu Hero, Globe, etc. reste ici sans changement */}</main>
    </div>
  );
}
