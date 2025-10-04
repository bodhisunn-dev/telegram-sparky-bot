import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

export const TestMemetropolisPost = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('hourly-memetropolis-post');
      
      if (error) throw error;
      
      toast({
        title: "Test post sent! 🚀",
        description: "Check your global Memetropolis chat for the message.",
      });
      
      console.log('Test post response:', data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send test post",
        variant: "destructive",
      });
      console.error('Test post error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Test Hourly Post</CardTitle>
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
              Send Test Post Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
