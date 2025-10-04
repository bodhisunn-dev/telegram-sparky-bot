import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const TestDailyGM = () => {
  const [isPosting, setIsPosting] = useState(false);

  const handleTestPost = async () => {
    setIsPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke('post-daily-gm');
      
      if (error) {
        throw error;
      }

      console.log('Test GM response:', data);
      toast.success('GM posted to Twitter! 🔥');
    } catch (error) {
      console.error('Error posting GM:', error);
      toast.error('Failed to post GM');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Daily GM Post</CardTitle>
        <CardDescription>
          Post a daily GM message to Twitter/X (scheduled for midnight EST)
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
            'Send Test GM Now'
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Short, funny degen GM messages for Twitter
        </p>
      </CardContent>
    </Card>
  );
};