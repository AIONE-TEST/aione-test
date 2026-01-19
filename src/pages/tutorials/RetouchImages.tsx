import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Wand2, ArrowLeft, Lightbulb, ArrowRight } from "lucide-react";

const RetouchImages = () => (
  <div className="min-h-screen bg-background">
    <Sidebar />
    <main className="ml-[373px] min-h-screen p-8">
      <Link to="/tutorials">
        <Button variant="ghost" className="gap-2 mb-4 text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour aux tutoriels
        </Button>
      </Link>
      <div className="flex items-center gap-6 mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(174,100%,50%)] to-[hsl(142,76%,50%)] glow-cyan">
          <Wand2 className="h-10 w-10 text-black" />
        </div>
        <div>
          <Badge className="mb-2 bg-[hsl(45,100%,55%)]/20 text-[hsl(45,100%,55%)]">Intermédiaire • 15 min</Badge>
          <h1 className="font-display text-4xl font-black gradient-text-cyan">RETOUCHER DES IMAGES</h1>
        </div>
      </div>
      <Card className="panel-3d p-6 max-w-4xl mb-6">
        <h3 className="font-display text-xl font-bold text-white mb-4">Étapes principales</h3>
        <ul className="space-y-3">
          {["Accédez à RETOUCHE dans la sidebar", "Uploadez l'image à modifier", "Choisissez l'action: Upscale, Remove Background, Enhance", "Ajustez les paramètres", "Téléchargez l'image optimisée"].map((s, i) => (
            <li key={i} className="flex items-start gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(174,100%,50%)]/20 text-[hsl(174,100%,50%)] text-sm font-bold">{i+1}</span><span className="text-muted-foreground">{s}</span></li>
          ))}
        </ul>
      </Card>
      <Link to="/retouch"><Button className="btn-3d-cyan gap-2"><Wand2 className="h-4 w-4" />Aller à RETOUCHE</Button></Link>
    </main>
  </div>
);

export default RetouchImages;
