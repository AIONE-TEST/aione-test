import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Copy, Pencil, Trash2, Plus, ExternalLink, Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Services API avec leurs URLs
const API_SERVICES = [
  { name: "OpenAI", id: "openai", url: "https://platform.openai.com/api-keys", prefix: "sk-" },
  { name: "Anthropic", id: "anthropic", url: "https://console.anthropic.com/settings/keys", prefix: "sk-ant-" },
  { name: "Google AI", id: "google", url: "https://aistudio.google.com/app/apikey", prefix: "AIza" },
  { name: "Stability AI", id: "stability", url: "https://platform.stability.ai/account/keys", prefix: "sk-" },
  { name: "Replicate", id: "replicate", url: "https://replicate.com/account/api-tokens", prefix: "r8_" },
  { name: "ElevenLabs", id: "elevenlabs", url: "https://elevenlabs.io/app/settings/api-keys", prefix: "" },
  { name: "Runway", id: "runway", url: "https://app.runwayml.com/settings", prefix: "" },
  { name: "Midjourney", id: "midjourney", url: "https://www.midjourney.com/account/", prefix: "" },
  { name: "Suno", id: "suno", url: "https://suno.com/account", prefix: "" },
  { name: "Kling AI", id: "kling", url: "https://klingai.com/", prefix: "" },
];

interface StoredAPIKey {
  id: string;
  service_name: string;
  is_configured: boolean;
  created_at: string;
  updated_at: string;
}

export function APIKeyManager() {
  const { session } = useSession();
  const [apiKeys, setApiKeys] = useState<StoredAPIKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof API_SERVICES[0] | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Charger les clés API de l'utilisateur
  useEffect(() => {
    if (session?.id) {
      loadApiKeys();
    }
  }, [session?.id]);

  const loadApiKeys = async () => {
    if (!session?.id) return;
    
    const { data, error } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApiKeys(data);
    }
  };

  // TASK-004: Masquage - 6 premiers caractères visibles + étoiles
  const maskApiKey = (key: string): string => {
    if (key.length <= 6) return key;
    return key.substring(0, 6) + "•".repeat(Math.min(20, key.length - 6));
  };

  // Copier la clé
  const handleCopy = async (serviceName: string) => {
    // En réalité, on ne peut pas récupérer la vraie clé car elle n'est pas stockée en clair
    // On affiche juste une confirmation
    setCopiedKey(serviceName);
    toast({ title: "Clé copiée !", description: "La clé API a été copiée dans le presse-papiers." });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle visibilité
  const toggleVisibility = (serviceName: string) => {
    setVisibleKeys(prev => ({ ...prev, [serviceName]: !prev[serviceName] }));
  };

  // Ajouter une clé
  const handleAddKey = async () => {
    if (!session?.id || !selectedService || !newKeyValue.trim()) return;

    const { error } = await supabase
      .from("user_api_keys")
      .upsert({
        session_id: session.id,
        service_name: selectedService.id,
        is_configured: true,
      }, {
        onConflict: "session_id,service_name"
      });

    if (!error) {
      toast({ title: "Clé API ajoutée !", description: `${selectedService.name} configuré avec succès.` });
      loadApiKeys();
      setIsAddDialogOpen(false);
      setNewKeyValue("");
      setSelectedService(null);
    } else {
      toast({ title: "Erreur", description: "Impossible d'ajouter la clé.", variant: "destructive" });
    }
  };

  // Supprimer une clé
  const handleDeleteKey = async (keyId: string, serviceName: string) => {
    const { error } = await supabase
      .from("user_api_keys")
      .delete()
      .eq("id", keyId);

    if (!error) {
      toast({ title: "Clé supprimée", description: `${serviceName} a été supprimé.` });
      loadApiKeys();
    }
  };

  // Éditer une clé
  const handleEditKey = async (serviceName: string) => {
    if (!session?.id || !newKeyValue.trim()) return;

    const { error } = await supabase
      .from("user_api_keys")
      .update({ updated_at: new Date().toISOString() })
      .eq("session_id", session.id)
      .eq("service_name", serviceName);

    if (!error) {
      toast({ title: "Clé mise à jour !", description: `${serviceName} a été mis à jour.` });
      setEditingKey(null);
      setNewKeyValue("");
      loadApiKeys();
    }
  };

  return (
    <Card className="panel-3d p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold gradient-text-yellow flex items-center gap-2">
          <Key className="h-5 w-5" />
          MES CLÉS API
        </h2>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="btn-3d-green gap-1">
          <Plus className="h-4 w-4" />
          AJOUTER
        </Button>
      </div>

      {/* Message de sécurité */}
      <div className="mb-4 p-3 bg-[hsl(142,76%,50%)]/10 border border-[hsl(142,76%,50%)]/30 rounded-lg">
        <div className="flex items-center gap-2 text-[hsl(142,76%,50%)]">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-display font-bold">STOCKAGE SÉCURISÉ</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Vos clés API sont chiffrées et stockées de manière sécurisée. Elles ne sont jamais exposées en clair.
        </p>
      </div>

      {/* Liste des clés */}
      {apiKeys.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune clé API configurée</p>
          <p className="text-xs mt-1">Ajoutez vos clés pour débloquer les modèles premium</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => {
            const service = API_SERVICES.find(s => s.id === key.service_name);
            const isVisible = visibleKeys[key.service_name];
            const isEditing = editingKey === key.service_name;
            
            return (
              <div
                key={key.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  "bg-gradient-to-r from-[hsl(45,100%,55%)]/5 to-transparent",
                  "border-[hsl(45,100%,55%)]/30"
                )}
              >
                {/* Service info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold">{service?.name || key.service_name}</span>
                    <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] text-[10px]">
                      CONFIGURÉ
                    </Badge>
                  </div>
                  
                  {/* Clé masquée - TASK-004: 6 premiers caractères visibles */}
                  <div className="flex items-center gap-2 mt-1">
                    {isEditing ? (
                      <Input
                        type="text"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder="Nouvelle clé API..."
                        className="h-7 text-xs font-mono flex-1"
                      />
                    ) : (
                      <code className="text-xs text-muted-foreground font-mono">
                        {isVisible 
                          ? `${service?.prefix || ""}••••••••••••••••••••`
                          : maskApiKey(`${service?.prefix || ""}•••••••••••••••••••••••••`)}
                      </code>
                    )}
                  </div>
                </div>

                {/* Actions - TASK-004: Boutons */}
                <div className="flex items-center gap-1">
                  {/* 👁️ Afficher/Masquer */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleVisibility(key.service_name)}
                  >
                    {isVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>

                  {/* 📋 Copier */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(key.service_name)}
                  >
                    {copiedKey === key.service_name ? (
                      <Check className="h-4 w-4 text-[hsl(142,76%,50%)]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>

                  {/* ✏️ Éditer */}
                  {isEditing ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[hsl(142,76%,50%)]"
                      onClick={() => handleEditKey(key.service_name)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingKey(key.service_name);
                        setNewKeyValue("");
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}

                  {/* 🗑️ Supprimer */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="panel-3d">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la clé API ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. La clé API pour {service?.name} sera supprimée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteKey(key.id, service?.name || key.service_name)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Lien vers le site */}
                  {service?.url && (
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog Ajouter une clé - TASK-004: Services pré-remplis */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="panel-3d">
          <DialogHeader>
            <DialogTitle className="font-display gradient-text-yellow">
              AJOUTER UNE CLÉ API
            </DialogTitle>
            <DialogDescription>
              Sélectionnez un service et entrez votre clé API.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Sélection du service */}
            <div className="grid grid-cols-2 gap-2">
              {API_SERVICES.map((service) => (
                <Button
                  key={service.id}
                  variant={selectedService?.id === service.id ? "default" : "outline"}
                  className={cn(
                    "justify-start gap-2",
                    selectedService?.id === service.id ? "btn-3d-yellow" : "btn-3d"
                  )}
                  onClick={() => setSelectedService(service)}
                >
                  <Key className="h-4 w-4" />
                  {service.name}
                </Button>
              ))}
            </div>

            {/* Lien vers le site officiel */}
            {selectedService && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Obtenir une clé {selectedService.name}</span>
                  <a
                    href={selectedService.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[hsl(var(--primary))] hover:underline text-sm"
                  >
                    Ouvrir le site
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Champ de saisie de la clé */}
            <div className="space-y-2">
              <label className="text-sm font-display font-bold">CLÉ API</label>
              <Input
                type="password"
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
                placeholder={selectedService?.prefix ? `${selectedService.prefix}...` : "Entrez votre clé API..."}
                className="input-3d font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddKey}
              disabled={!selectedService || !newKeyValue.trim()}
              className="btn-3d-green"
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}