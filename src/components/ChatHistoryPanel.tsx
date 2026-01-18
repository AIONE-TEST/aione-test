import { useState, useMemo } from "react";
import { History, MessageSquare, ExternalLink, Trash2, ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getModelLogo } from "@/data/modelLogos";

interface ChatConversation {
  id: string;
  title: string;
  modelId: string;
  modelName: string;
  provider?: string;
  lastMessage: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryPanelProps {
  currentConversationId?: string | null;
  onSelectConversation?: (conversation: ChatConversation) => void;
  onPreviewConversation?: (conversation: ChatConversation) => void;
  onDeleteConversation?: (conversationId: string) => void;
  className?: string;
}

// Données de démo
const mockConversations: ChatConversation[] = [
  { 
    id: "1", 
    title: "Aide au code Python", 
    modelId: "gpt-4o", 
    modelName: "GPT-4o",
    provider: "openai",
    lastMessage: "Voici comment optimiser votre fonction...",
    messageCount: 12,
    createdAt: new Date(Date.now() - 3600000), 
    updatedAt: new Date(Date.now() - 1800000)
  },
  { 
    id: "2", 
    title: "Rédaction article blog", 
    modelId: "claude-3.5-sonnet", 
    modelName: "Claude 3.5",
    provider: "anthropic",
    lastMessage: "Je vous propose cette structure...",
    messageCount: 8,
    createdAt: new Date(Date.now() - 7200000), 
    updatedAt: new Date(Date.now() - 5400000)
  },
  { 
    id: "3", 
    title: "Traduction anglais", 
    modelId: "gemini-pro", 
    modelName: "Gemini Pro",
    provider: "google",
    lastMessage: "Here is the translation...",
    messageCount: 4,
    createdAt: new Date(Date.now() - 86400000), 
    updatedAt: new Date(Date.now() - 43200000)
  },
  { 
    id: "4", 
    title: "Analyse de données", 
    modelId: "deepseek-v3", 
    modelName: "DeepSeek V3",
    provider: "deepseek",
    lastMessage: "Les tendances montrent que...",
    messageCount: 15,
    createdAt: new Date(Date.now() - 172800000), 
    updatedAt: new Date(Date.now() - 86400000)
  },
  { 
    id: "5", 
    title: "Brainstorming idées", 
    modelId: "mistral-large", 
    modelName: "Mistral Large",
    provider: "mistral",
    lastMessage: "Voici 10 idées innovantes...",
    messageCount: 6,
    createdAt: new Date(Date.now() - 259200000), 
    updatedAt: new Date(Date.now() - 172800000)
  },
];

export function ChatHistoryPanel({ 
  currentConversationId, 
  onSelectConversation, 
  onPreviewConversation,
  onDeleteConversation,
  className 
}: ChatHistoryPanelProps) {
  const [conversationsOpen, setConversationsOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "< 1h";
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  };

  const renderConversationItem = (conversation: ChatConversation) => {
    const isCurrent = currentConversationId === conversation.id;
    const logoUrl = getModelLogo(conversation.modelId, conversation.provider);
    
    return (
      <div
        key={conversation.id}
        className={cn(
          "relative group rounded-lg overflow-hidden cursor-pointer transition-all duration-200",
          "border-2",
          isCurrent 
            ? "border-[hsl(var(--primary))] opacity-50 cursor-not-allowed" 
            : "border-transparent hover:border-[hsl(var(--primary))]/50",
          "bg-black/20"
        )}
        onMouseEnter={() => !isCurrent && setHoveredItem(conversation.id)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => !isCurrent && onSelectConversation?.(conversation)}
      >
        {/* Thumbnail avec logo du modèle */}
        <div className="aspect-square relative">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(45,100%,25%)]/30 to-[hsl(45,100%,15%)]/30">
            <img 
              src={logoUrl} 
              alt={conversation.modelName} 
              className="w-10 h-10 rounded-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/4529/4529978.png";
              }}
            />
          </div>

          {/* Message count badge */}
          <div className="absolute top-1 left-1 rounded px-1.5 py-0.5 bg-black/60 text-[hsl(45,100%,55%)]">
            <span className="text-[9px] font-bold">{conversation.messageCount}</span>
          </div>

          {/* Time */}
          <div className="absolute bottom-1 right-1 text-[8px] font-display bg-black/60 px-1 rounded">
            {formatTime(conversation.updatedAt)}
          </div>

          {/* Disabled overlay */}
          {isCurrent && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-[10px] font-display text-muted-foreground">ACTIF</span>
            </div>
          )}

          {/* Hover actions */}
          {hoveredItem === conversation.id && !isCurrent && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 animate-in fade-in duration-150">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 bg-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary))]/40"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewConversation?.(conversation);
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 bg-[hsl(0,100%,50%)]/20 hover:bg-[hsl(0,100%,50%)]/40"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation?.(conversation.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-[hsl(0,100%,60%)]" />
              </Button>
            </div>
          )}
        </div>

        {/* Conversation info */}
        <div className="px-1.5 py-1.5 bg-black/40">
          <p className="text-[9px] font-display truncate text-foreground font-medium">
            {conversation.title}
          </p>
          <p className="text-[8px] truncate text-muted-foreground">
            {conversation.modelName}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("panel-3d flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50 shrink-0">
        <History className="h-4 w-4 text-[hsl(var(--primary))]" />
        <span className="font-display text-sm font-bold">HISTORIQUE</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {/* Conversations */}
          <Collapsible open={conversationsOpen} onOpenChange={setConversationsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-[hsl(45,100%,55%)]" />
                <span className="font-display text-xs font-bold">CONVERSATIONS</span>
                <Badge variant="outline" className="text-[8px] px-1.5 h-4">
                  {mockConversations.length}
                </Badge>
              </div>
              {conversationsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {mockConversations.map(renderConversationItem)}
              </div>
              {mockConversations.length === 0 && (
                <p className="text-center text-[10px] text-muted-foreground py-4">
                  Aucune conversation
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-border/50 shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-7 text-[10px] gap-1 hover:bg-white/5"
        >
          <FolderOpen className="h-3 w-3" />
          TOUTES LES CONVERSATIONS
        </Button>
      </div>
    </div>
  );
}
