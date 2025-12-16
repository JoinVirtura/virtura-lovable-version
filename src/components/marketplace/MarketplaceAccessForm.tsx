import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Palette } from 'lucide-react';
import { useMarketplaceAccess } from '@/hooks/useMarketplaceAccess';

// Creator-specific schema
const creatorSchema = z.object({
  role: z.literal('creator'),
  content_type: z.string().min(5, 'Please describe your content specialty'),
  industries: z.string().min(5, 'Please list industries or niches you create for'),
  turnaround_time: z.string().min(1, 'Please select your typical turnaround time'),
  collaboration_pitch: z.string().min(30, 'Please provide at least 30 characters'),
  main_profile_link: z.string().url('Please provide a valid URL to your Instagram or TikTok'),
});

// Brand-specific schema
const brandSchema = z.object({
  role: z.literal('brand'),
  website_url: z.string().url('Please provide a valid website URL'),
  campaign_type: z.string().min(5, 'Please describe your campaign type'),
  creator_type: z.string().min(5, 'Please describe what type of creators you need'),
  budget_range: z.string().min(1, 'Please select your budget range'),
  deliverables: z.string().min(10, 'Please describe the deliverables you need'),
});

// Combined schema with discriminated union
const formSchema = z.discriminatedUnion('role', [creatorSchema, brandSchema]);

type FormValues = z.infer<typeof formSchema>;

interface MarketplaceAccessFormProps {
  onRoleSelect?: (role: 'creator' | 'brand' | null) => void;
  isCreatorVerified?: boolean;
}

export function MarketplaceAccessForm({ onRoleSelect, isCreatorVerified }: MarketplaceAccessFormProps) {
  const { applyForAccess } = useMarketplaceAccess();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'creator' | 'brand'>('brand');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'brand',
      website_url: '',
      campaign_type: '',
      creator_type: '',
      budget_range: '',
      deliverables: '',
    } as FormValues,
  });

  const handleRoleChange = (newRole: 'creator' | 'brand') => {
    setSelectedRole(newRole);
    onRoleSelect?.(newRole);
    
    // If creator is selected and not verified, don't reset form - verification gate will show
    if (newRole === 'creator' && !isCreatorVerified) {
      return;
    }
    
    if (newRole === 'creator') {
      form.reset({
        role: 'creator',
        content_type: '',
        industries: '',
        turnaround_time: '',
        collaboration_pitch: '',
        main_profile_link: '',
      });
    } else {
      form.reset({
        role: 'brand',
        website_url: '',
        campaign_type: '',
        creator_type: '',
        budget_range: '',
        deliverables: '',
      });
    }
  };

  // When creator becomes verified, reset form with creator defaults
  useEffect(() => {
    if (selectedRole === 'creator' && isCreatorVerified) {
      form.reset({
        role: 'creator',
        content_type: '',
        industries: '',
        turnaround_time: '',
        collaboration_pitch: '',
        main_profile_link: '',
      });
    }
  }, [isCreatorVerified, selectedRole, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Serialize all form data as JSON in the pitch field
      const applicationData = JSON.stringify(values);
      
      await applyForAccess({
        role: values.role,
        pitch: applicationData,
        experience: values.role === 'creator' 
          ? `Content: ${(values as z.infer<typeof creatorSchema>).content_type}` 
          : `Campaign: ${(values as z.infer<typeof brandSchema>).campaign_type}`,
        portfolio_links: values.role === 'creator' 
          ? [(values as z.infer<typeof creatorSchema>).main_profile_link]
          : [(values as z.infer<typeof brandSchema>).website_url],
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Marketplace Access</CardTitle>
        <CardDescription>
          Tell us about yourself and what you're looking for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I want to join as a</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleRoleChange(value as 'creator' | 'brand');
                      }}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <label
                        htmlFor="creator"
                        className={`flex flex-col items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                          selectedRole === 'creator' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        <RadioGroupItem value="creator" id="creator" className="sr-only" />
                        <Palette className="h-8 w-8 text-primary" />
                        <div className="text-center">
                          <div className="font-semibold">Creator</div>
                          <div className="text-xs text-muted-foreground">
                            Work on brand campaigns
                          </div>
                        </div>
                      </label>
                      <label
                        htmlFor="brand"
                        className={`flex flex-col items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                          selectedRole === 'brand' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        <RadioGroupItem value="brand" id="brand" className="sr-only" />
                        <Briefcase className="h-8 w-8 text-primary" />
                        <div className="text-center">
                          <div className="font-semibold">Brand</div>
                          <div className="text-xs text-muted-foreground">
                            Post campaigns for creators
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Creator-specific fields */}
            {selectedRole === 'creator' && (
              <>
                <FormField
                  control={form.control}
                  name="content_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What type of content do you specialize in?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., UGC videos, product photography, lifestyle content, tutorials..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What industries or niches do you create for?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Beauty, Fashion, Tech, Food & Beverage, Fitness..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="turnaround_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your typical turnaround time?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select turnaround time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="24-48-hours">24-48 hours</SelectItem>
                          <SelectItem value="3-5-days">3-5 days</SelectItem>
                          <SelectItem value="1-week">1 week</SelectItem>
                          <SelectItem value="2-weeks">2 weeks</SelectItem>
                          <SelectItem value="flexible">Flexible / Project dependent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collaboration_pitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What makes you a strong fit for brand collaborations?</FormLabel>
                      <FormDescription>
                        Highlight your strengths, past work, and what sets you apart
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Share why brands should work with you..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="main_profile_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to your main profile (Instagram or TikTok)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/yourusername"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Brand-specific fields */}
            {selectedRole === 'brand' && (
              <>
                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Website URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourbrand.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What type of campaign are you launching?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Product launch, brand awareness, seasonal promotion..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creator_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What type of creators are you looking for?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Lifestyle influencers, UGC specialists, product reviewers..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your budget range?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under-500">Under $500</SelectItem>
                          <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                          <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                          <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                          <SelectItem value="10000-plus">$10,000+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliverables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What deliverables do you need?</FormLabel>
                      <FormDescription>
                        Describe the content types you're looking for
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 3 UGC videos (15-30 sec), 5 product photos, Instagram Reels..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
