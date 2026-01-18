import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "@/components/ModelSelector";
import { ChatHistoryPanel } from "@/components/ChatHistoryPanel";
import { AIModel, getModelsByCategory } from "@/data/aiModels";
import { useAPIStatus } from "@/hooks/useAPIStatus";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { getModelsWithStatus } = useAPIStatus();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll en haut de page au chargement
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const models = getModelsWithStatus(getModelsByCategory("llms"));

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Merci pour votre message ! Je suis ${selectedModel?.name || "l'IA"} et je suis là pour vous aider. Comment puis-je vous assister aujourd'hui ?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* TASK-003: Layout identique à VIDEO - 2/3 gauche + 1/3 droite */}
      <main className="ml-[373px] min-h-screen p-4">
        {/* Header compact */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] glow-yellow">
            <MessageSquare className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black gradient-text-yellow tracking-wider">
              CHAT IA
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-[hsl(var(--primary))] font-bold">{models.length}</span> modèles disponibles
            </p>
          </div>
        </div>

        {/* TASK-003: Layout 2/3 + 1/3 comme VIDEO */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          {/* Colonne principale - 2/3 */}
          <div className="space-y-4">
            {/* Sélecteur de modèle */}
            <Card className="panel-3d p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[hsl(var(--secondary))]" />
                <span className="font-display text-xs font-bold">MODÈLE IA</span>
              </div>
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                category="llms"
                className="w-full"
              />
            </Card>

            {/* Zone de chat principale - aspect-video */}
            <Card className="panel-3d aspect-video flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[hsl(45,100%,55%)]" />
                  <span className="font-display font-bold">CONVERSATION</span>
                  {selectedModel && (
                    <Badge className="bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)]">
                      {selectedModel.name}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearChat}
                  className="text-muted-foreground hover:text-foreground h-7 gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Effacer
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Bot className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-display text-lg">Démarrez une conversation</p>
                    <p className="text-sm">Sélectionnez un modèle et envoyez votre message</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-[hsl(45,100%,55%)]/20 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-[hsl(45,100%,55%)]" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          msg.role === "user"
                            ? "bg-[hsl(280,100%,65%)]/20 text-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {msg.role === "user" && (
                        <div className="h-8 w-8 rounded-full bg-[hsl(280,100%,65%)]/20 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-[hsl(280,100%,65%)]" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-[hsl(45,100%,55%)]/20 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-[hsl(45,100%,55%)]" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[hsl(45,100%,55%)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-[hsl(45,100%,55%)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-[hsl(45,100%,55%)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </Card>

            {/* Zone de saisie */}
            <Card className="panel-3d p-3">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  className="input-3d flex-1 min-h-[60px] max-h-[120px] resize-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className="btn-3d-yellow h-[60px] px-6"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Colonne droite - Historique (1/3) - TASK-003 */}
          <ChatHistoryPanel
            currentConversationId={null}
            onSelectConversation={(conversation) => {
              console.log("Selected conversation:", conversation);
            }}
            onPreviewConversation={(conversation) => {
              console.log("Preview conversation:", conversation);
            }}
            onDeleteConversation={(id) => {
              console.log("Delete conversation:", id);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Chat;