import { useState, useEffect } from "react";
import { User, Image, Video, Music, History, Settings, Save, Camera, FileText, Download, Trash2, LogOut, Shield, AlertTriangle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { APIKeyManager } from "@/components/APIKeyManager";

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
  const { session, logout, updateSettings, deleteHistory } = useSession();
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState("");
  const [saveHistory, setSaveHistory] = useState(false);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [note, setNote] = useState<UserNote | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteFormat, setNoteFormat] = useState("txt");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

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

  // TÂCHE 1.14: Supprimer TOUTES les données utilisateur
  const handleDeleteAllData = async () => {
    if (!session?.id) return;
    
    setIsDeletingAll(true);
    try {
      await deleteHistory();
      setHistory([]);
      setNoteContent("");
      toast({ 
        title: t.dataDeleted,
        description: t.noCookiesMessage
      });
    } catch (error) {
      console.error("Error deleting all data:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer les données.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingAll(false);
    }
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

  // Filter history by type
  const imageHistory = history.filter(h => h.type === "image" || h.type === "retouch");
  const videoHistory = history.filter(h => h.type === "video");
  const audioHistory = history.filter(h => h.type === "audio");

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
            {t.logout}
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
              </div>

              {/* TÂCHE 1.14: Message de confidentialité */}
              <div className="mt-4 p-3 bg-[hsl(142,76%,50%)]/10 border border-[hsl(142,76%,50%)]/30 rounded-lg">
                <p className="text-xs text-[hsl(142,76%,50%)]">
                  🛡️ {t.noCookiesMessage}
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
              <Button onClick={handleClearHistory} variant="outline" className="w-full btn-3d gap-2 text-orange-400 hover:text-orange-300">
                <Trash2 className="h-4 w-4" />
                EFFACER L'HISTORIQUE
              </Button>

              {/* TÂCHE 1.14: Bouton suppression TOUTES les données */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full btn-3d gap-2 text-red-500 hover:text-red-400 border-red-500/50 hover:border-red-400/50"
                    disabled={isDeletingAll}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {t.deleteAllData}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="panel-3d">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="h-5 w-5" />
                      {t.deleteConfirmation}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes vos données seront définitivement supprimées :
                      <ul className="mt-2 list-disc list-inside text-sm">
                        <li>Historique des générations</li>
                        <li>Logs d'activité</li>
                        <li>Conversations</li>
                        <li>Notes personnelles</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAllData}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {t.confirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Colonne droite - Galerie médias */}
          <Card className="panel-3d p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold gradient-text-purple flex items-center gap-2">
                <Image className="h-5 w-5" />
                GALERIE MÉDIAS
              </h2>
              <Badge variant="outline">{history.length} éléments</Badge>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-display text-lg text-muted-foreground">AUCUNE GÉNÉRATION</p>
                <p className="text-sm text-muted-foreground mt-1">Vos créations apparaîtront ici</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    className={cn(
                      "relative rounded-lg overflow-hidden border-2 cursor-pointer hover:scale-105 transition-transform",
                      item.type === "image" || item.type === "retouch" ? "border-[hsl(320,100%,60%)]/30" :
                      item.type === "video" ? "border-[hsl(280,100%,65%)]/30" :
                      "border-[hsl(25,100%,55%)]/30",
                      // Aspect ratio based on item
                      item.aspect_ratio === "9:16" ? "aspect-[9/16]" :
                      item.aspect_ratio === "16:9" ? "aspect-video" :
                      item.aspect_ratio === "4:3" ? "aspect-[4/3]" :
                      "aspect-square"
                    )}
                  >
                    {item.thumbnail_url || item.result_url ? (
                      item.type === "audio" ? (
                        <div className="w-full h-full bg-gradient-to-br from-[hsl(25,100%,55%)]/20 to-[hsl(45,100%,55%)]/20 flex items-center justify-center">
                          <Music className="h-8 w-8 text-[hsl(25,100%,55%)]" />
                        </div>
                      ) : (
                        <img 
                          src={item.thumbnail_url || item.result_url || ""} 
                          alt={item.prompt || "Generated"} 
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        {item.type === "video" ? <Video className="h-6 w-6 text-muted-foreground" /> :
                         item.type === "audio" ? <Music className="h-6 w-6 text-muted-foreground" /> :
                         <Image className="h-6 w-6 text-muted-foreground" />}
                      </div>
                    )}
                    
                    {/* Type badge */}
                    <Badge className={cn(
                      "absolute top-1 left-1 text-[9px] px-1.5 py-0",
                      item.type === "image" || item.type === "retouch" ? "bg-[hsl(320,100%,60%)]/80" :
                      item.type === "video" ? "bg-[hsl(280,100%,65%)]/80" :
                      "bg-[hsl(25,100%,55%)]/80"
                    )}>
                      {item.type.toUpperCase()}
                    </Badge>

                    {/* Video icon overlay */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Video className="h-8 w-8 text-white/80" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* TASK-004: Gestionnaire de clés API */}
        <APIKeyManager />

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
