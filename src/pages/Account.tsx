import { useState, useEffect } from "react";
import { User, Image, Video, Music, History, Settings, Save, Camera, FileText, Download, Trash2, LogOut, Shield, Eye, EyeOff, Key, Code, FileJson } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GenerationGallery } from "@/components/GenerationGallery";

// Récupère le flag de mode développement depuis localStorage
const getDevModeEnabled = () => {
  try {
    return localStorage.getItem("AIONE_DEV_MODE") === "true";
  } catch {
    return false;
  }
};

const setDevModeEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem("AIONE_DEV_MODE", enabled ? "true" : "false");
    // Dispatch custom event pour notifier App.tsx
    window.dispatchEvent(new CustomEvent("devModeChanged", { detail: enabled }));
  } catch {
    // ignore
  }
};

interface GenerationHistoryItem {
  id: string;
  type: "image" | "video" | "audio" | "3d" | "retouch" | "chat";
  prompt: string;
  thumbnail_url: string | null;
  result_url: string | null;
  created_at: string;
  model_name: string | null;
  aspect_ratio: string | null;
}

interface UserNote {
  id: string;
  content: string;
  format: string;
}

const Account = () => {
  const { session, logout, updateSettings } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [saveHistory, setSaveHistory] = useState(false);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [note, setNote] = useState<UserNote | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteFormat, setNoteFormat] = useState("txt");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [devModeEnabled, setDevMode] = useState(getDevModeEnabled());

  // Export historique en CSV ou JSON
  const handleExportHistory = (format: "csv" | "json") => {
    if (history.length === 0) {
      toast({ title: "Aucun historique à exporter" });
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      const exportData = history.map(item => ({
        type: item.type,
        prompt: item.prompt,
        model: item.model_name,
        date: item.created_at,
        url: item.result_url,
        thumbnail: item.thumbnail_url,
        aspect_ratio: item.aspect_ratio
      }));
      content = JSON.stringify(exportData, null, 2);
      filename = `aione-history-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = "application/json";
    } else {
      // CSV
      const headers = ["Type", "Prompt", "Modèle", "Date", "URL", "Thumbnail", "Aspect Ratio"];
      const rows = history.map(item => [
        item.type,
        `"${(item.prompt || "").replace(/"/g, '""')}"`,
        item.model_name || "",
        item.created_at,
        item.result_url || "",
        item.thumbnail_url || "",
        item.aspect_ratio || ""
      ]);
      content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      filename = `aione-history-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Historique exporté en ${format.toUpperCase()}` });
  };

  // Toggle mode développement
  const handleToggleDevMode = (enabled: boolean) => {
    setDevMode(enabled);
    setDevModeEnabled(enabled);
    toast({
      title: enabled ? "Mode développement activé" : "Mode développement désactivé",
      description: enabled 
        ? "Le pop-up d'identification sera affiché au prochain chargement" 
        : "Le pop-up d'identification restera masqué"
    });
  };

  // Load user data
  useEffect(() => {
    if (session?.id) {
      // Load history
      supabase
        .from("generation_history")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => {
          if (data) setHistory(data as GenerationHistoryItem[]);
        });

      // Load note
      supabase
        .from("user_notes")
        .select("*")
        .eq("session_id", session.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setNote(data as UserNote);
            setNoteContent(data.content);
            setNoteFormat(data.format);
          }
        });

      // Load settings
      supabase
        .from("user_sessions")
        .select("*")
        .eq("id", session.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setDisplayName(data.username);
            setSaveHistory(data.save_history || false);
          }
        });
    }
  }, [session?.id]);

  const handleSaveNote = async () => {
    if (!session?.id || !note?.id) return;
    
    setIsSavingNote(true);
    const { error } = await supabase
      .from("user_notes")
      .update({ content: noteContent, format: noteFormat })
      .eq("id", note.id);

    if (!error) {
      toast({ title: "Note sauvegardée !" });
    }
    setIsSavingNote(false);
  };

  const handleDownloadNote = () => {
    const blob = new Blob([noteContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes.${noteFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = async () => {
    if (!session?.id) return;
    
    await supabase
      .from("generation_history")
      .delete()
      .eq("session_id", session.id);
    
    setHistory([]);
    toast({ title: "Historique effacé" });
  };

  const handleToggleSaveHistory = async (value: boolean) => {
    setSaveHistory(value);
    await updateSettings({ save_history: value });
    toast({ 
      title: value ? "Historique activé" : "Historique désactivé",
      description: value ? "Vos générations seront enregistrées" : "Vos générations ne seront plus enregistrées"
    });
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  // Filter by type for tabs
  const imageHistory = history.filter(h => h.type === "image" || h.type === "retouch");
  const videoHistory = history.filter(h => h.type === "video");
  const audioHistory = history.filter(h => h.type === "audio");

  const handleDeleteItem = async (id: string) => {
    await supabase.from("generation_history").delete().eq("id", id);
    setHistory(prev => prev.filter(h => h.id !== id));
    toast({ title: "Élément supprimé" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(210,100%,60%)] to-[hsl(280,100%,65%)] glow-blue">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black gradient-text-cyan tracking-wider">
                MON ESPACE - {session?.username?.toUpperCase() || "UTILISATEUR"}
              </h1>
              <p className="text-sm text-muted-foreground">Espace personnel sécurisé et privé</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2 btn-3d">
            <LogOut className="h-4 w-4" />
            DÉCONNEXION
          </Button>
        </div>

        {/* Main Layout: 2 colonnes */}
        <div className="grid grid-cols-[350px_1fr] gap-6 mb-6">
          {/* Colonne gauche - Profil */}
          <div className="space-y-4">
            <Card className="panel-3d p-5">
              <h2 className="font-display text-lg font-bold gradient-text-cyan mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                PROFIL
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] flex items-center justify-center glow-purple">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[hsl(174,100%,50%)] flex items-center justify-center hover:scale-110 transition-transform">
                    <Camera className="h-3 w-3 text-black" />
                  </button>
                </div>
                <div>
                  <p className="font-display font-bold text-lg">{session?.username || "Anonyme"}</p>
                  <p className="text-xs text-muted-foreground">IP: {session?.ip_address || "N/A"}</p>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Sauvegarder l'historique</span>
                  </div>
                  <Switch checked={saveHistory} onCheckedChange={handleToggleSaveHistory} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Espace privé</span>
                  </div>
                  <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]">ACTIF</Badge>
                </div>

                {/* Mode développement toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-[hsl(25,100%,55%)]" />
                    <span className="text-sm">Mode développement</span>
                  </div>
                  <Switch checked={devModeEnabled} onCheckedChange={handleToggleDevMode} />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Active/désactive le pop-up d'identification sans toucher au code
                </p>
              </div>
            </Card>

            {/* Stats */}
            <Card className="panel-3d p-5">
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-3">STATISTIQUES</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[hsl(320,100%,60%)]/10 border border-[hsl(320,100%,60%)]/30">
                  <span className="font-display text-xl font-bold text-[hsl(320,100%,60%)]">{imageHistory.length}</span>
                  <p className="text-[10px] text-muted-foreground">IMAGES</p>
                </div>
                <div className="p-2 rounded-lg bg-[hsl(280,100%,65%)]/10 border border-[hsl(280,100%,65%)]/30">
                  <span className="font-display text-xl font-bold text-[hsl(280,100%,65%)]">{videoHistory.length}</span>
                  <p className="text-[10px] text-muted-foreground">VIDÉOS</p>
                </div>
                <div className="p-2 rounded-lg bg-[hsl(25,100%,55%)]/10 border border-[hsl(25,100%,55%)]/30">
                  <span className="font-display text-xl font-bold text-[hsl(25,100%,55%)]">{audioHistory.length}</span>
                  <p className="text-[10px] text-muted-foreground">AUDIO</p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              {/* Export historique */}
              <div className="flex gap-2">
                <Button onClick={() => handleExportHistory("csv")} variant="outline" className="flex-1 btn-3d gap-2">
                  <Download className="h-4 w-4" />
                  EXPORT CSV
                </Button>
                <Button onClick={() => handleExportHistory("json")} variant="outline" className="flex-1 btn-3d gap-2">
                  <FileJson className="h-4 w-4" />
                  EXPORT JSON
                </Button>
              </div>
              <Button onClick={handleClearHistory} variant="outline" className="w-full btn-3d gap-2 text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
                EFFACER L'HISTORIQUE
              </Button>
            </div>
          </div>

          {/* Colonne droite - Galerie médias avec onglets */}
          <Card className="panel-3d p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold gradient-text-purple flex items-center gap-2">
                <Image className="h-5 w-5" />
                GALERIE MÉDIAS
              </h2>
              <Badge variant="outline">{history.length} éléments</Badge>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all" className="text-xs">
                  TOUS ({history.length})
                </TabsTrigger>
                <TabsTrigger value="images" className="text-xs">
                  <Image className="h-3 w-3 mr-1" />
                  IMAGES ({imageHistory.length})
                </TabsTrigger>
                <TabsTrigger value="videos" className="text-xs">
                  <Video className="h-3 w-3 mr-1" />
                  VIDÉOS ({videoHistory.length})
                </TabsTrigger>
                <TabsTrigger value="audio" className="text-xs">
                  <Music className="h-3 w-3 mr-1" />
                  AUDIO ({audioHistory.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <GenerationGallery 
                  items={history} 
                  onDelete={handleDeleteItem}
                  maxHeight="400px"
                />
              </TabsContent>

              <TabsContent value="images">
                <GenerationGallery 
                  items={imageHistory} 
                  onDelete={handleDeleteItem}
                  maxHeight="400px"
                />
              </TabsContent>

              <TabsContent value="videos">
                <GenerationGallery 
                  items={videoHistory} 
                  onDelete={handleDeleteItem}
                  maxHeight="400px"
                />
              </TabsContent>

              <TabsContent value="audio">
                <GenerationGallery 
                  items={audioHistory} 
                  onDelete={handleDeleteItem}
                  maxHeight="400px"
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Notes section */}
        <Card className="panel-3d p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold gradient-text-yellow flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PENSE-BÊTE / NOTES
            </h2>
            <div className="flex items-center gap-2">
              <Select value={noteFormat} onValueChange={setNoteFormat}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">.TXT</SelectItem>
                  <SelectItem value="json">.JSON</SelectItem>
                  <SelectItem value="md">.MD</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleDownloadNote} size="sm" variant="outline" className="gap-1">
                <Download className="h-3 w-3" />
              </Button>
              <Button onClick={handleSaveNote} size="sm" className="btn-3d-green gap-1" disabled={isSavingNote}>
                <Save className="h-3 w-3" />
                SAUVEGARDER
              </Button>
            </div>
          </div>
          
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Écrivez vos notes ici... Elles seront sauvegardées automatiquement dans votre espace."
            className="input-3d min-h-[150px] font-mono text-sm resize-y"
          />
          <p className="text-xs text-muted-foreground mt-2">
            💡 Vos notes sont sauvegardées dans votre espace personnel et ne disparaissent jamais sauf suppression manuelle.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Account;
