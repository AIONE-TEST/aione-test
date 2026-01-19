import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";

const UseLLMs = () => (
  <div className="min-h-screen bg-background">
    <Sidebar />
    <main className="ml-[373px] min-h-screen p-8">
      <Link to="/tutorials">
        <Button variant="ghost" className="gap-2 mb-4 text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour aux tutoriels
        </Button>
      </Link>
      <div className="flex items-center gap-6 mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(320,100%,60%)] to-[hsl(280,100%,65%)] glow-pink">
          <MessageSquare className="h-10 w-10 text-white" />
        </div>
        <div>
          <Badge className="mb-2 bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]">Débutant • 8 min</Badge>
          <h1 className="font-display text-4xl font-black gradient-text-pink">UTILISER LES LLMs</h1>
        </div>
      </div>
      <Card className="panel-3d p-6 max-w-4xl mb-6">
        <h3 className="font-display text-xl font-bold text-white mb-4">Étapes principales</h3>
        <ul className="space-y-3">
          {["Naviguez vers CHAT dans la sidebar", "Comparez GPT-4, Claude, Gemini selon vos besoins", "Structurez vos questions clairement", "Utilisez le contexte pour des réponses précises", "Expérimentez avec différents modèles"].map((s, i) => (
            <li key={i} className="flex items-start gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(320,100%,60%)]/20 text-[hsl(320,100%,60%)] text-sm font-bold">{i+1}</span><span className="text-muted-foreground">{s}</span></li>
          ))}
        </ul>
      </Card>
      <Link to="/chat"><Button className="btn-3d-pink gap-2"><MessageSquare className="h-4 w-4" />Aller au CHAT</Button></Link>
    </main>
  </div>
);

export default UseLLMs;
