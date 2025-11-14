import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LifeBuoy, Lightbulb, CheckCircle2 } from "lucide-react";

const ticketSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  issue_type: z.string().min(1, "Please select an issue type"),
  priority: z.string().min(1, "Please select a priority"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

const suggestionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  category: z.string().min(1, "Please select a category"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  use_case: z.string().min(10, "Please describe your use case (at least 10 characters)"),
  priority: z.string().min(1, "Please select an impact level"),
});

type TicketFormData = z.infer<typeof ticketSchema>;
type SuggestionFormData = z.infer<typeof suggestionSchema>;

export function SupportPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [ticketLoading, setTicketLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);

  const ticketForm = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: profile?.display_name || "",
      email: user?.email || "",
      issue_type: "",
      priority: "",
      subject: "",
      description: "",
    },
  });

  const suggestionForm = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      name: profile?.display_name || "",
      email: user?.email || "",
      category: "",
      title: "",
      description: "",
      use_case: "",
      priority: "",
    },
  });

  const onTicketSubmit = async (data: TicketFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a ticket",
        variant: "destructive",
      });
      return;
    }

    setTicketLoading(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        name: data.name,
        email: data.email,
        issue_type: data.issue_type,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
      });

      if (error) throw error;

      setTicketSuccess(true);
      ticketForm.reset();
      toast({
        title: "Ticket Submitted",
        description: "We've received your support ticket and will get back to you soon.",
      });

      setTimeout(() => setTicketSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTicketLoading(false);
    }
  };

  const onSuggestionSubmit = async (data: SuggestionFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a suggestion",
        variant: "destructive",
      });
      return;
    }

    setSuggestionLoading(true);
    try {
      const { error } = await supabase.from("feature_suggestions").insert({
        user_id: user.id,
        name: data.name,
        email: data.email,
        category: data.category,
        title: data.title,
        description: data.description,
        use_case: data.use_case,
        priority: data.priority,
      });

      if (error) throw error;

      setSuggestionSuccess(true);
      suggestionForm.reset();
      toast({
        title: "Suggestion Submitted",
        description: "Thank you for your feedback! We'll review your suggestion.",
      });

      setTimeout(() => setSuggestionSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSuggestionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950/20 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-primary">
            Support Center
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Need help or have ideas? We're here to listen and assist you.
          </p>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Support Ticket Form */}
          <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 border-b border-violet-500/20 pb-4">
              <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400 flex-shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Submit a Ticket</h2>
                <p className="text-xs sm:text-sm text-gray-400">Get help with issues or questions</p>
              </div>
            </div>

            {ticketSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-400 animate-in zoom-in duration-300" />
                <p className="text-lg text-green-400 font-medium">Ticket Submitted Successfully!</p>
                <p className="text-sm text-gray-400">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-name">Name</Label>
                  <Input
                    id="ticket-name"
                    {...ticketForm.register("name")}
                    placeholder="Your name"
                  />
                  {ticketForm.formState.errors.name && (
                    <p className="text-sm text-red-400">{ticketForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-email">Email</Label>
                  <Input
                    id="ticket-email"
                    type="email"
                    {...ticketForm.register("email")}
                    placeholder="your@email.com"
                  />
                  {ticketForm.formState.errors.email && (
                    <p className="text-sm text-red-400">{ticketForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue-type">Issue Type</Label>
                  <Select onValueChange={(value) => ticketForm.setValue("issue_type", value)}>
                    <SelectTrigger id="issue-type" className="bg-black/40 border-violet-500/30">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {ticketForm.formState.errors.issue_type && (
                    <p className="text-sm text-red-400">{ticketForm.formState.errors.issue_type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => ticketForm.setValue("priority", value)}>
                    <SelectTrigger id="priority" className="bg-black/40 border-violet-500/30">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  {ticketForm.formState.errors.priority && (
                    <p className="text-sm text-red-400">{ticketForm.formState.errors.priority.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    {...ticketForm.register("subject")}
                    placeholder="Brief summary of your issue"
                  />
                  {ticketForm.formState.errors.subject && (
                    <p className="text-sm text-red-400">{ticketForm.formState.errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...ticketForm.register("description")}
                    placeholder="Please provide detailed information about your issue..."
                    rows={5}
                    className="bg-black/40 border-violet-500/30"
                  />
                  {ticketForm.formState.errors.description && (
                    <p className="text-sm text-red-400">{ticketForm.formState.errors.description.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={ticketLoading}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                >
                  {ticketLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </form>
            )}
          </Card>

          {/* Feature Suggestion Form */}
          <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-violet-500/20 pb-4">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Suggest a Feature</h2>
                <p className="text-sm text-gray-400">Share your ideas for improvement</p>
              </div>
            </div>

            {suggestionSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-400 animate-in zoom-in duration-300" />
                <p className="text-lg text-green-400 font-medium">Suggestion Submitted!</p>
                <p className="text-sm text-gray-400">Thank you for your feedback.</p>
              </div>
            ) : (
              <form onSubmit={suggestionForm.handleSubmit(onSuggestionSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="suggestion-name">Name</Label>
                  <Input
                    id="suggestion-name"
                    {...suggestionForm.register("name")}
                    placeholder="Your name"
                  />
                  {suggestionForm.formState.errors.name && (
                    <p className="text-sm text-red-400">{suggestionForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestion-email">Email</Label>
                  <Input
                    id="suggestion-email"
                    type="email"
                    {...suggestionForm.register("email")}
                    placeholder="your@email.com"
                  />
                  {suggestionForm.formState.errors.email && (
                    <p className="text-sm text-red-400">{suggestionForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => suggestionForm.setValue("category", value)}>
                    <SelectTrigger id="category" className="bg-black/40 border-violet-500/30">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ui-ux">UI/UX Improvement</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="new-feature">New Feature</SelectItem>
                      <SelectItem value="enhancement">Enhancement</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                  {suggestionForm.formState.errors.category && (
                    <p className="text-sm text-red-400">{suggestionForm.formState.errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Feature Title</Label>
                  <Input
                    id="title"
                    {...suggestionForm.register("title")}
                    placeholder="Brief title for your suggestion"
                  />
                  {suggestionForm.formState.errors.title && (
                    <p className="text-sm text-red-400">{suggestionForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestion-description">Description</Label>
                  <Textarea
                    id="suggestion-description"
                    {...suggestionForm.register("description")}
                    placeholder="Describe your feature suggestion in detail..."
                    rows={4}
                    className="bg-black/40 border-violet-500/30"
                  />
                  {suggestionForm.formState.errors.description && (
                    <p className="text-sm text-red-400">{suggestionForm.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="use-case">Use Case</Label>
                  <Textarea
                    id="use-case"
                    {...suggestionForm.register("use_case")}
                    placeholder="How would this feature help you?"
                    rows={3}
                    className="bg-black/40 border-violet-500/30"
                  />
                  {suggestionForm.formState.errors.use_case && (
                    <p className="text-sm text-red-400">{suggestionForm.formState.errors.use_case.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impact">Impact Level</Label>
                  <Select onValueChange={(value) => suggestionForm.setValue("priority", value)}>
                    <SelectTrigger id="impact" className="bg-black/40 border-violet-500/30">
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nice-to-have">Nice to Have</SelectItem>
                      <SelectItem value="would-help">Would Help</SelectItem>
                      <SelectItem value="very-important">Very Important</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  {suggestionForm.formState.errors.priority && (
                    <p className="text-sm text-red-400">{suggestionForm.formState.errors.priority.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={suggestionLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                >
                  {suggestionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Suggestion"
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
