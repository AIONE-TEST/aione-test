import React, { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

const Account = () => {
  const { session, logout } = useSession(); // Récupération de la fonction logout
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ... (votre code handleUpdatePassword existant) ...

  return (
    <div className="min-h-screen bg-[#0F1115] p-8 font-orbitron text-white">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header avec bouton déconnexion */}
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4">
          <h1 className="text-3xl tracking-tighter">COMPTE : {session?.username}</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-900/30 border border-red-500/50 hover:bg-red-900/60 px-4 py-2 rounded text-xs transition-all"
            title="Se déconnecter / Changer d'utilisateur"
          >
            <LogOut size={14} />
            DÉCONNEXION
          </button>
        </div>

        {/* ... Reste du formulaire (Mots de passe) ... */}
        {/* ... */}
      </div>
    </div>
  );
};

export default Account;
