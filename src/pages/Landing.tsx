import { LandingNavigation } from "@/components/landing/LandingNavigation";
import { LandingHero } from "@/components/landing/LandingHero";
import { PublicGallerySection } from "@/components/landing/PublicGallerySection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      <main>
        <LandingHero id="hero" />
        <PublicGallerySection id="gallery" />
        <BenefitsSection id="services" />
        <HowItWorksSection id="how-it-works" />
        <PricingSection id="pricing" />
        <TestimonialsSection id="testimonials" />
        <FAQSection id="faq" />
        <CTASection id="cta" />
      </main>
      
      <LandingFooter />
    </div>
  );
}
