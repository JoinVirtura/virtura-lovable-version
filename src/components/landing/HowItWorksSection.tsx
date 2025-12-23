import { User, Wand2, Share2 } from "lucide-react";

interface HowItWorksSectionProps {
  id?: string;
}

export function HowItWorksSection({ id }: HowItWorksSectionProps) {
  const steps = [
    {
      number: "01",
      icon: User,
      title: "Create or Select Your Identity",
      description: "Upload references or choose from style presets. Build avatars, personas, or brand identities with ease.",
    },
    {
      number: "02",
      icon: Wand2,
      title: "Generate Stunning Content",
      description: "Produce lifestyle visuals, marketing concepts, product shots, branded images, and more — instantly.",
    },
    {
      number: "03",
      icon: Share2,
      title: "Publish & Share",
      description: "Download in HD or publish directly to your Virtura profile for fans and consumers to explore.",
    },
  ];

  return (
    <section id={id} className="py-32 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get Started in <span className="bg-gradient-text bg-clip-text text-transparent">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to professional content in minutes
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-16 last:mb-0"
            >
              {/* Step Number */}
              <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-violet-glow relative">
                <span className="text-4xl md:text-5xl font-bold text-white">{step.number}</span>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-primary to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-card border border-border flex items-center justify-center">
                    <step.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold">{step.title}</h3>
                </div>
                <p className="text-base md:text-lg text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
