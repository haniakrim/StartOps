import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-expo-xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-h4 text-foreground mb-2">{title}</h3>
      <p className="text-body-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-expo-lg">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
