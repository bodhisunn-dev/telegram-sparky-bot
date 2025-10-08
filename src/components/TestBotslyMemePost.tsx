import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const TestBotslyMemePost = () => {
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    setIsPosting(true);
    try {
      const { error } = await supabase.functions.invoke('botsly-meme-post');
      
      if (error) throw error;
      
      toast.success("BotslyAI meme description posted successfully!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to post meme description");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test BotslyAI Meme Post</CardTitle>
        <CardDescription>
          Post a random degen meme description with /generate command (runs automatically every 30 minutes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handlePost} disabled={isPosting} className="w-full">
          <Wand2 className="w-4 h-4 mr-2" />
          {isPosting ? "Posting..." : "Post Meme Description"}
        </Button>
      </CardContent>
    </Card>
  );
};
