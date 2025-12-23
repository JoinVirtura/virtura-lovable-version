import { Sparkles, Eye, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ChooseYourPathSectionProps {
  id?: string;
}

export function ChooseYourPathSection({ id }: ChooseYourPathSectionProps) {
  const navigate = useNavigate();

  const paths = [
    {
      icon: Sparkles,
      title: "I'm a Creator",
      description: "Generate high-quality content and scale your digital presence.",
      cta: "Start Free Trial",
      action: () => navigate("/auth"),
      variant: "default" as const,
    },
    {
      icon: Eye,
      title: "I'm a Consumer",
      description: "Explore creator profiles, view content, and discover evolving identities.",
      cta: "Browse Profiles",
      action: () => navigate("/explore"),
      variant: "outline" as const,
    },
    {
      icon: Building2,
      title: "I'm a Brand or Agency",
      description: "Produce campaigns, visuals, product concepts, and branded content at scale — without traditional production costs.",
      cta: "Contact Us",
      action: () => window.location.href = "mailto:contact@virtura.ai",
      variant: "outline" as const,
    },
  ];

  return (
    <section id={id} className="py-32 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            🔥 Choose Your <span className="bg-gradient-text bg-clip-text text-transparent">Path</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {paths.map((path, index) => (
            <Card 
              key={index}
              className="group hover:shadow-violet-glow/50 transition-all duration-300 hover:-translate-y-2 text-center h-full"
            >
              <CardContent className="p-8 flex flex-col items-center h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-6 group-hover:shadow-violet-glow transition-all flex-shrink-0">
                  <path.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{path.title}</h3>
                <p className="text-muted-foreground mb-8 flex-grow">{path.description}</p>
                <Button 
                  onClick={path.action}
                  variant={path.variant}
                  className={`w-full mt-auto ${path.variant === "default" ? "bg-gradient-primary hover:shadow-violet-glow" : ""}`}
                >
                  {path.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
