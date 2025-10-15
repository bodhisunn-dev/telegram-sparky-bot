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
      const { data, error } = await supabase
        .from('telegram_users')
        .select('*')
        .order('engagement_score', { ascending: false })
        .order('message_count', { ascending: false })
        .limit(expanded ? 1000 : 5);
      
      if (error) throw error;
      return data.map((user, index) => ({
        rank: index + 1,
        name: user.first_name || user.username || 'Anonymous',
        messages: user.message_count || 0,
        engagement: user.engagement_score || 0,
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
