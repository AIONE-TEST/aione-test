import { Link } from "react-router-dom";
import { Sparkles, MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            AI ONE
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Modèles
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/chat" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </Link>
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
