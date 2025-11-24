import { MessageCircle, Mail, Book, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export default function Support() {
  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      action: "Send Email",
    },
    {
      icon: Book,
      title: "Documentation",
      description: "Browse our comprehensive guides and tutorials",
      action: "View Docs",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            How can we help?
          </h1>
          <p className="text-muted-foreground text-lg">
            Get the support you need to create amazing content
          </p>
        </div>

        {/* Search */}
        <Card className="p-6 backdrop-blur-3xl bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 border border-white/10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                className="pl-10 bg-background/50 border-white/10"
              />
            </div>
            <Button variant="default">Search</Button>
          </div>
        </Card>

        {/* Support Options */}
        <div className="grid md:grid-cols-3 gap-6">
          {supportOptions.map((option) => (
            <Card
              key={option.title}
              className="p-6 backdrop-blur-3xl bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 border border-white/10 hover:border-violet-500/50 transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <option.icon className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  {option.action}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="p-6 backdrop-blur-3xl bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I schedule posts?",
                a: "Navigate to the Scheduled page from the sidebar and click 'Schedule Post' to create time-based content.",
              },
              {
                q: "How do I become a creator?",
                a: "Go to Creator Dashboard and complete the Stripe Connect onboarding to start earning.",
              },
              {
                q: "How do I get verified?",
                a: "Visit the Verification page and submit your ID and profile information for review.",
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-white/10 pb-4 last:border-0">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
