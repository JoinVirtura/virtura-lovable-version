import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingHero } from "@/components/landing/LandingHero";
import { WhatYouCanCreateSection } from "@/components/landing/WhatYouCanCreateSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CTASection } from "@/components/landing/CTASection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />

      <main>
        <LandingHero id="hero" />
        <WhatYouCanCreateSection id="create" />
        <BenefitsSection id="services" />
        <CTASection id="join" />
        <PricingSection id="pricing" />
        <TestimonialsSection id="testimonials" />
        <FAQSection id="faq" />
        <AboutSection id="about" />
      </main>

      <LandingFooter />
    </div>
  );
}
