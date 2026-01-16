import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Star,
  History,
  Settings,
  Sun,
  CloudRain,
  CloudLightning,
  Cloud,
  MapPin,
  Globe,
} from "lucide-react";

export default function Index() {
  const [time, setTime] = useState(new Date());
  const languages = ["FR", "EN", "ES", "DE", "ZH", "IT", "RU", "HI", "RO", "PL", "AR"];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openMaps = () => window.open("https://www.google.com/maps", "_blank");

  return (
    <div className="flex h-screen bg-[#0A0C10] text-white overflow-hidden font-orbitron">
      {/* BARRE LATÉRALE GAUCHE ORIGINALE MODIFIÉE */}
      <nav className="w-28 border-r border-white/5 flex flex-col items-center py-10 bg-[#0F1115] z-50">
        <div className="text-cyan-500 mb-12 animate-pulse">
          <LayoutGrid size={32} />
        </div>

        {/* BOUTONS ORIGINAUX (Tchat supprimé) */}
        <div className="flex flex-col gap-10">
          <button className="p-4 text-gray-500 hover:text-cyan-400 transition-all hover:scale-110">
            <Star size={28} />
          </button>
          <button className="p-4 text-gray-500 hover:text-cyan-400 transition-all hover:scale-110">
            <History size={28} />
          </button>
          <button className="p-4 text-gray-500 hover:text-cyan-400 transition-all hover:scale-110">
            <Settings size={28} />
          </button>
        </div>

        {/* GROS BOUTON DYNAMIQUE (INVESTISSEMENT DE L'ESPACE VIDE) */}
        <div className="mt-auto w-full px-2 flex flex-col gap-4">
          {/* SELECTEUR DE LANGUE STYLE COCKPIT */}
          <div className="flex flex-col items-center gap-1 bg-black/40 py-3 rounded-xl border border-white/5">
            <Globe size={14} className="text-cyan-500 opacity-50" />
            <select className="bg-transparent text-[10px] text-cyan-400 outline-none font-black text-center cursor-pointer">
              {languages.map((l) => (
                <option key={l} className="bg-black text-cyan-400">
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* LE GROS BLOC METEO / MAPS */}
          <button
            onClick={openMaps}
            className="group relative w-full aspect-[2/3] bg-gradient-to-b from-cyan-950/20 to-black border border-cyan-500/20 rounded-2xl flex flex-col items-center justify-between py-6 transition-all hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
          >
            {/* ICONE METEO ANIMÉE XXL */}
            <div className="relative">
              <Sun size={42} className="text-yellow-400 animate-[spin_10s_linear_infinite]" />
              <Cloud size={24} className="absolute -bottom-2 -right-2 text-gray-400 animate-bounce" />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">18°C</span>
              <span className="text-[9px] text-cyan-400 font-bold tracking-tighter uppercase opacity-70">
                Paris, FR
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <MapPin size={14} className="text-cyan-500 group-hover:animate-bounce" />
              <div className="text-[8px] text-gray-500 font-bold leading-none text-center">
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                <br />
                2026
              </div>
            </div>

            {/* Effet scanline décoratif */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,255,255,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20 rounded-2xl" />
          </button>
        </div>
      </nav>

      {/* RESTE DU SITE (HERO SECTION, GLOBE ETC - NON MODIFIÉS) */}
      <main className="flex-1 relative overflow-y-auto">
        {/* ... Ton code original de la page d'accueil vient ici ... */}
      </main>
    </div>
  );
}
