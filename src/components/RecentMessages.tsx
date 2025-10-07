import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bot, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RecentMessagesProps {
  expanded?: boolean;
}

const RecentMessages = ({ expanded = false }: RecentMessagesProps) => {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['recent-messages', expanded],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          message_text,
          is_bot_message,
          created_at,
          telegram_users (
            first_name,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .limit(expanded ? 50 : 5);
      
      if (error) throw error;
      return data.map(msg => ({
        id: msg.id,
        user: msg.is_bot_message ? 'Bot' : (msg.telegram_users?.first_name || msg.telegram_users?.username || 'Anonymous'),
        message: msg.message_text,
        isBot: msg.is_bot_message,
        timestamp: new Date(msg.created_at),
      }));
    },
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Loading messages...</div>;
  }

  if (messages.length === 0) {
    return <div className="text-muted-foreground">No messages yet. Start chatting in your Telegram group!</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => setSelectedMessage(msg)}
            className="flex gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
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

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  selectedMessage?.isBot
                    ? "bg-gradient-to-br from-primary to-accent"
                    : "bg-muted"
                }`}
              >
                {selectedMessage?.isBot ? (
                  <Bot className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{selectedMessage?.user}</p>
                <p className="text-xs text-muted-foreground font-normal">
                  {selectedMessage?.timestamp && 
                    formatDistanceToNow(selectedMessage.timestamp, { addSuffix: true })
                  }
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
            <p className="whitespace-pre-wrap break-words">{selectedMessage?.message}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentMessages;
