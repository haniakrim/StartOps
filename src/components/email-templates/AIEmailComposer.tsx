import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface Props {
  onGenerate?: (content: string) => void;
}

export function AIEmailComposer({ onGenerate }: Props) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <Button size="sm" variant="outline" onClick={() => onGenerate?.("")}>
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          Generate with AI
        </Button>
      </CardContent>
    </Card>
  );
}
