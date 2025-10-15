import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserLeaderboardProps {
  expanded?: boolean;
}

const UserLeaderboard = ({ expanded = false }: UserLeaderboardProps) => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['telegram-users-leaderboard'],
    queryFn: async () => {
      // Get messages from last 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // Get users who have been active in last 24 hours with their message counts
      const { data: activeUsers, error: usersError } = await supabase
        .from('telegram_users')
        .select('id, telegram_id, first_name, last_name, username, last_active_at')
        .gte('last_active_at', last24Hours);
      
      if (usersError) throw usersError;
      if (!activeUsers || activeUsers.length === 0) return [];
      
      // Get message counts for each user in last 24 hours
      const userStatsPromises = activeUsers.map(async (user) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('telegram_user_id', user.id)
          .gte('created_at', last24Hours);
        
        return {
          ...user,
          message_count_24h: count || 0
        };
      });
      
      const usersWithStats = await Promise.all(userStatsPromises);
      
      // Filter out users with 0 messages and sort by message count
      const sortedUsers = usersWithStats
        .filter(user => user.message_count_24h > 0)
        .sort((a, b) => b.message_count_24h - a.message_count_24h)
        .slice(0, expanded ? 1000 : 5);
      
      return sortedUsers.map((user, index) => ({
        rank: index + 1,
        name: user.first_name || user.username || 'Anonymous',
        messages: user.message_count_24h,
        engagement: user.message_count_24h, // Using message count as engagement for now
      }));
    },
    refetchInterval: 86400000, // Refresh every 24 hours
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="text-muted-foreground">No users yet. Start chatting in your Telegram group!</div>;
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.name}
          className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
            {user.rank}
          </div>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.messages} messages</p>
          </div>
          <Badge variant="secondary" className="bg-accent/20 text-accent">
            {user.engagement}% engagement
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default UserLeaderboard;
