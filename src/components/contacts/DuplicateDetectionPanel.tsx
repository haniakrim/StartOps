import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Check, X } from "lucide-react";
import type { DuplicateContact } from "@/hooks/useDuplicateDetection";

interface Props {
  duplicates: DuplicateContact[];
  loading: boolean;
  scanned: boolean;
  onScan: () => void;
  onMerge: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function DuplicateDetectionPanel({ duplicates, loading, scanned, onScan, onMerge, onDismiss }: Props) {
  if (!scanned) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <Button size="sm" onClick={onScan} disabled={loading}>
            {loading ? "Scanning..." : "Scan for Duplicates"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (duplicates.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex items-center gap-2 text-xs text-emerald-500">
          <Check className="w-4 h-4" />
          No duplicates found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          {duplicates.length} Potential Duplicates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {duplicates.map((dup) => (
          <div key={dup.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
            <div className="text-xs">
              <p className="font-medium">{dup.name}</p>
              <p className="text-muted-foreground">{dup.email} · {dup.score}% match</p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onMerge(dup.id)} title="Merge">
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDismiss(dup.id)} title="Dismiss">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
