import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const BotConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    botToken: "",
    gmEnabled: true,
    gnEnabled: true,
    imageGenEnabled: true,
    conversationMode: true,
    systemPrompt: "You are a helpful AI assistant in a Telegram supergroup. Be friendly, engaging, and help spark meaningful conversations.",
  });

  const handleSave = () => {
    toast({
      title: "Configuration Saved",
      description: "Bot settings have been updated successfully.",
    });
  };

  return (
    <div className="grid gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Bot Settings</CardTitle>
          <CardDescription>Configure your Telegram bot behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="botToken">Telegram Bot Token</Label>
            <Input
              id="botToken"
              type="password"
              placeholder="Enter your bot token"
              value={config.botToken}
              onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              rows={4}
              value={config.systemPrompt}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Enable or disable bot features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gm">Good Morning Responses</Label>
              <p className="text-sm text-muted-foreground">Auto-reply to "gm" messages</p>
            </div>
            <Switch
              id="gm"
              checked={config.gmEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, gmEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gn">Good Night Responses</Label>
              <p className="text-sm text-muted-foreground">Auto-reply to "gn" messages</p>
            </div>
            <Switch
              id="gn"
              checked={config.gnEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, gnEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="imageGen">AI Image Generation</Label>
              <p className="text-sm text-muted-foreground">Generate images from text prompts</p>
            </div>
            <Switch
              id="imageGen"
              checked={config.imageGenEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, imageGenEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="conversation">Conversation Mode</Label>
              <p className="text-sm text-muted-foreground">Learn and engage in conversations</p>
            </div>
            <Switch
              id="conversation"
              checked={config.conversationMode}
              onCheckedChange={(checked) => setConfig({ ...config, conversationMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
        <Save className="w-4 h-4 mr-2" />
        Save Configuration
      </Button>
    </div>
  );
};

export default BotConfig;
