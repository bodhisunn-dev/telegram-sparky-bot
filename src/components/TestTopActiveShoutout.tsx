import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

export const TestTopActiveShoutout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('top-active-shoutout');
      
      if (error) throw error;
      
      toast({
        title: "Shoutout sent! 🎉",
        description: `Tagged ${data.userCount} active members: ${data.users.join(', ')}`,
      });
      
      console.log('Shoutout response:', data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send shoutout",
        variant: "destructive",
      });
      console.error('Shoutout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Test Top Active Users Shoutout</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleTest}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Shoutout to Top 10 Active Users
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
