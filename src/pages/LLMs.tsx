import { useState, useMemo, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Send, Loader2, User, Bot } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { ModelGrid } from "@/components/ModelGrid";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const LLMs = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const models = useMemo(() => {
    const categoryModels = getModelsByCategory("llms");
    return getModelsWithStatus(categoryModels);
  }, [getModelsWithStatus]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Ceci est une réponse simulée de ${selectedModel.name}. Dans une implémentation réelle, cette réponse viendrait de l'API du modèle sélectionné.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-40 min-h-screen flex flex-col">
        <div className="container mx-auto max-w-7xl px-4 py-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(320,100%,60%)]/20">
                <MessageSquare className="h-5 w-5 text-[hsl(320,100%,60%)]" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold gradient-text-pink">
                  Chat LLMs
                </h1>
                <p className="text-sm text-muted-foreground">
                  Discutez avec les meilleurs modèles de langage • <span className="text-[hsl(var(--primary))]">{models.length} modèles</span> disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chat Area */}
            <div className="lg:col-span-2 flex flex-col rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              {/* Model Selector */}
              <div className="p-4 border-b border-border/50">
                <ModelSelector
                  models={models}
                  selectedModel={selectedModel}
                  onSelectModel={setSelectedModel}
                  category="llms"
                  className="w-full max-w-md"
                />
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] flex items-center justify-center mb-4 glow-purple">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">Prêt à discuter</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Sélectionnez un modèle et commencez une conversation. Tous les modèles gratuits sont disponibles immédiatement.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "justify-end" : ""
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-xl px-4 py-2",
                            message.role === "user"
                              ? "bg-[hsl(var(--primary))]/20 text-foreground"
                              : "bg-muted/50"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === "user" && (
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted/50 rounded-xl px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedModel ? "Écrivez votre message..." : "Sélectionnez d'abord un modèle..."}
                    disabled={!selectedModel || isLoading}
                    className="min-h-[60px] max-h-[200px] bg-muted/30 resize-none"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!selectedModel || !input.trim() || isLoading}
                    className="h-auto px-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
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

            {/* Model Info */}
            <div className="space-y-4">
              {selectedModel && (
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                  <h3 className="font-display text-sm text-muted-foreground mb-3">Modèle sélectionné</h3>
                  <div className="space-y-2">
                    <p className="font-medium">{selectedModel.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedModel.provider}</p>
                    <p className="text-sm text-muted-foreground">{selectedModel.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Models Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="font-display text-xl font-semibold">Tous les modèles LLM</h2>
              <span className="text-sm text-muted-foreground">({models.length})</span>
            </div>

            <ModelGrid
              models={models}
              category="llms"
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelectModel={setSelectedModel}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LLMs;
