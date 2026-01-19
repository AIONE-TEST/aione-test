import { useState } from "react";
import { Code, Terminal, Play, Save, FileCode, FolderOpen, Settings, Download } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Coding = () => {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "$ AIONE Terminal v1.0",
    "$ Bienvenue dans le terminal administrateur",
    "$ Python, Node.js, et autres langages disponibles",
    "$ Tapez 'help' pour voir les commandes disponibles",
    ""
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [codeContent, setCodeContent] = useState(`# Bienvenue dans l'éditeur AIONE
# Écrivez votre code ici

def hello_world():
    print("Hello from AIONE!")
    
if __name__ == "__main__":
    hello_world()
`);
  const [selectedLanguage, setSelectedLanguage] = useState("python");

  const languages = [
    { id: "python", label: "Python", icon: "🐍" },
    { id: "javascript", label: "JavaScript", icon: "📜" },
    { id: "typescript", label: "TypeScript", icon: "💎" },
    { id: "json", label: "JSON", icon: "📋" },
    { id: "html", label: "HTML", icon: "🌐" },
    { id: "css", label: "CSS", icon: "🎨" },
    { id: "sql", label: "SQL", icon: "🗃️" },
    { id: "bash", label: "Bash", icon: "💻" },
  ];

  const handleTerminalCommand = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && terminalInput.trim()) {
      const cmd = terminalInput.trim().toLowerCase();
      let response: string[] = [];

      switch (cmd) {
        case "help":
          response = [
            "Commandes disponibles:",
            "  help     - Affiche cette aide",
            "  clear    - Efface le terminal",
            "  python   - Lance Python",
            "  node     - Lance Node.js",
            "  version  - Affiche les versions",
            "  date     - Affiche la date",
            "  whoami   - Affiche l'utilisateur",
          ];
          break;
        case "clear":
          setTerminalOutput([]);
          setTerminalInput("");
          return;
        case "version":
          response = [
            "Python: 3.11.0",
            "Node.js: 20.10.0",
            "npm: 10.2.3",
            "TypeScript: 5.3.0",
          ];
          break;
        case "date":
          response = [new Date().toLocaleString("fr-FR")];
          break;
        case "whoami":
          response = ["admin@aione"];
          break;
        case "python":
          response = ["Python 3.11.0 (simulation)", ">>> "];
          break;
        case "node":
          response = ["Node.js v20.10.0 (simulation)", "> "];
          break;
        default:
          response = [`Commande non reconnue: ${cmd}`, "Tapez 'help' pour l'aide"];
      }

      setTerminalOutput(prev => [...prev, `$ ${terminalInput}`, ...response, ""]);
      setTerminalInput("");
    }
  };

  const handleRunCode = () => {
    setTerminalOutput(prev => [
      ...prev,
      `$ Exécution du code ${selectedLanguage}...`,
      "Output:",
      "Hello from AIONE!",
      "Exécution terminée avec succès.",
      ""
    ]);
  };

  const handleSaveCode = () => {
    const blob = new Blob([codeContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${selectedLanguage === "javascript" ? "js" : selectedLanguage === "typescript" ? "ts" : selectedLanguage}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[373px] min-h-screen p-6 flex flex-col">
        {/* Header */}
        <div className="mb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(210,100%,60%)] to-[hsl(280,100%,65%)] glow-blue">
                <Code className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-black gradient-text-cyan tracking-wider">
                  TERMINAL & CODAGE
                </h1>
                <p className="text-lg text-muted-foreground tracking-wide">
                  Éditeur de code & terminal administrateur
                </p>
              </div>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-2">
              {languages.map(lang => (
                <Button
                  key={lang.id}
                  size="sm"
                  variant={selectedLanguage === lang.id ? "default" : "outline"}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={cn(
                    "gap-1 font-display",
                    selectedLanguage === lang.id ? "btn-3d-cyan" : "btn-3d"
                  )}
                >
                  <span>{lang.icon}</span>
                  <span className="hidden lg:inline">{lang.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Layout: Terminal + Editor - même taille que fenêtre génération VIDEO */}
        <div className="flex flex-col gap-4 max-w-5xl">
          
          {/* TERMINAL - même taille que fenêtre VIDEO */}
          <div className="min-h-[450px]" style={{ aspectRatio: "16/9" }}>
            <Card className="panel-3d h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-[hsl(142,76%,50%)]" />
                  <span className="font-display font-bold text-lg">TERMINAL ADMIN</span>
                  <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]">ROOT</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTerminalOutput([])}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              
              {/* Terminal output */}
              <div className="flex-1 overflow-auto bg-black/80 p-4 font-mono text-sm text-green-400">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap">{line}</div>
                ))}
                
                {/* Input line */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-green-500">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleTerminalCommand}
                    className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
                    placeholder="Entrez une commande..."
                    autoFocus
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* EDITOR - même taille que fenêtre VIDEO */}
          <div className="min-h-[450px]" style={{ aspectRatio: "16/9" }}>
            <Card className="panel-3d h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-[hsl(280,100%,65%)]" />
                  <span className="font-display font-bold text-lg">ÉDITEUR DE CODE</span>
                  <Badge className="bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)]">
                    {languages.find(l => l.id === selectedLanguage)?.icon} {selectedLanguage.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleRunCode}
                    className="btn-3d-green gap-1"
                  >
                    <Play className="h-4 w-4" />
                    EXÉCUTER
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveCode}
                    className="btn-3d-purple gap-1"
                  >
                    <Download className="h-4 w-4" />
                    TÉLÉCHARGER
                  </Button>
                </div>
              </div>
              
              {/* Code editor */}
              <Textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="flex-1 resize-none bg-[hsl(220,20%,8%)] border-none rounded-none font-mono text-sm text-foreground p-4"
                style={{ minHeight: "100%" }}
                spellCheck={false}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Coding;
