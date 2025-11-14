import { CompanyLogo } from "./CompanyLogo";

interface TrustSectionProps {
  id?: string;
}

export function TrustSection({ id }: TrustSectionProps) {
  const companies: Array<'stripe' | 'slack' | 'notion' | 'figma' | 'linear' | 'vercel' | 'supabase' | 'openai' | 'anthropic'> = [
    "stripe",
    "slack",
    "notion",
    "figma",
    "linear",
    "vercel",
    "supabase",
    "openai",
    "anthropic",
  ];

  return (
    <section id={id} className="py-24 bg-gradient-to-b from-background via-card/10 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-primary-blue/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <p className="text-center text-muted-foreground mb-16 text-lg">
          Trusted by employees at leading companies
        </p>
        
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {companies.map((company, index) => (
            <CompanyLogo key={company} type={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
