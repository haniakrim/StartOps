import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function SmartForecastGenerator() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Smart Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Button size="sm" variant="outline">Generate Forecast</Button>
      </CardContent>
    </Card>
  );
}
