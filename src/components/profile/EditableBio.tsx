import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditableBioProps {
  bio: string | null;
  onSave: (newBio: string) => Promise<void>;
}

export function EditableBio({ bio, onSave }: EditableBioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedBio);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedBio(bio || '');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">About</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
        {bio ? (
          <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>
        ) : (
          <p className="text-muted-foreground italic">No bio yet. Click Edit to add one.</p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold">Edit About</h3>
      <Textarea
        value={editedBio}
        onChange={(e) => setEditedBio(e.target.value)}
        placeholder="Tell us about yourself..."
        className="min-h-[150px]"
        maxLength={500}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {editedBio.length}/500 characters
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
