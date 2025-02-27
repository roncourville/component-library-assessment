import { useState, useEffect } from 'react';
import { fetchUsers } from '../../lib/supabase-utils';
import { toast } from '@workspace/ui/hooks/use-toast';
import type { User } from '../../components/assignees';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await fetchUsers() as User[];
        setUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  return { users, isLoadingUsers };
}