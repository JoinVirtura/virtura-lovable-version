import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  LifeBuoy, 
  Lightbulb, 
  RefreshCw,
  Mail,
  Clock,
  AlertCircle
} from "lucide-react";

interface SupportTicket {
  id: string;
  user_id: string;
  name: string;
  email: string;
  issue_type: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
}

interface FeatureSuggestion {
  id: string;
  user_id: string;
  name: string;
  email: string;
  category: string;
  title: string;
  description: string;
  use_case: string;
  priority: string;
  status: string;
  votes: number;
  created_at: string;
}

export function AdminSupportReview() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [ticketFilter, setTicketFilter] = useState<string>("all");
  const [suggestionFilter, setSuggestionFilter] = useState<string>("all");

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (ticketFilter !== "all") {
        query = query.eq("status", ticketFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive",
      });
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      let query = supabase
        .from("feature_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (suggestionFilter !== "all") {
        query = query.eq("status", suggestionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch feature suggestions",
        variant: "destructive",
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [ticketFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, [suggestionFilter]);

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus}`,
      });
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const updateSuggestionStatus = async (suggestionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("feature_suggestions")
        .update({ status: newStatus })
        .eq("id", suggestionId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Suggestion status changed to ${newStatus}`,
      });
      fetchSuggestions();
    } catch (error) {
      console.error("Error updating suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to update suggestion status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "pending":
      case "submitted":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Pending</Badge>;
      case "in_progress":
      case "reviewing":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">In Progress</Badge>;
      case "resolved":
      case "implemented":
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Resolved</Badge>;
      case "closed":
      case "declined":
        return <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">Closed</Badge>;
      default:
        return <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">{status || "New"}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Low</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4" />
            Tickets ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions ({suggestions.length})
          </TabsTrigger>
        </TabsList>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select value={ticketFilter} onValueChange={setTicketFilter}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={fetchTickets}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loadingTickets ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LifeBuoy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No support tickets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="p-4 bg-white/5 border-white/10">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {ticket.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {ticket.issue_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select
                        value={ticket.status || "pending"}
                        onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Feature Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select value={suggestionFilter} onValueChange={setSuggestionFilter}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suggestions</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={fetchSuggestions}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No feature suggestions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-4 bg-white/5 border-white/10">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{suggestion.title}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(suggestion.status)}
                          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                            {suggestion.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
                      <p className="text-xs text-muted-foreground italic">Use case: {suggestion.use_case}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {suggestion.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(suggestion.created_at).toLocaleDateString()}
                        </span>
                        <span>Votes: {suggestion.votes}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select
                        value={suggestion.status || "submitted"}
                        onValueChange={(value) => updateSuggestionStatus(suggestion.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="implemented">Implemented</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
