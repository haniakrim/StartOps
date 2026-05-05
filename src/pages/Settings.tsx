import { useState } from "react";
import {
  Settings,
  Palette,
  Globe,
  Type,
  Image,
  Save,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  EyeOff,
  Undo2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("white-label");
  const [brandName, setBrandName] = useState("NexusCRM");
  const [brandColor, setBrandColor] = useState("#6452db");
  const [accentColor, setAccentColor] = useState("#ff8964");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [customDomain, setCustomDomain] = useState("crm.company.com");
  const [emailFrom, setEmailFrom] = useState("noreply@nexuscrm.io");
  const [emailSignature, setEmailSignature] = useState("Powered by NexusCRM");
  const [showPreview, setShowPreview] = useState(true);
  const [darkModeDefault, setDarkModeDefault] = useState(true);
  const [customCSS, setCustomCSS] = useState("/* Custom CSS overrides */\n");
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (setter: (val: any) => void) => (e: React.ChangeEvent<any>) => {
    setter(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  const handleReset = () => {
    setBrandName("NexusCRM");
    setBrandColor("#6452db");
    setAccentColor("#ff8964");
    setCustomDomain("crm.company.com");
    setEmailFrom("noreply@nexuscrm.io");
    setEmailSignature("Powered by NexusCRM");
    setCustomCSS("/* Custom CSS overrides */\n");
    setHasChanges(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-app font-bold text-white">Settings</h1>
          <p className="text-sm text-white/45 mt-0.5">
            Configure white-labeling, branding, and system preferences
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-warning/20 text-warning text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Unsaved changes
            </Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-surface border border-hairline-soft">
          <TabsTrigger value="white-label" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Palette className="w-3.5 h-3.5 mr-1.5" />
            White-Label
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Type className="w-3.5 h-3.5 mr-1.5" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="domain" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            Domain & Email
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs data-[state=active]:bg-violet data-[state=active]:text-white text-white/65">
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* White-Label Tab */}
        <TabsContent value="white-label" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card className="bg-surface border-hairline-soft rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-app font-medium text-white">Brand Identity</CardTitle>
                  <CardDescription className="text-xs text-white/45">
                    Customize how your CRM appears to users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Application Name</Label>
                    <Input
                      value={brandName}
                      onChange={handleChange(setBrandName)}
                      className="bg-surface-elevated border-hairline-soft text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={handleChange(setBrandColor)}
                        className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <Input
                        value={brandColor}
                        onChange={handleChange(setBrandColor)}
                        className="bg-surface-elevated border-hairline-soft text-white font-mono text-sm flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Accent Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={handleChange(setAccentColor)}
                        className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <Input
                        value={accentColor}
                        onChange={handleChange(setAccentColor)}
                        className="bg-surface-elevated border-hairline-soft text-white font-mono text-sm flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-hairline-soft rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-app font-medium text-white">Logo & Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Application Logo</Label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-surface-elevated border border-hairline-soft flex items-center justify-center">
                        <Image className="w-6 h-6 text-white/20" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-elevated border border-hairline-soft border-dashed cursor-pointer hover:border-white/20 transition-colors">
                          <Upload className="w-4 h-4 text-white/30" />
                          <span className="text-xs text-white/45">Drop logo here or click to upload</span>
                        </div>
                        <p className="text-xs text-white/30 mt-1">Recommended: 512x512px PNG or SVG</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/65">Favicon</Label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-hairline-soft flex items-center justify-center">
                        <Image className="w-4 h-4 text-white/20" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-elevated border border-hairline-soft border-dashed cursor-pointer hover:border-white/20 transition-colors">
                          <Upload className="w-4 h-4 text-white/30" />
                          <span className="text-xs text-white/45">Upload favicon</span>
                        </div>
                        <p className="text-xs text-white/30 mt-1">32x32px ICO or PNG</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <Card className="bg-surface border-hairline-soft rounded-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-app font-medium text-white">Live Preview</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5 h-7 text-xs"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                      {showPreview ? "Hide" : "Show"}
                    </Button>
                  </div>
                </CardHeader>
                {showPreview && (
                  <CardContent className="space-y-4">
                    {/* Mock Sidebar Preview */}
                    <div className="rounded-lg border border-hairline-soft overflow-hidden">
                      <div className="flex h-48">
                        <div className="w-14 bg-canvas border-r border-hairline-soft p-2 space-y-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ backgroundColor: brandColor }}>
                            <Palette className="w-4 h-4 text-white" />
                          </div>
                          <div className="w-6 h-6 rounded bg-white/5 mx-auto" />
                          <div className="w-6 h-6 rounded bg-white/5 mx-auto" />
                          <div className="w-6 h-6 rounded bg-white/5 mx-auto" />
                        </div>
                        <div className="flex-1 bg-canvas p-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-white/85">{brandName}</span>
                            <div className="w-16 h-4 rounded bg-white/5" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-8 rounded bg-surface" />
                            <div className="h-8 rounded bg-surface" />
                            <div className="h-8 rounded bg-surface" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Palette */}
                    <div className="space-y-2">
                      <Label className="text-xs text-white/65">Color Palette</Label>
                      <div className="flex items-center gap-2">
                        <div className="space-y-1 text-center">
                          <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: brandColor }} />
                          <span className="text-[10px] text-white/30">Primary</span>
                        </div>
                        <div className="space-y-1 text-center">
                          <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: accentColor }} />
                          <span className="text-[10px] text-white/30">Accent</span>
                        </div>
                        <div className="space-y-1 text-center">
                          <div className="w-10 h-10 rounded-lg bg-canvas border border-hairline-soft" />
                          <span className="text-[10px] text-white/30">Canvas</span>
                        </div>
                        <div className="space-y-1 text-center">
                          <div className="w-10 h-10 rounded-lg bg-surface border border-hairline-soft" />
                          <span className="text-[10px] text-white/30">Surface</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card className="bg-surface border-hairline-soft rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-app font-medium text-white">Theme Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/85">Dark Mode Default</p>
                      <p className="text-xs text-white/30">Use dark theme as default for new users</p>
                    </div>
                    <Switch checked={darkModeDefault} onCheckedChange={setDarkModeDefault} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/85">Allow Theme Toggle</p>
                      <p className="text-xs text-white/30">Let users switch between light and dark</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/85">Custom Fonts</p>
                      <p className="text-xs text-white/30">Use custom font family</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Email Branding</CardTitle>
              <CardDescription className="text-xs text-white/45">
                Customize email templates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/65">From Email Address</Label>
                <Input
                  value={emailFrom}
                  onChange={handleChange(setEmailFrom)}
                  className="bg-surface-elevated border-hairline-soft text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/65">Email Signature</Label>
                <Input
                  value={emailSignature}
                  onChange={handleChange(setEmailSignature)}
                  className="bg-surface-elevated border-hairline-soft text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/65">Email Template Style</Label>
                <Select defaultValue="modern">
                  <SelectTrigger className="bg-surface-elevated border-hairline-soft text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-hairline-soft">
                    <SelectItem value="modern">Modern Dark</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Login Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/65">Background Style</Label>
                <Select defaultValue="gradient">
                  <SelectTrigger className="bg-surface-elevated border-hairline-soft text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-hairline-soft">
                    <SelectItem value="gradient">Gradient Orbs</SelectItem>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="image">Custom Image</SelectItem>
                    <SelectItem value="video">Video Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/65">Login Page Message</Label>
                <Input
                  defaultValue="Welcome back! Sign in to continue."
                  className="bg-surface-elevated border-hairline-soft text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Show Logo on Login</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Tab */}
        <TabsContent value="domain" className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Custom Domain</CardTitle>
              <CardDescription className="text-xs text-white/45">
                Use your own domain for the CRM application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/65">Domain Name</Label>
                <Input
                  value={customDomain}
                  onChange={handleChange(setCustomDomain)}
                  className="bg-surface-elevated border-hairline-soft text-white"
                />
                <p className="text-xs text-white/30">
                  Add a CNAME record pointing to custom.nexuscrm.io
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <div>
                  <p className="text-sm text-success">Domain verified</p>
                  <p className="text-xs text-white/45">SSL certificate active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/65">SMTP Server</Label>
                <Input
                  defaultValue="smtp.sendgrid.net"
                  className="bg-surface-elevated border-hairline-soft text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/65">Port</Label>
                  <Input
                    defaultValue="587"
                    className="bg-surface-elevated border-hairline-soft text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-white/65">Encryption</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger className="bg-surface-elevated border-hairline-soft text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-elevated border-hairline-soft">
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">DKIM Signing</p>
                  <p className="text-xs text-white/30">Enable DKIM for email authentication</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Custom CSS</CardTitle>
              <CardDescription className="text-xs text-white/45">
                Add custom CSS to override default styles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={customCSS}
                onChange={handleChange(setCustomCSS)}
                className="w-full h-48 px-3 py-2 rounded-md bg-surface-elevated border border-hairline-soft text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
                placeholder="/* Enter your custom CSS here */"
              />
              <p className="text-xs text-white/30 mt-2">
                Changes apply immediately. Use with caution.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface border-hairline-soft rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-app font-medium text-white">Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Data Residency</p>
                  <p className="text-xs text-white/30">Choose where your data is stored</p>
                </div>
                <Select defaultValue="us">
                  <SelectTrigger className="w-40 bg-surface-elevated border-hairline-soft text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-hairline-soft">
                    <SelectItem value="us">US (Virginia)</SelectItem>
                    <SelectItem value="eu">EU (Frankfurt)</SelectItem>
                    <SelectItem value="apac">APAC (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">GDPR Mode</p>
                  <p className="text-xs text-white/30">Enable GDPR compliance features</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/85">Data Export</p>
                  <p className="text-xs text-white/30">Allow users to export their data</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-hairline-soft">
        <Button
          variant="outline"
          size="sm"
          className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5"
          onClick={handleReset}
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              className="border-hairline-soft text-white/45 hover:text-white hover:bg-white/5"
              onClick={() => setHasChanges(false)}
            >
              Discard
            </Button>
          )}
          <Button
            size="sm"
            className="bg-violet hover:bg-violet/90 text-white"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
