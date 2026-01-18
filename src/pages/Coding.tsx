import { useState, useEffect } from "react";
import { Code, Terminal, Play, Save, FileCode, Download, Search, ExternalLink, History } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MediaHistoryPanel } from "@/components/MediaHistoryPanel";
import { cn } from "@/lib/utils";

// Sites de dépôts et ressources pour développeurs
const devSites = [
  { name: "GitHub", url: "https://github.com/search?q=", icon: "🐙" },
  { name: "GitLab", url: "https://gitlab.com/search?search=", icon: "🦊" },
  { name: "Bitbucket", url: "https://bitbucket.org/repo/all?name=", icon: "🪣" },
  { name: "NPM", url: "https://www.npmjs.com/search?q=", icon: "📦" },
  { name: "PyPI", url: "https://pypi.org/search/?q=", icon: "🐍" },
  { name: "Stack Overflow", url: "https://stackoverflow.com/search?q=", icon: "📚" },
  { name: "CodePen", url: "https://codepen.io/search/pens?q=", icon: "✏️" },
  { name: "JSFiddle", url: "https://jsfiddle.net/search/?q=", icon: "🎻" },
  { name: "Replit", url: "https://replit.com/search?q=", icon: "⚡" },
  { name: "Gist", url: "https://gist.github.com/search?q=", icon: "📝" },
];

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
  const [devSearchQuery, setDevSearchQuery] = useState("");
  const [googleSearchQuery, setGoogleSearchQuery] = useState("");

  // Scroll en haut de page au chargement
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  // Recherche sur sites de développeurs
  const handleDevSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && devSearchQuery.trim()) {
      window.open(`https://github.com/search?q=${encodeURIComponent(devSearchQuery)}`, "_blank", "noopener,noreferrer");
    }
  };

  // Recherche Google
  const handleGoogleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && googleSearchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`, "_blank", "noopener,noreferrer");
    }
  };

  const searchOnSite = (siteUrl: string) => {
    if (devSearchQuery.trim()) {
      window.open(`${siteUrl}${encodeURIComponent(devSearchQuery)}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* TASK-003: Layout identique à VIDEO - 2/3 gauche + 1/3 droite */}
      <main className="ml-[373px] min-h-screen p-4">
        {/* Header compact */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(210,100%,60%)] to-[hsl(280,100%,65%)] glow-blue">
            <Code className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black gradient-text-cyan tracking-wider">
              TERMINAL & CODAGE
            </h1>
            <p className="text-sm text-muted-foreground">
              Éditeur de code & terminal administrateur
            </p>
          </div>
          {/* Language selector */}
          <div className="flex items-center gap-1 ml-auto">
            {languages.map(lang => (
              <Button
                key={lang.id}
                size="sm"
                variant={selectedLanguage === lang.id ? "default" : "outline"}
                onClick={() => setSelectedLanguage(lang.id)}
                className={cn(
                  "gap-1 font-display h-8 px-2",
                  selectedLanguage === lang.id ? "btn-3d-cyan" : "btn-3d"
                )}
              >
                <span>{lang.icon}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* TASK-003: Layout 2/3 + 1/3 comme VIDEO */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          {/* Colonne principale - 2/3 */}
          <div className="space-y-4">
            {/* Barres de recherche */}
            <div className="grid grid-cols-2 gap-3">
              {/* Recherche Dépôts */}
              <Card className="panel-3d p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-[hsl(280,100%,65%)]" />
                  <span className="font-display text-xs font-bold">RECHERCHE DÉPÔTS</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={devSearchQuery}
                    onChange={(e) => setDevSearchQuery(e.target.value)}
                    onKeyDown={handleDevSearch}
                    placeholder="Rechercher du code..."
                    className="input-3d flex-1 h-8"
                  />
                  <Button 
                    size="sm" 
                    className="btn-3d-purple h-8"
                    onClick={() => handleDevSearch({ key: "Enter" } as React.KeyboardEvent)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {devSites.slice(0, 5).map(site => (
                    <a
                      key={site.name}
                      href={`${site.url}${encodeURIComponent(devSearchQuery || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-6 px-2 text-[10px] hover:bg-[hsl(280,100%,65%)]/20 rounded inline-flex items-center"
                      onClick={(e) => { if (!devSearchQuery) e.preventDefault(); }}
                    >
                      <span className="mr-1">{site.icon}</span>
                      {site.name}
                    </a>
                  ))}
                </div>
              </Card>

              {/* Recherche Google */}
              <Card className="panel-3d p-3">
                <div className="flex items-center gap-2 mb-2">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                  <span className="font-display text-xs font-bold">RECHERCHE GOOGLE</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={googleSearchQuery}
                    onChange={(e) => setGoogleSearchQuery(e.target.value)}
                    onKeyDown={handleGoogleSearch}
                    placeholder="Recherche Google..."
                    className="input-3d flex-1 h-8"
                  />
                  <Button 
                    size="sm" 
                    className="btn-3d-cyan h-8"
                    onClick={() => handleGoogleSearch({ key: "Enter" } as React.KeyboardEvent)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* TERMINAL - Zone principale aspect-video */}
            <Card className="panel-3d aspect-video flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-[hsl(142,76%,50%)]" />
                  <span className="font-display font-bold">TERMINAL ADMIN</span>
                  <Badge className="bg-[hsl(142,76%,50%)]/20 text-[hsl(142,76%,50%)]">ROOT</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setTerminalOutput([])}
                  className="text-muted-foreground hover:text-foreground h-7"
                >
                  Clear
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto bg-black/80 p-4 font-mono text-sm text-green-400">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap">{line}</div>
                ))}
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

            {/* ÉDITEUR DE CODE */}
            <Card className="panel-3d flex flex-col" style={{ minHeight: "300px" }}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-[hsl(280,100%,65%)]" />
                  <span className="font-display font-bold">ÉDITEUR DE CODE</span>
                  <Badge className="bg-[hsl(280,100%,65%)]/20 text-[hsl(280,100%,65%)]">
                    {languages.find(l => l.id === selectedLanguage)?.icon} {selectedLanguage.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleRunCode} className="btn-3d-green gap-1 h-7">
                    <Play className="h-4 w-4" />
                    EXÉCUTER
                  </Button>
                  <Button size="sm" onClick={handleSaveCode} className="btn-3d-purple gap-1 h-7">
                    <Download className="h-4 w-4" />
                    TÉLÉCHARGER
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="flex-1 resize-none bg-[hsl(220,20%,8%)] border-none rounded-none font-mono text-sm text-foreground p-4"
                style={{ minHeight: "250px" }}
                spellCheck={false}
              />
            </Card>
          </div>

          {/* Colonne droite - Historique (1/3) - TASK-003 */}
          <div className="space-y-4">
            <Card className="panel-3d p-4 h-full">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="font-display text-sm font-bold">HISTORIQUE</span>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <FileCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Historique des fichiers édités</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Coding;