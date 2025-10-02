import { formatDistanceToNow } from "date-fns";
import { Bot, User } from "lucide-react";

interface RecentMessagesProps {
  expanded?: boolean;
}

const RecentMessages = ({ expanded = false }: RecentMessagesProps) => {
  const messages = [
    {
      id: 1,
      user: "Alice",
      message: "Hey bot, can you generate an image of a sunset?",
      isBot: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: 2,
      user: "Bot",
      message: "Sure! I'll generate a beautiful sunset image for you.",
      isBot: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    },
    {
      id: 3,
      user: "Bob",
      message: "gm everyone!",
      isBot: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
      id: 4,
      user: "Bot",
      message: "Good morning Bob! ☀️",
      isBot: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 9),
    },
    {
      id: 5,
      user: "Charlie",
      message: "What's the weather like today?",
      isBot: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
  ];

  const displayMessages = expanded ? messages : messages.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayMessages.map((msg) => (
        <div
          key={msg.id}
          className="flex gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              msg.isBot
                ? "bg-gradient-to-br from-primary to-accent"
                : "bg-muted"
            }`}
          >
            {msg.isBot ? (
              <Bot className="w-5 h-5 text-primary-foreground" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="font-medium">{msg.user}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
              </p>
            </div>
            <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentMessages;
