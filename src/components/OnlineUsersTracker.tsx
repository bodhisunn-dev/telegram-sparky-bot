import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface OnlineUser {
  id: string;
  username: string | null;
  first_name: string | null;
  is_online: boolean;
  last_active_at: string | null;
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
    const { data: online } = await supabase
      .from('telegram_users')
      .select('id, username, first_name, is_online, last_active_at')
      .eq('is_online', true)
      .order('last_active_at', { ascending: false });

    const { data: offline } = await supabase
      .from('telegram_users')
      .select('id, username, first_name, is_online, last_active_at')
      .eq('is_online', false)
      .not('last_active_at', 'is', null)
      .order('last_active_at', { ascending: false })
      .limit(50);

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
        <CardContent className="max-h-96 overflow-y-auto">
          {onlineUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between py-2 border-b">
              <span>{user.username || user.first_name || 'Unknown'}</span>
              <Badge variant="default" className="bg-green-500">Online</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Offline Users (Recent)
            <Badge variant="secondary">{offlineUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          {offlineUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between py-2 border-b">
              <span>{user.username || user.first_name || 'Unknown'}</span>
              <Badge variant="secondary">Offline</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
