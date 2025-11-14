interface CompanyLogoProps {
  type: 'stripe' | 'slack' | 'notion' | 'figma' | 'linear' | 'vercel' | 'supabase' | 'openai' | 'anthropic';
  className?: string;
}

export function CompanyLogo({ type, className = "" }: CompanyLogoProps) {
  const logos = {
    stripe: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      name: "Stripe"
    },
    slack: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M8 4v6M8 14v6M16 4v6M16 14v6M4 8h6M14 8h6M4 16h6M14 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      name: "Slack"
    },
    notion: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M6 4l12 3v13l-12-3V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
      name: "Notion"
    },
    figma: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
          <circle cx="7" cy="7" r="2" fill="currentColor"/>
          <circle cx="17" cy="7" r="2" fill="currentColor"/>
          <circle cx="7" cy="17" r="2" fill="currentColor"/>
          <circle cx="17" cy="17" r="2" fill="currentColor"/>
        </svg>
      ),
      name: "Figma"
    },
    linear: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M4 20l16-16M4 12l8-8M12 20l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      name: "Linear"
    },
    vercel: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M12 4l8 14H4l8-14z" fill="currentColor"/>
        </svg>
      ),
      name: "Vercel"
    },
    supabase: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      name: "Supabase"
    },
    openai: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="4" fill="currentColor"/>
        </svg>
      ),
      name: "OpenAI"
    },
    anthropic: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M6 20l6-16 6 16M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      name: "Anthropic"
    }
  };

  const logo = logos[type];

  return (
    <div className={`flex flex-col items-center gap-3 group ${className}`}>
      <div className="w-16 h-16 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground/40 group-hover:text-primary group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-violet-glow/30">
        {logo.icon}
      </div>
      <span className="text-sm font-semibold text-muted-foreground/60 group-hover:text-foreground transition-colors duration-500">
        {logo.name}
      </span>
    </div>
  );
}
