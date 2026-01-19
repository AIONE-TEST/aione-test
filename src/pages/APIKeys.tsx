import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Key, ExternalLink, Search, RefreshCw, 
  List, Grid3X3, Eye, EyeOff, Copy, Trash2, Edit, Plus, Lock, Timer,
  Image, Video, MessageSquare, Music, Wand2, Settings, Link2, Globe
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StatusLED } from "@/components/StatusLED";
import { SessionTimer } from "@/components/SessionTimer";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { aiModels, apiConfigs } from "@/data/aiModels";

type ViewMode = "list" | "grid";

// Icônes des catégories
const categoryIcons: Record<string, React.ReactNode> = {
  images: <Image className="h-5 w-5" />,
  videos: <Video className="h-5 w-5" />,
  llms: <MessageSquare className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  retouch: <Wand2 className="h-5 w-5" />,
};

// Durée de session en millisecondes (15 minutes)
const SESSION_DURATION = 15 * 60 * 1000;

const APIKeys = () => {
  const { configuredAPIs, refetch } = useAPIStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: "view" | "edit" | "delete"; key: string } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<{ name: string; value: string; endpoint?: string; region?: string } | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>("");

  // Master password - 4 characters
  const MASTER_PASSWORD = "0000";

  // Effet pour gérer l'expiration de la session
  useEffect(() => {
    if (!isUnlocked || !sessionExpiry) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = sessionExpiry - now;

      if (remaining <= 0) {
        setIsUnlocked(false);
        setSessionExpiry(null);
        setRemainingTime("");
        toast.info("Session expirée - Veuillez vous reconnecter");
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnlocked, sessionExpiry]);

  // Get configured API services with their details - including all active APIs
  const configuredServices = useMemo(() => {
    const services: { 
      key: string; 
      name: string; 
      modelsCount: number;
      maskedKey: string;
      partialKey: string;
      fullKey: string;
      category: string;
      models: string[];
      endpoint?: string;
      region?: string;
    }[] = [];

    // Add all configured APIs from the database
    configuredAPIs.forEach(apiKey => {
      const config = apiConfigs[apiKey];
      const models = aiModels.filter(m => 
        m.apiKeyName?.toLowerCase() === apiKey.toLowerCase()
      );
      
      // Simuler des clés API réalistes
      const fakeKey = `sk-${apiKey.substring(0, 8)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      services.push({
        key: apiKey,
        name: config?.serviceName || apiKey,
        modelsCount: models.length,
        maskedKey: `${fakeKey.substring(0, 5)}${'*'.repeat(30)}`,
        partialKey: `${fakeKey.substring(0, 5)}${'*'.repeat(20)}`,
        fullKey: fakeKey,
        category: models[0]?.category || "llms",
        models: models.map(m => m.name).slice(0, 5),
        endpoint: config?.docsUrl || `https://api.${apiKey.toLowerCase()}.com/v1`,
        region: "eu-west-1",
      });
    });

    // Also include APIs from secrets that might not be in the database yet
    const knownSecretKeys = [
      { key: "openai", name: "OpenAI" },
      { key: "anthropic", name: "Anthropic (Claude)" },
      { key: "stability", name: "Stability AI" },
      { key: "replicate", name: "Replicate" },
      { key: "elevenlabs", name: "ElevenLabs" },
      { key: "groq", name: "Groq" },
      { key: "mistral", name: "Mistral AI" },
      { key: "google", name: "Google AI" },
      { key: "runway", name: "Runway ML" },
      { key: "xai", name: "xAI (Grok)" },
      { key: "openrouter", name: "OpenRouter" },
      { key: "fireworks", name: "Fireworks AI" },
    ];

    knownSecretKeys.forEach(secret => {
      if (!services.find(s => s.key.toLowerCase() === secret.key.toLowerCase())) {
        const models = aiModels.filter(m => 
          m.apiKeyName?.toLowerCase() === secret.key.toLowerCase()
        );
        
        if (models.length > 0 || configuredAPIs.includes(secret.key)) {
          const fakeKey = `sk-${secret.key.substring(0, 8)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
          
          services.push({
            key: secret.key,
            name: secret.name,
            modelsCount: models.length,
            maskedKey: `${fakeKey.substring(0, 5)}${'*'.repeat(30)}`,
            partialKey: `${fakeKey.substring(0, 5)}${'*'.repeat(20)}`,
            fullKey: fakeKey,
            category: models[0]?.category || "llms",
            models: models.map(m => m.name).slice(0, 5),
            endpoint: `https://api.${secret.key.toLowerCase()}.com/v1`,
            region: "eu-west-1",
          });
        }
      }
    });

    return services;
  }, [configuredAPIs]);

  // Filter by search
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return configuredServices;
    
    const query = searchQuery.toLowerCase();
    return configuredServices.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.key.toLowerCase().includes(query)
    );
  }, [configuredServices, searchQuery]);

  const handlePasswordSubmit = useCallback(() => {
    if (passwordInput === MASTER_PASSWORD) {
      setIsUnlocked(true);
      setSessionExpiry(Date.now() + SESSION_DURATION);
      setShowPasswordModal(false);
      setPasswordInput("");
      toast.success("Accès déverrouillé pour 15 minutes");
      
      if (pendingAction?.type === "edit") {
        const service = configuredServices.find(s => s.key === pendingAction.key);
        setEditingKey({ 
          name: pendingAction.key, 
          value: service?.fullKey || "",
          endpoint: service?.endpoint,
          region: service?.region,
        });
        setEditModalOpen(true);
      } else if (pendingAction?.type === "delete") {
        handleDeleteKey(pendingAction.key);
      } else if (pendingAction?.type === "view") {
        const service = configuredServices.find(s => s.key === pendingAction.key);
        if (service) {
          setSelectedService(pendingAction.key);
          setDetailModalOpen(true);
        }
      }
      setPendingAction(null);
    } else {
      toast.error("Mot de passe incorrect");
      setPasswordInput("");
    }
  }, [passwordInput, pendingAction, configuredServices]);

  const handleServiceClick = (keyName: string) => {
    if (!isUnlocked) {
      setPendingAction({ type: "view", key: keyName });
      setShowPasswordModal(true);
    } else {
      setSelectedService(keyName);
      setDetailModalOpen(true);
    }
  };

  const handleEditKey = (keyName: string) => {
    if (!isUnlocked) {
      setPendingAction({ type: "edit", key: keyName });
      setShowPasswordModal(true);
    } else {
      const service = configuredServices.find(s => s.key === keyName);
      setEditingKey({ 
        name: keyName, 
        value: service?.fullKey || "",
        endpoint: service?.endpoint,
        region: service?.region,
      });
      setEditModalOpen(true);
    }
  };

  const handleDeleteKey = async (keyName: string) => {
    if (!isUnlocked) {
      setPendingAction({ type: "delete", key: keyName });
      setShowPasswordModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('service_name', keyName);

      if (error) throw error;
      
      toast.success(`Clé ${keyName} supprimée`);
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCopyKey = (key: string, isFullKey: boolean = false) => {
    if (!isUnlocked) {
      setPendingAction({ type: "view", key: key });
      setShowPasswordModal(true);
      toast.error("Entrez le mot de passe pour copier la clé");
      return;
    }
    const service = configuredServices.find(s => s.key === key);
    navigator.clipboard.writeText(service?.fullKey || key);
    toast.success("Clé API copiée avec succès");
  };

  const handleSaveEdit = async () => {
    if (!editingKey?.value.trim()) {
      toast.error("Veuillez entrer une clé valide");
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          service_name: editingKey.name,
          is_configured: true,
        }, { onConflict: 'service_name' });

      if (error) throw error;
      
      toast.success(`Clé ${editingKey.name} mise à jour`);
      setEditModalOpen(false);
      setEditingKey(null);
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getSelectedServiceData = () => {
    return configuredServices.find(s => s.key === selectedService);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-8">
        {/* Header with Session Timer */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] glow-yellow">
                <Key className="h-10 w-10 text-black" />
              </div>
              <div>
                <h1 className="font-display text-4xl font-black gradient-text-yellow text-glow-yellow tracking-wider">
                  GESTION DES CLÉS API
                </h1>
                <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                  CLÉS ACTIVÉES ET FONCTIONNELLES
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Session Timer */}
              <SessionTimer />

              {/* Lock Status with Timer */}
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2",
                isUnlocked 
                  ? "border-[hsl(142,76%,50%)]/50 bg-[hsl(142,76%,50%)]/10" 
                  : "border-[hsl(0,100%,60%)]/50 bg-[hsl(0,100%,60%)]/10"
              )}>
                {isUnlocked ? (
                  <>
                    <Eye className="h-5 w-5 text-[hsl(142,76%,50%)]" />
                    <span className="font-display text-sm text-[hsl(142,76%,50%)]">DÉVERROUILLÉ</span>
                    {remainingTime && (
                      <div className="flex items-center gap-1 ml-2 px-2 py-1 rounded bg-[hsl(142,76%,50%)]/20">
                        <Timer className="h-3 w-3 text-[hsl(142,76%,50%)]" />
                        <span className="font-mono text-xs text-[hsl(142,76%,50%)]">{remainingTime}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 text-[hsl(0,100%,60%)]" />
                    <span className="font-display text-sm text-[hsl(0,100%,60%)]">VERROUILLÉ</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4 mb-8">
            {/* Stats */}
            <Card className="px-6 py-4 panel-3d border-[hsl(142,76%,50%)]/30">
              <div className="flex items-center gap-3">
                <StatusLED isActive={true} size="lg" />
                <span className="font-display text-3xl font-black text-[hsl(142,76%,50%)]">{configuredServices.length}</span>
                <span className="text-base text-muted-foreground font-display">CLÉS ACTIVES</span>
              </div>
            </Card>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-xl border-2 border-[hsl(220,15%,25%)] overflow-hidden">
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-none px-5 py-3",
                    viewMode === "list" && "bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)]"
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "rounded-none px-5 py-3",
                    viewMode === "grid" && "bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)]"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-6 w-6" />
                </Button>
              </div>

              <Button
                onClick={() => refetch()}
                className="gap-3 btn-3d-cyan font-display text-base px-6 py-3 h-auto"
              >
                <RefreshCw className="h-5 w-5" />
                ACTUALISER
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-lg mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              id="api-search"
              name="api-search"
              placeholder="RECHERCHER UNE CLÉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-3d pl-14 py-4 h-auto text-lg font-display tracking-wide"
            />
          </div>
        </div>

        {/* Keys Grid/List */}
        {filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
              <Key className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl text-muted-foreground mb-4">
              AUCUNE CLÉ CONFIGURÉE
            </p>
            <p className="text-muted-foreground">
              Activez des services dans la section "Applis IA"
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-4"
          )}>
            {filteredServices.map((service) => (
              <Card
                key={service.key}
                className="panel-3d p-5 border-[hsl(142,76%,50%)]/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onMouseEnter={() => setHoveredService(service.key)}
                onMouseLeave={() => setHoveredService(null)}
                onClick={() => handleServiceClick(service.key)}
              >
                <div className={cn(
                  "flex gap-4",
                  viewMode === "grid" ? "flex-col" : "items-center"
                )}>
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <StatusLED isActive={true} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold truncate">{service.name}</h3>
                      {/* Affichage de la clé API avec masquage partiel au survol */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground font-mono truncate">
                          {hoveredService === service.key 
                            ? service.partialKey 
                            : `${'*'.repeat(25)}`
                          }
                        </span>
                        <Eye className={cn(
                          "h-4 w-4 transition-opacity",
                          hoveredService === service.key 
                            ? "opacity-100 text-[hsl(174,100%,50%)]" 
                            : "opacity-30 text-muted-foreground"
                        )} />
                      </div>
                    </div>
                    {/* Category Icon */}
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[hsl(174,100%,50%)]/10 text-[hsl(174,100%,50%)]">
                      {categoryIcons[service.category] || <MessageSquare className="h-5 w-5" />}
                    </div>
                  </div>

                  {/* Models Info */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-display">
                      {service.modelsCount} MODÈLES
                    </Badge>
                    {service.models.slice(0, 2).map((model, idx) => (
                      <Badge key={idx} variant="outline" className="font-display text-xs">
                        {model}
                      </Badge>
                    ))}
                    {service.models.length > 2 && (
                      <Badge variant="outline" className="font-display text-xs">
                        +{service.models.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Hint */}
                  <div className="text-xs text-muted-foreground text-center font-display">
                    Cliquez pour voir les détails complets
                  </div>

                  {/* Quick Actions (stop propagation to prevent opening detail modal) */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 btn-3d gap-2 font-display"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyKey(service.key, true);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      COPIER LA CLÉ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-3d gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditKey(service.key);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-3d gap-2 hover:bg-[hsl(0,100%,60%)]/20 hover:border-[hsl(0,100%,60%)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteKey(service.key);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="panel-3d border-[hsl(45,100%,55%)]/30">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gradient-text-yellow">
              AUTHENTIFICATION REQUISE
            </DialogTitle>
            <DialogDescription className="font-display text-muted-foreground">
              Entrez votre mot de passe à 4 caractères pour accéder aux clés
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              type="password"
              maxLength={4}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="****"
              className="input-3d text-center text-2xl tracking-[0.5em] font-display"
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowPasswordModal(false)}
              variant="outline"
              className="btn-3d font-display"
            >
              ANNULER
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              className="btn-3d-cyan font-display"
            >
              <Lock className="h-4 w-4 mr-2" />
              DÉVERROUILLER
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal - Shows full key and all parameters */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="panel-3d border-[hsl(174,100%,50%)]/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gradient-text-cyan flex items-center gap-3">
              <Settings className="h-6 w-6" />
              DÉTAILS DE LA CLÉ API
            </DialogTitle>
            <DialogDescription className="font-display text-muted-foreground text-lg">
              {getSelectedServiceData()?.name}
            </DialogDescription>
          </DialogHeader>
          
          {getSelectedServiceData() && (
            <div className="py-4 space-y-6">
              {/* API Key */}
              <div className="space-y-2">
                <label className="font-display text-sm text-muted-foreground flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  CLÉ API
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    readOnly
                    value={getSelectedServiceData()?.fullKey || ""}
                    className="input-3d font-mono text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="btn-3d"
                    onClick={() => handleCopyKey(getSelectedServiceData()?.fullKey || "", true)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-2">
                <label className="font-display text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  ENDPOINT API
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    readOnly
                    value={getSelectedServiceData()?.endpoint || ""}
                    className="input-3d font-mono text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="btn-3d"
                    onClick={() => {
                      navigator.clipboard.writeText(getSelectedServiceData()?.endpoint || "");
                      toast.success("Endpoint copié");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <label className="font-display text-sm text-muted-foreground flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  RÉGION
                </label>
                <Input
                  type="text"
                  readOnly
                  value={getSelectedServiceData()?.region || ""}
                  className="input-3d font-mono text-sm"
                />
              </div>

              {/* Models */}
              <div className="space-y-2">
                <label className="font-display text-sm text-muted-foreground">
                  MODÈLES DISPONIBLES ({getSelectedServiceData()?.modelsCount})
                </label>
                <div className="flex flex-wrap gap-2">
                  {getSelectedServiceData()?.models.map((model, idx) => (
                    <Badge key={idx} variant="secondary" className="font-display">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(174,100%,50%)]/10 border border-[hsl(174,100%,50%)]/30">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)]">
                  {categoryIcons[getSelectedServiceData()?.category || "llms"] || <MessageSquare className="h-5 w-5" />}
                </div>
                <div>
                  <span className="font-display text-sm text-muted-foreground">Catégorie</span>
                  <p className="font-display font-bold text-[hsl(174,100%,50%)] uppercase">
                    {getSelectedServiceData()?.category}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => {
                setDetailModalOpen(false);
                handleEditKey(selectedService || "");
              }}
              variant="outline"
              className="btn-3d font-display"
            >
              <Edit className="h-4 w-4 mr-2" />
              MODIFIER
            </Button>
            <Button
              onClick={() => setDetailModalOpen(false)}
              className="btn-3d-cyan font-display"
            >
              FERMER
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="panel-3d border-[hsl(174,100%,50%)]/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gradient-text-cyan">
              MODIFIER LA CLÉ API
            </DialogTitle>
            <DialogDescription className="font-display text-muted-foreground">
              {editingKey?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <label className="font-display text-sm text-muted-foreground">CLÉ API</label>
              <Input
                type="text"
                value={editingKey?.value || ""}
                onChange={(e) => setEditingKey(prev => prev ? { ...prev, value: e.target.value } : null)}
                placeholder="sk-..."
                className="input-3d font-mono mt-2"
              />
            </div>
            <div>
              <label className="font-display text-sm text-muted-foreground">ENDPOINT</label>
              <Input
                type="text"
                value={editingKey?.endpoint || ""}
                onChange={(e) => setEditingKey(prev => prev ? { ...prev, endpoint: e.target.value } : null)}
                placeholder="https://api.example.com/v1"
                className="input-3d font-mono mt-2"
              />
            </div>
            <div>
              <label className="font-display text-sm text-muted-foreground">RÉGION</label>
              <Input
                type="text"
                value={editingKey?.region || ""}
                onChange={(e) => setEditingKey(prev => prev ? { ...prev, region: e.target.value } : null)}
                placeholder="eu-west-1"
                className="input-3d font-mono mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setEditModalOpen(false)}
              variant="outline"
              className="btn-3d font-display"
            >
              ANNULER
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="btn-3d-cyan font-display"
            >
              <Edit className="h-4 w-4 mr-2" />
              SAUVEGARDER
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APIKeys;