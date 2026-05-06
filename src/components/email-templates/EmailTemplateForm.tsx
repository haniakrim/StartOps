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
        <Label className="text-white/70">Template Name</Label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-[#0b0d10] border-white/10 text-white"
          placeholder="e.g., Follow-up after demo"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white/70">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-[#0b0d10] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1f2126] border-white/10 text-white">
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white/70">Subject</Label>
        <Input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-[#0b0d10] border-white/10 text-white"
          placeholder="e.g., Great meeting with {{company}}"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white/70">Body</Label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-[#0b0d10] border border-white/10 rounded-md p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6452db]/50 min-h-[150px] resize-y"
          placeholder="Write your email template here..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white/70">Variables</Label>
        <div className="flex flex-wrap gap-2">
          {variables.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="px-2 py-1 rounded-md bg-[#6452db]/20 text-[#6452db] text-xs font-mono hover:bg-[#6452db]/30 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/40">Click to insert into body</p>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1 bg-[#6452db] text-white hover:bg-[#6452db]/90"
        >
          {template ? "Update Template" : "Create Template"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-white/70 hover:text-white"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}