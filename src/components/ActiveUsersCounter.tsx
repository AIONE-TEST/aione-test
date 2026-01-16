import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActiveUser {
  username: string;
  last_activity: string;
}

// TÂCHE 20: Compteur d'utilisateurs actifs
export function ActiveUsersCounter() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveUsers();
    
    // Refresh every minute
    const interval = setInterval(fetchActiveUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("active_users")
        .select("username, last_activity");

      if (error) throw error;
      setActiveUsers(data || []);
    } catch (error) {
      console.error("Error fetching active users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-xs">...</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
          <div className="relative">
            <Users className="h-4 w-4 text-[hsl(142,76%,50%)]" />
            {activeUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(142,76%,50%)] animate-pulse" />
            )}
          </div>
          <Badge variant="outline" className="text-xs bg-[hsl(142,76%,50%)]/10 border-[hsl(142,76%,50%)]/30">
            {activeUsers.length} en ligne
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-display text-xs font-bold">Utilisateurs actifs :</p>
          {activeUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun utilisateur actif</p>
          ) : (
            <ul className="text-xs space-y-0.5">
              {activeUsers.map((user) => (
                <li key={user.username} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(142,76%,50%)]" />
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}