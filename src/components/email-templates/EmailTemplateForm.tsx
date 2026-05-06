import { useState } from "react";
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

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface EmailTemplateFormProps {
  template?: EmailTemplate | null;
  onSubmit: (data: {
    name: string;
    category: string;
    subject: string;
    body: string;
  }) => void;
  onCancel: () => void;
}

const categories = ["Sales", "Support", "Marketing", "Onboarding", "General"];

const variables = [
  "{{first_name}}",
  "{{last_name}}",
  "{{company}}",
  "{{email}}",
  "{{phone}}",
  "{{title}}",
  "{{deal_name}}",
  "{{deal_value}}",
];

export function EmailTemplateForm({
  template,
  onSubmit,
  onCancel,
}: EmailTemplateFormProps) {
  const [name, setName] = useState(template?.name || "");
  const [category, setCategory] = useState(template?.category || "General");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, category, subject, body });
  }

  function insertVariable(variable: string) {
    setBody((prev) => prev + variable);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Template Name</Label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-muted border-border"
          placeholder="e.g., Follow-up after demo"
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-muted border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-muted border-border"
          placeholder="e.g., Great meeting with {{company}}"
        />
      </div>

      <div className="space-y-2">
        <Label>Body</Label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-muted border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 min-h-[150px] resize-y"
          placeholder="Write your email template here..."
        />
      </div>

      <div className="space-y-2">
        <Label>Variables</Label>
        <div className="flex flex-wrap gap-2">
          {variables.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="px-2 py-1 rounded-md bg-primary/15 text-primary text-xs font-mono hover:bg-primary/25 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Click to insert into body</p>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {template ? "Update Template" : "Create Template"}
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
