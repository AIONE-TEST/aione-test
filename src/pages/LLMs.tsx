import { useState, useMemo, useRef, useEffect } from "react";
import { Bot, Sparkles, Send, Loader2, User, MessageSquare, Zap, Brain, Code, FileText } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ModelSelector } from "@/components/ModelSelector";
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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[200px] min-h-screen p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] glow-yellow">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-wider" style={{
              background: "linear-gradient(135deg, hsl(45,100%,55%), hsl(25,100%,55%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              CHAT LLM
            </h1>
            <p className="text-lg text-muted-foreground">
              <span className="text-[hsl(45,100%,55%)] font-bold">{models.length}</span> MODÈLES DISPONIBLES
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Button className="btn-3d-yellow gap-2 text-base hover:scale-105 transition-transform">
            <MessageSquare className="h-5 w-5" />
            CHAT
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <Brain className="h-5 w-5" />
            RAISONNEMENT
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <Code className="h-5 w-5" />
            CODE
          </Button>
          <Button className="btn-3d gap-2 text-base hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
            ANALYSE
          </Button>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 min-h-0">
          {/* Chat Area */}
          <div className="panel-3d flex flex-col overflow-hidden">
            {/* Model Selector */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[hsl(45,100%,55%)]" />
                <label className="font-display text-sm text-[hsl(45,100%,55%)] tracking-wider">
                  MODÈLE IA
                </label>
              </div>
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="llms"
                className="mt-2"
              />
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] flex items-center justify-center mb-4 glow-yellow">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2">PRÊT À DISCUTER</h3>
                  <p className="text-base text-muted-foreground max-w-md">
                    SÉLECTIONNEZ UN MODÈLE ET COMMENCEZ UNE CONVERSATION
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
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] flex items-center justify-center shrink-0">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-4 py-3 panel-3d",
                          message.role === "user"
                            ? "bg-[hsl(45,100%,55%)]/20 border-[hsl(45,100%,55%)]/30"
                            : ""
                        )}
                      >
                        <p className="text-base whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="panel-3d rounded-xl px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedModel ? "ÉCRIVEZ VOTRE MESSAGE..." : "SÉLECTIONNEZ D'ABORD UN MODÈLE..."}
                  disabled={!selectedModel || isLoading}
                  className="input-3d min-h-[70px] max-h-[200px] resize-none text-base"
                />
                <Button
                  onClick={handleSend}
                  disabled={!selectedModel || !input.trim() || isLoading}
                  className="btn-3d-yellow h-auto px-6 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Send className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Model Info */}
          <div className="space-y-4">
            {selectedModel && (
              <div className="panel-3d p-5">
                <h3 className="font-display text-sm text-[hsl(45,100%,55%)] mb-3">MODÈLE SÉLECTIONNÉ</h3>
                <div className="space-y-3">
                  <p className="font-display text-lg font-bold">{selectedModel.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedModel.provider}</p>
                  <p className="text-base text-muted-foreground">{selectedModel.description}</p>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="panel-3d p-5">
              <h3 className="font-display text-sm text-muted-foreground mb-3">CONSEILS</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-[hsl(45,100%,55%)] mt-0.5" />
                  APPUYEZ ENTRÉE POUR ENVOYER
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-[hsl(45,100%,55%)] mt-0.5" />
                  SHIFT+ENTRÉE POUR NOUVELLE LIGNE
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LLMs;