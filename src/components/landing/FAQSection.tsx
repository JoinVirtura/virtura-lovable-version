import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQSectionProps {
  id?: string;
}

export function FAQSection({ id }: FAQSectionProps) {
  const faqs = [
    {
      question: "How does the free trial work?",
      answer: "Sign up and get 7 days of full access to all Pro features. No credit card required. After the trial, choose a plan that fits your needs or continue with our free tier.",
    },
    {
      question: "What happens after I use my monthly credits?",
      answer: "You can upgrade to a higher tier anytime, or purchase additional credits as needed. Your existing projects and content are never affected.",
    },
    {
      question: "Can I cancel or change my plan anytime?",
      answer: "Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately, and we prorate any billing adjustments.",
    },
    {
      question: "Do I own the content I create?",
      answer: "Absolutely! You own all rights to the content you create with Virtura AI. Use it commercially, share it, or modify it however you like.",
    },
    {
      question: "What formats can I export?",
      answer: "Export in all major formats including PNG, JPG, MP4, GIF, and more. Resolution depends on your plan, ranging from 1080p to 8K.",
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes! We offer a 30-day money-back guarantee. If you're not satisfied with Virtura AI, contact us for a full refund, no questions asked.",
    },
  ];

  return (
    <section id={id} className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="bg-gradient-text bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Virtura AI
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card/30 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
