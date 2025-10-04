import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('telegram_users')
        .select('*', { count: 'exact', head: true });

      // Get messages from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: messagesToday } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get active conversations (users who messaged in last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { count: activeConversations } = await supabase
        .from('telegram_users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', yesterday.toISOString());

      // Get images generated (bot messages with image data)
      const { count: imagesGenerated } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_bot_message', true)
        .or('message_text.ilike.%data:image%,message_text.ilike.%🎨%');

      return {
        totalUsers: totalUsers || 0,
        messagesToday: messagesToday || 0,
        activeConversations: activeConversations || 0,
        imagesGenerated: imagesGenerated || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
