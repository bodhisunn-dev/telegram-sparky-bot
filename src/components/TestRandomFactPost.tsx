import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const TestRandomFactPost = () => {
  const [isPosting, setIsPosting] = useState(false);

  const handleTestPost = async () => {
    setIsPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke('post-random-facts');
      
      if (error) {
        throw error;
      }

      console.log('Test post response:', data);
      toast.success('Test post sent! Check Telegram and Twitter.');
    } catch (error) {
      console.error('Error posting test fact:', error);
      toast.error('Failed to post test fact');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Random Fact Post</CardTitle>
        <CardDescription>
          Post a random crypto fact to both Telegram and Twitter/X
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleTestPost} 
          disabled={isPosting}
          className="w-full"
        >
          {isPosting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            'Send Test Post Now'
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Posts are kept under 280 characters for Twitter
        </p>
      </CardContent>
    </Card>
  );
};