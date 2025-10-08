import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface OnlineUser {
  id: string;
  username: string | null;
  first_name: string | null;
  is_online: boolean;
  last_active_at: string | null;
  online_status_updated_at: string | null;
}

export const OnlineUsersTracker = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    fetchUsers();
    
    const channel = supabase
      .channel('online-users-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'telegram_users' 
      }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    // Get users who sent messages in the last 10 minutes (considered online)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: online } = await supabase
      .from('telegram_users')
      .select('id, username, first_name, is_online, last_active_at, online_status_updated_at')
      .eq('is_online', true)
      .gte('online_status_updated_at', tenMinutesAgo)
      .order('online_status_updated_at', { ascending: false });

    const { data: offline } = await supabase
      .from('telegram_users')
      .select('id, username, first_name, is_online, last_active_at, online_status_updated_at')
      .or(`is_online.eq.false,online_status_updated_at.lt.${tenMinutesAgo}`)
      .not('last_active_at', 'is', null)
      .order('last_active_at', { ascending: false })
      .limit(100);

    setOnlineUsers(online || []);
    setOfflineUsers(offline || []);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Online Users
            <Badge variant="default">{onlineUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto space-y-2">
          {onlineUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No users currently active</p>
          ) : (
            onlineUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex flex-col">
                  <span className="font-medium">{user.username || user.first_name || 'Unknown'}</span>
                  {user.online_status_updated_at && (
                    <span className="text-xs text-muted-foreground">
                      Active {formatDistanceToNow(new Date(user.online_status_updated_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <span className="mr-1">●</span> Online
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Offline Users (Recent)
            <Badge variant="secondary">{offlineUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto space-y-2">
          {offlineUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity</p>
          ) : (
            offlineUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex flex-col">
                  <span className="font-medium">{user.username || user.first_name || 'Unknown'}</span>
                  {user.last_active_at && (
                    <span className="text-xs text-muted-foreground">
                      Last seen {formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <Badge variant="secondary">Offline</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
