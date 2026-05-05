import { useState } from "react";
import { Webhook, Copy, Check, RefreshCw, Key, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const webhooks = [
  { url: "https://api.startops.com/webhooks/contact-created", event: "contact.created", status: "active", lastTrigger: "2 min ago" },
  { url: "https://api.startops.com/webhooks/deal-won", event: "deal.won", status: "active", lastTrigger: "1 hour ago" },
  { url: "https://api.startops.com/webhooks/company-updated", event: "company.updated", status: "paused", lastTrigger: "3 days ago" },
];

const Api = () => {
  const [copied, setCopied] = useState(false);
  const apiKey = "sk_live_51Hx9m2K3LpQr8TnW4vYz";

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">API & Webhooks</h1>
        <p className="text-white/50 mt-1">Manage API keys and webhook integrations</p>
      </div>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-[#6452db]" />
            API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-[#0b0d10] border border-white/10 rounded-md px-4 py-3 text-sm text-white/80 font-mono">
              {apiKey}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyKey}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              {copied ? <Check className="w-4 h-4 text-[#8dc572]" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Shield className="w-4 h-4" />
            Never share your API key in client-side code or public repositories.
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#18191b] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Webhook className="w-4 h-4 text-[#6452db]" />
            Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            {webhooks.map((wh, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-[#0b0d10] rounded-lg border border-white/10"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-white/80 font-mono">{wh.event}</code>
                    <Badge
                      className={`text-xs ${
                        wh.status === "active"
                          ? "bg-[#8dc572]/20 text-[#8dc572] border-0"
                          : "bg-white/10 text-white/60 border-0"
                      }`}
                    >
                      {wh.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/40 truncate">{wh.url}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40">{wh.lastTrigger}</span>
                  <Switch checked={wh.status === "active"} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Api;