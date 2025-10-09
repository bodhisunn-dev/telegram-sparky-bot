import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";

export const TestUserMentions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mention-users');
      
      if (error) throw error;
      
      toast({
        title: "Users mentioned! 👥",
        description: `Mentioned ${data.mentioned} users. Progress: ${data.progress}`,
      });
      
      console.log('Mention response:', data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mention users",
        variant: "destructive",
      });
      console.error('Mention error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Test User Mentions</CardTitle>
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
              Mentioning...
            </>
          ) : (
            <>
              <Users className="w-4 h-4" />
              Mention Next Batch (10 users)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
