import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  blocked_at: string;
}

export function useBlockedUsers() {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBlockedUsers();
    }
  }, [user]);

  const fetchBlockedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (targetUserId: string) => {
    if (!user) {
      toast.error('Please sign in to block users');
      return false;
    }

    if (user.id === targetUserId) {
      toast.error('You cannot block yourself');
      return false;
    }

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          user_id: user.id,
          blocked_user_id: targetUserId,
        });

      if (error) throw error;
      
      toast.success('User blocked');
      fetchBlockedUsers();
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('User already blocked');
      } else {
        console.error('Error blocking user:', error);
        toast.error('Failed to block user');
      }
      return false;
    }
  };

  const unblockUser = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', user.id)
        .eq('blocked_user_id', targetUserId);

      if (error) throw error;
      
      toast.success('User unblocked');
      fetchBlockedUsers();
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
      return false;
    }
  };

  const isUserBlocked = (targetUserId: string): boolean => {
    return blockedUsers.some(bu => bu.blocked_user_id === targetUserId);
  };

  return {
    blockedUsers,
    loading,
    blockUser,
    unblockUser,
    isUserBlocked,
    refetch: fetchBlockedUsers,
  };
}
