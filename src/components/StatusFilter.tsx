import { APIStatus } from "@/data/aiModels";
import { Button } from "@/components/ui/button";
import { Zap, Check, X, Filter } from "lucide-react";

interface StatusFilterProps {
  selectedStatus: APIStatus | "all";
  onStatusChange: (status: APIStatus | "all") => void;
}

const statuses: { id: APIStatus | "all"; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "Tous", icon: <Filter className="h-4 w-4" /> },
  { id: "free", label: "Gratuit", icon: <Zap className="h-4 w-4" /> },
  { id: "active", label: "Actif", icon: <Check className="h-4 w-4" /> },
  { id: "inactive", label: "Non configuré", icon: <X className="h-4 w-4" /> },
];

export function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <Button
          key={status.id}
          variant={selectedStatus === status.id ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onStatusChange(status.id)}
          className="gap-2"
        >
          {status.icon}
          {status.label}
        </Button>
      ))}
    </div>
  );
}
