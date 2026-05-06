import { Trash2, Tag, Download, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onStatusChange?: (status: string) => void;
  onExport?: () => void;
  onTagAdd?: (tag: string) => void;
  showStatus?: boolean;
  showTags?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  onDelete,
  onStatusChange,
  onExport,
  onTagAdd,
  showStatus = true,
  showTags = true,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
      </div>

      <div className="h-4 w-px bg-border" />

      {showStatus && onStatusChange && (
        <Select onValueChange={onStatusChange}>
          <SelectTrigger className="h-8 w-36 bg-muted border-border text-foreground text-xs">
            <Tag className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Customer">Customer</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showTags && onTagAdd && (
        <Select onValueChange={onTagAdd}>
          <SelectTrigger className="h-8 w-32 bg-muted border-border text-foreground text-xs">
            <Tag className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Add tag" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="VIP">VIP</SelectItem>
            <SelectItem value="Hot Lead">Hot Lead</SelectItem>
            <SelectItem value="Follow Up">Follow Up</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
            <SelectItem value="SMB">SMB</SelectItem>
          </SelectContent>
        </Select>
      )}

      {onExport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="h-8 text-muted-foreground hover:text-foreground hover:bg-accent text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
      >
        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
        Delete
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-8 text-muted-foreground hover:text-foreground hover:bg-accent text-xs ml-auto"
      >
        <X className="w-3.5 h-3.5 mr-1.5" />
        Clear
      </Button>
    </div>
  );
}