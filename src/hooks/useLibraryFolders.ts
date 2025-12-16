import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LibraryFolder {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
}

export function useLibraryFolders() {
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFolders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('library_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFolders((data as LibraryFolder[]) || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();

    const channel = supabase
      .channel('library-folders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'library_folders' },
        () => fetchFolders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createFolder = async (name: string, color: string = '#8B5CF6') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('library_folders')
        .insert({ name, color, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Folder Created',
        description: `"${name}" folder has been created.`
      });

      return data as LibraryFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create folder. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('library_folders')
        .update({ name: newName })
        .eq('id', folderId);

      if (error) throw error;

      toast({
        title: 'Folder Renamed',
        description: `Folder renamed to "${newName}".`
      });
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to rename folder. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from('library_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      toast({
        title: 'Folder Deleted',
        description: 'Folder has been deleted. Items moved to Uncategorized.'
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete folder. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const moveToFolder = async (assetId: string, folderId: string | null) => {
    try {
      const { error } = await supabase
        .from('avatar_library')
        .update({ folder_id: folderId })
        .eq('id', assetId);

      if (error) throw error;

      const folderName = folderId 
        ? folders.find(f => f.id === folderId)?.name || 'folder'
        : 'Uncategorized';

      toast({
        title: 'Item Moved',
        description: `Moved to "${folderName}".`
      });

      return true;
    } catch (error) {
      console.error('Error moving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to move item. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    folders,
    loading,
    createFolder,
    renameFolder,
    deleteFolder,
    moveToFolder,
    refetch: fetchFolders
  };
}
