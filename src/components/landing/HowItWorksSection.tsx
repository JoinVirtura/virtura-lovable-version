import { FileText, Wand2, Download } from "lucide-react";

interface HowItWorksSectionProps {
  id?: string;
}

export function HowItWorksSection({ id }: HowItWorksSectionProps) {
  const steps = [
    {
      number: "01",
      icon: FileText,
      title: "Describe Your Vision",
      description: "Type what you want to create or upload reference images. Our AI understands natural language.",
    },
    {
      number: "02",
      icon: Wand2,
      title: "AI Creates Magic",
      description: "Our advanced AI generates multiple high-quality options in seconds. Watch the magic happen.",
    },
    {
      number: "03",
      icon: Download,
      title: "Download & Share",
      description: "Choose your favorite and export in any format. Ready to share with the world.",
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
              className="relative flex flex-col md:flex-row items-center gap-8 mb-16 last:mb-0"
            >
              {/* Step Number */}
              <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-violet-glow relative">
                <span className="text-5xl font-bold text-white">{step.number}</span>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-primary to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                </div>
                <p className="text-lg text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
