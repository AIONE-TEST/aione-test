import { useState, useMemo } from "react";
import { Key, ExternalLink, Check, X, Search, Plus, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { APIKeyModal } from "@/components/APIKeyModal";
import { apiConfigs, aiModels, APIConfig } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const APIKeys = () => {
  const { configuredAPIs, refetch } = useAPIStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");

  // Get all unique API services from models
  const apiServices = useMemo(() => {
    const servicesMap = new Map<string, { 
      config: APIConfig; 
      modelsCount: number; 
      isConfigured: boolean;
      models: string[];
    }>();

    // Go through all models and collect their API requirements
    aiModels.forEach((model) => {
      if (model.apiKeyName) {
        const existing = servicesMap.get(model.apiKeyName);
        if (existing) {
          existing.modelsCount++;
          existing.models.push(model.name);
        } else {
          const config = apiConfigs[model.apiKeyName];
          if (config) {
            servicesMap.set(model.apiKeyName, {
              config,
              modelsCount: 1,
              isConfigured: configuredAPIs.includes(model.apiKeyName.toLowerCase()),
              models: [model.name],
            });
          }
        }
      }
    });

    return Array.from(servicesMap.entries()).map(([key, value]) => ({
      key,
      ...value,
      isConfigured: configuredAPIs.includes(key.toLowerCase()),
    }));
  }, [configuredAPIs]);

  // Filter by search
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return apiServices;
    const query = searchQuery.toLowerCase();
    return apiServices.filter(
      (s) =>
        s.config.serviceName.toLowerCase().includes(query) ||
        s.key.toLowerCase().includes(query) ||
        s.models.some((m) => m.toLowerCase().includes(query))
    );
  }, [apiServices, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = apiServices.length;
    const configured = apiServices.filter((s) => s.isConfigured).length;
    const notConfigured = total - configured;
    return { total, configured, notConfigured };
  }, [apiServices]);

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-40 min-h-screen">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(45,100%,55%)]/20">
                  <Key className="h-5 w-5 text-[hsl(45,100%,55%)]" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold" style={{
                    background: "linear-gradient(135deg, hsl(45,100%,55%), hsl(25,100%,55%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    Gestion des Clés API
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Configurez vos clés API pour activer les modèles premium
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Card className="px-4 py-2 bg-muted/50 border-border/50">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="font-medium">{stats.total}</span>
              </Card>
              <Card className="px-4 py-2 bg-[hsl(142,76%,50%)]/10 border-[hsl(142,76%,50%)]/30">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[hsl(142,76%,50%)]" />
                  <span className="text-sm font-medium text-[hsl(142,76%,50%)]">{stats.configured} Configurées</span>
                </div>
              </Card>
              <Card className="px-4 py-2 bg-muted/50 border-border/50">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stats.notConfigured} Non configurées</span>
                </div>
              </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un service API..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30"
              />
            </div>
          </div>

          {/* API Keys Table */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-display">Service</TableHead>
                  <TableHead className="font-display">Statut</TableHead>
                  <TableHead className="font-display">Modèles</TableHead>
                  <TableHead className="font-display text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.key} className="border-border/30 hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.config.serviceName}</p>
                        <p className="text-xs text-muted-foreground">{service.key}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.isConfigured ? (
                        <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)] border-[hsl(142,76%,50%)]/30">
                          <Check className="h-3 w-3 mr-1" />
                          Configurée
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <X className="h-3 w-3 mr-1" />
                          Non configurée
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {service.modelsCount} modèle{service.modelsCount > 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-8"
                          asChild
                        >
                          <a href={service.config.apiUrl} target="_blank" rel="noopener noreferrer">
                            <Key className="h-3.5 w-3.5" />
                            Obtenir
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-8"
                          asChild
                        >
                          <a href={service.config.docsUrl} target="_blank" rel="noopener noreferrer">
                            Docs
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1 h-8 bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30 hover:bg-[hsl(var(--primary))]/30"
                          onClick={() => handleOpenAPIKeyModal(service.key)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {service.isConfigured ? "Modifier" : "Ajouter"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <APIKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeyName={selectedApiKeyName}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default APIKeys;
