import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const brandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  tone_of_voice: z.string().optional(),
  target_audience: z.string().optional(),
  industry: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  heading_font: z.string().min(1, 'Heading font is required'),
  body_font: z.string().min(1, 'Body font is required'),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BrandForm({ onSuccess, onCancel }: BrandFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      primary_color: '#000000',
      secondary_color: '#666666',
      accent_color: '#FF0000',
      heading_font: 'Inter',
      body_font: 'Inter',
    },
  });

  const logoUrl = watch('logo_url');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('virtura-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('virtura-media')
        .getPublicUrl(filePath);

      setValue('logo_url', publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('brands').insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        logo_url: data.logo_url || null,
        brand_colors: {
          primary: data.primary_color,
          secondary: data.secondary_color,
          accent: data.accent_color,
        },
        brand_fonts: {
          heading: data.heading_font,
          body: data.body_font,
        },
        tone_of_voice: data.tone_of_voice || null,
        target_audience: data.target_audience || null,
        industry: data.industry || null,
        social_handles: {
          instagram: data.instagram || null,
          tiktok: data.tiktok || null,
          twitter: data.twitter || null,
          linkedin: data.linkedin || null,
        },
        website_url: data.website_url || null,
        is_active: true,
      });

      if (error) throw error;

      toast.success('Brand created successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Brand creation error:', error);
      toast.error('Failed to create brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Tell us about your brand</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Brand Name *</Label>
            <Input id="name" {...register('name')} placeholder="My Awesome Brand" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="What makes your brand unique?" rows={3} />
          </div>

          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-4 mt-2">
              {logoUrl && (
                <img src={logoUrl} alt="Brand logo" className="w-16 h-16 object-cover rounded border" />
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button type="button" variant="outline" size="sm" asChild disabled={uploadingLogo}>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>Define your brand's color palette</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primary_color">Primary</Label>
              <div className="flex gap-2 mt-2">
                <Input type="color" id="primary_color" {...register('primary_color')} className="w-16 h-10" />
                <Input {...register('primary_color')} placeholder="#000000" />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Secondary</Label>
              <div className="flex gap-2 mt-2">
                <Input type="color" id="secondary_color" {...register('secondary_color')} className="w-16 h-10" />
                <Input {...register('secondary_color')} placeholder="#666666" />
              </div>
            </div>
            <div>
              <Label htmlFor="accent_color">Accent</Label>
              <div className="flex gap-2 mt-2">
                <Input type="color" id="accent_color" {...register('accent_color')} className="w-16 h-10" />
                <Input {...register('accent_color')} placeholder="#FF0000" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Fonts</CardTitle>
          <CardDescription>Choose your typography</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heading_font">Heading Font *</Label>
              <Input id="heading_font" {...register('heading_font')} placeholder="Inter" />
            </div>
            <div>
              <Label htmlFor="body_font">Body Font *</Label>
              <Input id="body_font" {...register('body_font')} placeholder="Inter" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Voice & Audience</CardTitle>
          <CardDescription>Define your brand's personality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tone_of_voice">Tone of Voice</Label>
            <Textarea id="tone_of_voice" {...register('tone_of_voice')} placeholder="Professional, friendly, conversational..." rows={2} />
          </div>
          <div>
            <Label htmlFor="target_audience">Target Audience</Label>
            <Textarea id="target_audience" {...register('target_audience')} placeholder="Young professionals, age 25-35..." rows={2} />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" {...register('industry')} placeholder="Technology, Fashion, Healthcare..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media & Web</CardTitle>
          <CardDescription>Connect your online presence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website_url">Website</Label>
            <Input id="website_url" {...register('website_url')} placeholder="https://example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" {...register('instagram')} placeholder="@username" />
            </div>
            <div>
              <Label htmlFor="tiktok">TikTok</Label>
              <Input id="tiktok" {...register('tiktok')} placeholder="@username" />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input id="twitter" {...register('twitter')} placeholder="@username" />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" {...register('linkedin')} placeholder="company-name" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Brand'}
        </Button>
      </div>
    </form>
  );
}
