import { useState } from "react";

const Chat = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border p-4">
        <h1 className="text-2xl font-bold text-foreground">AI Chat</h1>
      </header>
      
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 rounded-lg bg-muted p-4">
            <p className="text-muted-foreground">
              Bienvenue ! Sélectionnez un modèle et commencez à discuter.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border p-4">
        <div className="mx-auto flex max-w-4xl gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90">
            Envoyer
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
