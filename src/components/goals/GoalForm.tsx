import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KeyResultInput {
  name: string;
  current_value: string;
  target_value: string;
  unit: string;
}

interface GoalFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    period: string;
    status: string;
    key_results: KeyResultInput[];
  }) => void;
  onCancel: () => void;
}

export function GoalForm({ onSubmit, onCancel }: GoalFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("Q1 2024");
  const [status, setStatus] = useState("on_track");
  const [keyResults, setKeyResults] = useState<KeyResultInput[]>([
    { name: "", current_value: "0", target_value: "100", unit: "%" },
  ]);

  function addKR() {
    setKeyResults((prev) => [
      ...prev,
      { name: "", current_value: "0", target_value: "100", unit: "%" },
    ]);
  }

  function updateKR(index: number, field: keyof KeyResultInput, value: string) {
    setKeyResults((prev) =>
      prev.map((kr, i) => (i === index ? { ...kr, [field]: value } : kr))
    );
  }

  function removeKR(index: number) {
    setKeyResults((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      description,
      period,
      status,
      key_results: keyResults.filter((kr) => kr.name.trim()),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Objective</Label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-muted border-border"
          placeholder="Increase monthly recurring revenue"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-muted border-border"
          placeholder="Grow revenue through expansion and new customers"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="Q1 2024">Q1 2024</SelectItem>
              <SelectItem value="Q2 2024">Q2 2024</SelectItem>
              <SelectItem value="Q3 2024">Q3 2024</SelectItem>
              <SelectItem value="Q4 2024">Q4 2024</SelectItem>
              <SelectItem value="FY 2024">FY 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Initial Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="behind">Behind</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Key Results</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addKR}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add KR
          </Button>
        </div>
        {keyResults.map((kr, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-muted border border-border space-y-2"
          >
            <div className="flex items-center gap-2">
              <Input
                value={kr.name}
                onChange={(e) => updateKR(i, "name", e.target.value)}
                className="bg-card border-border flex-1"
                placeholder="Achieve $100K MRR"
              />
              {keyResults.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeKR(i)}
                  className="text-muted-foreground hover:text-destructive h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={kr.current_value}
                onChange={(e) => updateKR(i, "current_value", e.target.value)}
                className="bg-card border-border"
                placeholder="Current"
              />
              <Input
                type="number"
                value={kr.target_value}
                onChange={(e) => updateKR(i, "target_value", e.target.value)}
                className="bg-card border-border"
                placeholder="Target"
              />
              <Select
                value={kr.unit}
                onValueChange={(v) => updateKR(i, "unit", v)}
              >
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="%">%</SelectItem>
                  <SelectItem value="$">$</SelectItem>
                  <SelectItem value="#">#</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Create OKR
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}