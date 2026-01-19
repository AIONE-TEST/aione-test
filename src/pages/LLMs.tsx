import { useState, useMemo, useRef, useEffect } from "react";
import { Bot, Sparkles, Send, Loader2, User, MessageSquare, Zap, Brain, Code, FileText, LayoutGrid, Gift, ShieldOff, Tag, Paperclip, Upload } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { AppTileCard } from "@/components/AppTileCard";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { APIKeyModal } from "@/components/APIKeyModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type LLMFilter = "all" | "services" | "free" | "uncensored";

const getEdgeFunctionForModel = (modelId: string): string | null => {
  const modelToFunction: Record<string, string> = {
    "gpt-4o": "chat-openai",
    "gpt-4o-mini": "chat-openai",
    "gpt-4-turbo": "chat-openai",
    "o1-preview": "chat-openai",
    "o1-mini": "chat-openai",
    "claude-3-opus": "chat-claude",
    "claude-3-sonnet": "chat-claude",
    "claude-3-haiku": "chat-claude",
    "claude-35-sonnet": "chat-claude",
    "mistral-large": "chat-mistral",
    "mistral-medium": "chat-mistral",
    "mistral-small": "chat-mistral",
    "mixtral-8x7b": "chat-mistral",
    "groq-llama-70b": "chat-groq",
    "groq-llama-8b": "chat-groq",
    "groq-mixtral": "chat-groq",
    "grok-beta": "chat-grok",
    "grok-2": "chat-grok",
  };
  
  for (const [key, value] of Object.entries(modelToFunction)) {
    if (modelId.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(modelId.toLowerCase())) {
      return value;
    }
  }
  
  return null;
};

const LLMs = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<LLMFilter>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>("");

  const handleOpenAPIKeyModal = (apiKeyName: string) => {
    setSelectedApiKeyName(apiKeyName);
    setApiKeyModalOpen(true);
  };

  const allModels = useMemo(() => {
    const categoryModels = getModelsByCategory("llms");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const filteredModels = useMemo(() => {
    switch (activeFilter) {
      case "services":
        return allModels.filter(m => m.apiStatus === "active");
      case "free":
        return allModels.filter(m => m.isFree || m.apiStatus === "free");
      case "uncensored":
        return allModels.filter(m => 
          m.badges.some(b => b.toLowerCase().includes("uncensored") || b.toLowerCase().includes("nsfw") || b === "18+") ||
          m.name.toLowerCase().includes("uncensored")
        );
      default:
        return allModels;
    }
  }, [allModels, activeFilter]);

  const filterCounts = useMemo(() => ({
    all: allModels.length,
    services: allModels.filter(m => m.apiStatus === "active").length,
    free: allModels.filter(m => m.isFree || m.apiStatus === "free").length,
    uncensored: allModels.filter(m => 
      m.badges.some(b => b.toLowerCase().includes("uncensored") || b.toLowerCase().includes("nsfw") || b === "18+") ||
      m.name.toLowerCase().includes("uncensored")
    ).length,
  }), [allModels]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedModel || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let functionName = getEdgeFunctionForModel(selectedModel.id);
      
      if (!functionName) {
        const providerLower = selectedModel.provider.toLowerCase();
        if (providerLower.includes("openai")) functionName = "chat-openai";
        else if (providerLower.includes("anthropic") || providerLower.includes("claude")) functionName = "chat-claude";
        else if (providerLower.includes("mistral")) functionName = "chat-mistral";
        else if (providerLower.includes("groq")) functionName = "chat-groq";
        else if (providerLower.includes("xai") || providerLower.includes("grok")) functionName = "chat-grok";
      }

      if (!functionName) {
        toast({
          title: "Modèle non disponible",
          description: `L'API pour ${selectedModel.name} n'est pas encore configurée.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const apiMessages = [
        { role: "system", content: "Tu es un assistant IA utile et amical. Réponds en français de manière concise et claire." },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage.content }
      ];

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { messages: apiMessages }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Erreur API",
          description: error.message || "Impossible de contacter l'API",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const responseContent = data?.choices?.[0]?.message?.content || 
                              data?.message?.content ||
                              data?.content ||
                              "Réponse reçue mais format inattendu.";

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filters: { id: LLMFilter; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Tous", icon: <LayoutGrid className="h-3 w-3" /> },
    { id: "services", label: "Actifs", icon: <Tag className="h-3 w-3" /> },
    { id: "free", label: "Gratuits", icon: <Gift className="h-3 w-3" /> },
    { id: "uncensored", label: "-18", icon: <ShieldOff className="h-3 w-3" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-4 flex flex-col">
        {/* Header compact */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] glow-yellow">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-black" style={{
              background: "linear-gradient(135deg, hsl(45,100%,55%), hsl(25,100%,55%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              CHAT LLM
            </h1>
          </div>
          {/* Filtres compacts */}
          <div className="flex gap-1">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "gap-1 text-xs h-7 px-2",
                  activeFilter === filter.id ? "btn-3d-yellow" : ""
                )}
              >
                {filter.icon}
                {filter.label}
                <span className="text-[10px] opacity-70">{filterCounts[filter.id]}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat pleine largeur - même taille que fenêtre de génération VIDEO */}
        <div className="panel-3d flex flex-col overflow-hidden max-w-5xl min-h-[450px]" style={{ aspectRatio: "16/9" }}>
          {/* Model Selector compact */}
          <div className="p-3 border-b border-border/50 flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-[hsl(45,100%,55%)]" />
            <ModelSelector
              models={filteredModels}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              category="llms"
              className="flex-1"
            />
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] flex items-center justify-center mb-3 glow-yellow">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-1">PRÊT À DISCUTER</h3>
                <p className="text-sm text-muted-foreground">Sélectionnez un modèle et commencez</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "justify-end" : ""
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 panel-3d text-sm",
                        message.role === "user"
                          ? "bg-[hsl(45,100%,55%)]/20 border-[hsl(45,100%,55%)]/30"
                          : ""
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="panel-3d rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input avec icône upload */}
          <div className="p-3 border-t border-border/50">
            <div className="flex gap-2 items-end">
              {/* Icône Upload à gauche */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-[hsl(45,100%,55%)] hover:bg-[hsl(45,100%,55%)]/10"
                onClick={() => toast({ title: "Upload", description: "Fonction d'upload de fichiers bientôt disponible" })}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedModel ? "Écrivez votre message..." : "Sélectionnez un modèle..."}
                disabled={!selectedModel || isLoading}
                className="input-3d min-h-[50px] max-h-[120px] resize-none text-sm flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!selectedModel || !input.trim() || isLoading}
                className="btn-3d-yellow h-auto px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Grille des modèles LLM - Style APPLIS IA */}
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-5 w-5 text-[hsl(45,100%,55%)]" />
            <h2 className="font-display text-lg font-bold">MODÈLES CHAT COMPATIBLES</h2>
            <Badge variant="outline" className="text-sm">{filteredModels.length}</Badge>
          </div>

          {/* Grid avec le même style que APPLIS IA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredModels.map((model) => (
              <AppTileCard
                key={model.id}
                model={model}
                viewMode="grid"
                horizontal
                onOpenAPIKeyModal={handleOpenAPIKeyModal}
                onClick={() => setSelectedModel(model)}
              />
            ))}
          </div>
        </div>

        {/* API Key Modal */}
        <APIKeyModal
          isOpen={apiKeyModalOpen}
          onClose={() => setApiKeyModalOpen(false)}
          apiKeyName={selectedApiKeyName}
        />
      </main>
    </div>
  );
};

export default LLMs;
