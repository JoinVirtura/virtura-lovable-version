import { useState, useEffect } from "react";
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
import { motion } from "framer-motion";
import {
  Loader2,
  LifeBuoy,
  Lightbulb,
  CheckCircle2,
  Headphones,
  BookOpen,
  MessageCircle,
  Clock,
  ThumbsUp,
  Mail,
  ExternalLink,
  Video,
  Users,
  Shield,
  ImageIcon
} from "lucide-react";

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

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
}

const quickActions = [
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Browse FAQs and tutorials",
    color: "from-blue-500 to-cyan-500",
    link: "tutorial"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our team",
    color: "from-green-500 to-emerald-500",
    badge: "Coming Soon"
  },
  {
    icon: Clock,
    title: "Track Ticket",
    description: "Check your ticket status",
    color: "from-orange-500 to-amber-500",
    action: "scroll-to-tickets"
  },
  {
    icon: ImageIcon,
    title: "Content Review",
    description: "Report image/video issues for credit",
    color: "from-rose-500 to-red-500",
    action: "scroll-to-tickets"
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "support@virturaai.com",
    color: "from-purple-500 to-pink-500",
    link: "mailto:support@virturaai.com"
  }
];

const resources = [
  {
    icon: Users,
    title: "Skool Community",
    description: "Join our creator community",
    link: "https://www.skool.com/virtura"
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Detailed guides & API docs",
    link: "/tutorial"
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Step-by-step walkthroughs",
    link: "/tutorial"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "support@virturaai.com",
    link: "mailto:support@virturaai.com"
  }
];

export function SupportPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [ticketLoading, setTicketLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

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

  // Fetch recent tickets
  useEffect(() => {
    async function fetchTickets() {
      if (!user) {
        setLoadingTickets(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("support_tickets")
          .select("id, subject, status, priority, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentTickets(data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoadingTickets(false);
      }
    }

    fetchTickets();
  }, [user, ticketSuccess]);

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "in_progress":
      case "in progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "closed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-violet-500/20 text-violet-400 border-violet-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-violet-950/10 to-background p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-pink-900/20 border border-white/10 backdrop-blur-xl p-6 sm:p-8 md:p-12"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative p-5 sm:p-6 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full border border-white/20">
                <Headphones className="w-10 h-10 sm:w-14 sm:h-14 text-violet-300" />
              </div>
            </motion.div>

            {/* Title with shimmer effect */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold">
                <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Support Center
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                We're here to help you succeed. Get answers, submit tickets, or share your ideas.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-muted-foreground">Avg Response:</span>
                <span className="text-sm font-semibold text-foreground">~24hrs</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <ThumbsUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-muted-foreground">Satisfaction:</span>
                <span className="text-sm font-semibold text-foreground">98%</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Shield className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-muted-foreground">Secure</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {quickActions.map((action, index) => {
            const handleClick = () => {
              if (action.link) {
                if (action.link.startsWith("mailto:")) {
                  window.location.href = action.link;
                } else if (action.link === "tutorial") {
                  // Navigate to tutorial - handled by parent
                  window.location.href = "/dashboard?view=guide";
                }
              } else if (action.action === "scroll-to-tickets") {
                document.getElementById("tickets-section")?.scrollIntoView({ behavior: "smooth" });
              }
            };

            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={!action.badge ? handleClick : undefined}
                className={`relative group ${!action.badge ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl"
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                />
                <Card className="relative h-full p-4 sm:p-5 bg-card/50 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} opacity-80`}>
                      <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                    {action.badge && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">
                        {action.badge}
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Tickets Section */}
        {user && (
          <motion.div
            id="tickets-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-card/50 backdrop-blur-xl border-white/10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">Your Recent Tickets</h2>
                    <p className="text-sm text-muted-foreground">Track your support requests</p>
                  </div>
                </div>
              </div>

              {loadingTickets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LifeBuoy className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No tickets yet. Submit one below if you need help!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ticket.created_at).toLocaleDateString()} • 
                          <span className={`ml-1 ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority} priority
                          </span>
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                        {ticket.status?.replace("_", " ") || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Support Ticket Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-card/50 backdrop-blur-xl border-white/10 p-4 sm:p-6 space-y-4 sm:space-y-6 h-full">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl">
                  <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Submit a Ticket</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get help with issues or questions</p>
                </div>
              </div>

              {ticketSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-3 sm:space-y-4">
                  <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 animate-in zoom-in duration-300" />
                  <p className="text-base sm:text-lg text-green-400 font-medium">Ticket Submitted Successfully!</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="ticket-name" className="text-sm sm:text-base">Name</Label>
                    <Input
                      id="ticket-name"
                      {...ticketForm.register("name")}
                      placeholder="Your name"
                      className="h-10 sm:h-11 bg-white/5 border-white/10"
                    />
                    {ticketForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{ticketForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-email">Email</Label>
                    <Input
                      id="ticket-email"
                      type="email"
                      {...ticketForm.register("email")}
                      placeholder="your@email.com"
                      className="bg-white/5 border-white/10"
                    />
                    {ticketForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{ticketForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue-type">Issue Type</Label>
                    <Select onValueChange={(value) => ticketForm.setValue("issue_type", value)}>
                      <SelectTrigger id="issue-type" className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="content_experience">Content Experience (Image/Video Quality)</SelectItem>
                        <SelectItem value="account">Account Issue</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="credit_request">Credit Request (Poor Generation)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {ticketForm.formState.errors.issue_type && (
                      <p className="text-sm text-destructive">{ticketForm.formState.errors.issue_type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={(value) => ticketForm.setValue("priority", value)}>
                      <SelectTrigger id="priority" className="bg-white/5 border-white/10">
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
                      <p className="text-sm text-destructive">{ticketForm.formState.errors.priority.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      {...ticketForm.register("subject")}
                      placeholder="Brief summary of your issue"
                      className="bg-white/5 border-white/10"
                    />
                    {ticketForm.formState.errors.subject && (
                      <p className="text-sm text-destructive">{ticketForm.formState.errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...ticketForm.register("description")}
                      placeholder="Please provide detailed information about your issue..."
                      rows={5}
                      className="bg-white/5 border-white/10"
                    />
                    {ticketForm.formState.errors.description && (
                      <p className="text-sm text-destructive">{ticketForm.formState.errors.description.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={ticketLoading}
                    className="w-full h-11 sm:h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
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
          </motion.div>

          {/* Feature Suggestion Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-card/50 backdrop-blur-xl border-white/10 p-4 sm:p-6 space-y-4 sm:space-y-6 h-full">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Suggest a Feature</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Share your ideas for improvement</p>
                </div>
              </div>

              {suggestionSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-3 sm:space-y-4">
                  <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 animate-in zoom-in duration-300" />
                  <p className="text-base sm:text-lg text-green-400 font-medium">Suggestion Submitted!</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Thank you for your feedback.</p>
                </div>
              ) : (
                <form onSubmit={suggestionForm.handleSubmit(onSuggestionSubmit)} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="suggestion-name">Name</Label>
                    <Input
                      id="suggestion-name"
                      {...suggestionForm.register("name")}
                      placeholder="Your name"
                      className="bg-white/5 border-white/10"
                    />
                    {suggestionForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{suggestionForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suggestion-email">Email</Label>
                    <Input
                      id="suggestion-email"
                      type="email"
                      {...suggestionForm.register("email")}
                      placeholder="your@email.com"
                      className="bg-white/5 border-white/10"
                    />
                    {suggestionForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{suggestionForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => suggestionForm.setValue("category", value)}>
                      <SelectTrigger id="category" className="bg-white/5 border-white/10">
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
                      <p className="text-sm text-destructive">{suggestionForm.formState.errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Feature Title</Label>
                    <Input
                      id="title"
                      {...suggestionForm.register("title")}
                      placeholder="Brief title for your suggestion"
                      className="bg-white/5 border-white/10"
                    />
                    {suggestionForm.formState.errors.title && (
                      <p className="text-sm text-destructive">{suggestionForm.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suggestion-description">Description</Label>
                    <Textarea
                      id="suggestion-description"
                      {...suggestionForm.register("description")}
                      placeholder="Describe your feature suggestion in detail..."
                      rows={4}
                      className="bg-white/5 border-white/10"
                    />
                    {suggestionForm.formState.errors.description && (
                      <p className="text-sm text-destructive">{suggestionForm.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="use-case">Use Case</Label>
                    <Textarea
                      id="use-case"
                      {...suggestionForm.register("use_case")}
                      placeholder="How would this feature help you?"
                      rows={3}
                      className="bg-white/5 border-white/10"
                    />
                    {suggestionForm.formState.errors.use_case && (
                      <p className="text-sm text-destructive">{suggestionForm.formState.errors.use_case.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impact">Impact Level</Label>
                    <Select onValueChange={(value) => suggestionForm.setValue("priority", value)}>
                      <SelectTrigger id="impact" className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select impact level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nice-to-have">Nice to Have</SelectItem>
                        <SelectItem value="would-help">Would Help</SelectItem>
                        <SelectItem value="important">Important</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    {suggestionForm.formState.errors.priority && (
                      <p className="text-sm text-destructive">{suggestionForm.formState.errors.priority.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={suggestionLoading}
                    className="w-full h-11 sm:h-10 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
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
          </motion.div>
        </div>

        {/* Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Resources & Community</h2>
                <p className="text-sm text-muted-foreground">Helpful links and community support</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {resources.map((resource, index) => (
                <motion.a
                  key={resource.title}
                  href={resource.link}
                  target={resource.link.startsWith("http") ? "_blank" : undefined}
                  rel={resource.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="group flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all"
                >
                  <resource.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{resource.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{resource.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
