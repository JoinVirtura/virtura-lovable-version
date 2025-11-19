import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Briefcase, Palette, Plus, X } from 'lucide-react';
import { useMarketplaceAccess } from '@/hooks/useMarketplaceAccess';

const formSchema = z.object({
  role: z.enum(['creator', 'brand']),
  pitch: z.string().min(50, 'Please provide at least 50 characters'),
  experience: z.string().min(20, 'Please provide at least 20 characters'),
  portfolio_links: z.array(z.string().url('Must be a valid URL')).optional(),
});

export function MarketplaceAccessForm() {
  const { applyForAccess } = useMarketplaceAccess();
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'creator',
      pitch: '',
      experience: '',
      portfolio_links: [],
    },
  });

  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const updatePortfolioLink = (index: number, value: string) => {
    const updated = [...portfolioLinks];
    updated[index] = value;
    setPortfolioLinks(updated);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const validLinks = portfolioLinks.filter(link => link.trim() !== '');
      await applyForAccess({
        role: values.role,
        pitch: values.pitch,
        experience: values.experience,
        portfolio_links: validLinks.length > 0 ? validLinks : undefined,
      });
      form.reset();
      setPortfolioLinks(['']);
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
          Tell us about yourself and why you want to join the marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I want to join as a</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <label
                        htmlFor="creator"
                        className="flex flex-col items-center gap-3 rounded-lg border-2 border-border p-4 cursor-pointer hover:border-primary transition-colors"
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
                        className="flex flex-col items-center gap-3 rounded-lg border-2 border-border p-4 cursor-pointer hover:border-primary transition-colors"
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

            <FormField
              control={form.control}
              name="pitch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Pitch</FormLabel>
                  <FormDescription>
                    Why do you want to join the marketplace? What makes you a great fit?
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us your story..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevant Experience</FormLabel>
                  <FormDescription>
                    Share your background and expertise
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your experience..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Portfolio Links (Optional)</FormLabel>
              <FormDescription>
                Add links to your work, social profiles, or website
              </FormDescription>
              {portfolioLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={link}
                    onChange={(e) => updatePortfolioLink(index, e.target.value)}
                  />
                  {portfolioLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePortfolioLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPortfolioLink}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Link
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
