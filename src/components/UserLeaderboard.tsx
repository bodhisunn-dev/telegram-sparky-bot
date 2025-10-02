import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserLeaderboardProps {
  expanded?: boolean;
}

const UserLeaderboard = ({ expanded = false }: UserLeaderboardProps) => {
  const users = [
    { name: "Alice", messages: 342, engagement: 95, rank: 1 },
    { name: "Bob", messages: 287, engagement: 88, rank: 2 },
    { name: "Charlie", messages: 251, engagement: 82, rank: 3 },
    { name: "Diana", messages: 198, engagement: 75, rank: 4 },
    { name: "Eve", messages: 176, engagement: 68, rank: 5 },
  ];

  const displayUsers = expanded ? users : users.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayUsers.map((user) => (
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
