import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, FileCheck, Loader2 } from 'lucide-react';

interface VerificationUploadFormProps {
  onSuccess: () => void;
}

export function VerificationUploadForm({ onSuccess }: VerificationUploadFormProps) {
  const [documentType, setDocumentType] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!documentType || !frontFile || !backFile) {
      toast({
        title: 'Missing Information',
        description: 'Please select document type and upload both sides',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload front image
      const frontExt = frontFile.name.split('.').pop();
      const frontPath = `verification/${user.id}/front_${Date.now()}.${frontExt}`;
      const { error: frontError } = await supabase.storage
        .from('social-media')
        .upload(frontPath, frontFile);

      if (frontError) throw frontError;

      // Upload back image
      const backExt = backFile.name.split('.').pop();
      const backPath = `verification/${user.id}/back_${Date.now()}.${backExt}`;
      const { error: backError } = await supabase.storage
        .from('social-media')
        .upload(backPath, backFile);

      if (backError) throw backError;

      // Get public URLs
      const { data: { publicUrl: frontUrl } } = supabase.storage
        .from('social-media')
        .getPublicUrl(frontPath);

      const { data: { publicUrl: backUrl } } = supabase.storage
        .from('social-media')
        .getPublicUrl(backPath);

      // Submit verification request
      const { error: submitError } = await supabase.functions.invoke('submit-verification', {
        body: {
          document_type: documentType,
          front_url: frontUrl,
          back_url: backUrl,
        },
      });

      if (submitError) throw submitError;

      toast({
        title: 'Verification Submitted',
        description: 'Your documents have been submitted for review',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Documents</CardTitle>
        <CardDescription>
          Upload a valid government-issued ID to get verified
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Type */}
        <div>
          <Label>Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="drivers_license">Driver's License</SelectItem>
              <SelectItem value="national_id">National ID Card</SelectItem>
              <SelectItem value="other">Other Government ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Front Upload */}
        <div>
          <Label>Front Side</Label>
          <div className="mt-2">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition">
              {frontPreview ? (
                <img src={frontPreview} alt="Front preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload front side</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFrontFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Back Upload */}
        <div>
          <Label>Back Side</Label>
          <div className="mt-2">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition">
              {backPreview ? (
                <img src={backPreview} alt="Back preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload back side</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBackFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!documentType || !frontFile || !backFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4 mr-2" />
              Submit for Verification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
