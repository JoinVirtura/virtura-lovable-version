import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMarketplaceCampaigns } from '@/hooks/useMarketplaceCampaigns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const formSchema = z.object({
  brand_id: z.string().min(1, 'Brand is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
  category: z.string().min(1, 'Category is required'),
  budget_cents: z.number().min(10000, 'Minimum budget is $100'),
  video_count: z.number().min(0).default(0),
  image_count: z.number().min(0).default(0),
  caption_count: z.number().min(0).default(0),
  requirements: z.string().max(500).optional(),
  deadline: z.string().optional(),
  visibility: z.enum(['public', 'private', 'invited']).default('public'),
});

interface BrandCampaignCreatorProps {
  onSuccess?: () => void;
}

export function BrandCampaignCreator({ onSuccess }: BrandCampaignCreatorProps) {
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCampaign } = useMarketplaceCampaigns();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand_id: '',
      title: '',
      description: '',
      category: '',
      budget_cents: 50000,
      video_count: 1,
      image_count: 0,
      caption_count: 0,
      requirements: '',
      deadline: '',
      visibility: 'public',
    },
  });

  useState(() => {
    const fetchBrands = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('brands')
        .select('id, name')
        .eq('user_id', user.id);
      setBrands(data || []);
    };
    fetchBrands();
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const deliverables: any = {};
      if (values.video_count > 0) deliverables.videos = values.video_count;
      if (values.image_count > 0) deliverables.images = values.image_count;
      if (values.caption_count > 0) deliverables.captions = values.caption_count;

      const requirements = values.requirements
        ? { description: values.requirements }
        : null;

      await createCampaign({
        brand_id: values.brand_id,
        title: values.title,
        description: values.description,
        category: values.category,
        budget_cents: values.budget_cents,
        deliverables,
        requirements,
        deadline: values.deadline || null,
        visibility: values.visibility,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/marketplace')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Marketplace
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Campaign</CardTitle>
          <CardDescription>Step {step} of 4</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Holiday Video Campaign" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your campaign goals and what you're looking for..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="animation">Animation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Budget & Deliverables</h3>

                  <FormField
                    control={form.control}
                    name="budget_cents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={100}
                            step={50}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) * 100)}
                            value={field.value / 100}
                          />
                        </FormControl>
                        <FormDescription>Minimum $100</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="video_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Videos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Images</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="caption_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Captions</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Requirements</h3>

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any specific requirements or guidelines..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Deadline & Visibility</h3>

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="invited">Invited Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-between">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}

                {step < 4 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={form.formState.isSubmitting} className="ml-auto">
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Campaign
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
