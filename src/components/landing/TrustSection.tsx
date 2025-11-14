interface TrustSectionProps {
  id?: string;
}

export function TrustSection({ id }: TrustSectionProps) {
  const companies = [
    "Company A",
    "Company B",
    "Company C",
    "Company D",
    "Company E",
    "Company F",
    "Company G",
    "Company H",
    "Company I",
  ];

  return (
    <section id={id} className="py-20 bg-card/30">
      <div className="container mx-auto px-6">
        <p className="text-center text-muted-foreground mb-12">
          Trusted by employees at:
        </p>
        
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-8 items-center">
          {companies.map((company, index) => (
            <div 
              key={index}
              className="flex items-center justify-center p-4 rounded-lg hover:bg-card/50 transition-all duration-300 group"
            >
              <div className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors text-center font-semibold">
                {company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
