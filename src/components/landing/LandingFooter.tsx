import { Twitter, Linkedin } from "lucide-react";

export function LandingFooter() {
  const footerLinks = [
    { label: "Features", href: "#services" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "mailto:contact@virtura.ai" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-card/50 border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Logo */}
          <h3 className="text-2xl font-bold bg-gradient-text bg-clip-text text-transparent">
            Virtura AI
          </h3>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Virtura AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
