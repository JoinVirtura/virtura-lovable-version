import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingHero } from "@/components/landing/LandingHero";
import { WhatYouCanCreateSection } from "@/components/landing/WhatYouCanCreateSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ChooseYourPathSection } from "@/components/landing/ChooseYourPathSection";
import { BrandAgencySection } from "@/components/landing/BrandAgencySection";
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
        <HowItWorksSection id="how-it-works" />
        <ChooseYourPathSection id="paths" />
        <BrandAgencySection id="brands" />
        <PricingSection id="pricing" />
        <TestimonialsSection id="testimonials" />
        <FAQSection id="faq" />
        <AboutSection id="about" />
      </main>
      
      <LandingFooter />
    </div>
  );
}
