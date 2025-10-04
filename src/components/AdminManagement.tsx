import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AdminManagement = () => {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('add_admin_by_email', {
        admin_email: email
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; user_id?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add admin');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setNewAdminEmail("");
      toast({
        title: "Admin added",
        description: "User has been granted admin access.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: "Admin removed",
        description: "User's admin access has been revoked.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminEmail.trim()) {
      addAdminMutation.mutate(newAdminEmail.trim());
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Add New Admin</CardTitle>
          </div>
          <CardDescription>
            Grant admin access to existing users (they must sign up first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="flex gap-2">
            <Input
              type="email"
              placeholder="user@example.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              disabled={addAdminMutation.isPending}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Admin
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Current Admins</CardTitle>
          <CardDescription>
            Users with admin access to this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins?.map((admin, index) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString()}
                      {index === 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">(First admin)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {admins.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdminMutation.mutate(admin.id)}
                          disabled={removeAdminMutation.isPending}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      )}
                      {admins.length === 1 && (
                        <span className="text-xs text-muted-foreground">
                          Cannot remove last admin
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
