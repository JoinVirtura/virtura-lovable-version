import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CTASectionProps {
  id?: string;
}

export function CTASection({ id }: CTASectionProps) {
  const navigate = useNavigate();

  return (
    <section id={id} className="py-32 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-blue/20 to-primary-magenta/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-magenta/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Transform Your <span className="bg-gradient-text bg-clip-text text-transparent">Content Creation</span>?
          </h2>

          <p className="text-2xl text-muted-foreground mb-8">
            Join thousands of creators using AI to bring their visions to life
          </p>

          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-gradient-primary hover:shadow-violet-glow transition-all text-xl px-12 py-8 h-auto group"
          >
            Join Now
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
