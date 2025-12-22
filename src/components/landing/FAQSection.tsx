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
      question: "Do I own the content I generate?",
      answer: "Yes. You have full rights to all SFW content you create inside Virtura.",
    },
    {
      question: "Does Virtura support NSFW content?",
      answer: "No. Virtura is strictly SFW and follows strong compliance guidelines.",
    },
    {
      question: "Can I create multiple avatars or identities?",
      answer: "Yes. All plans allow for multiple identities, styles, and personas.",
    },
    {
      question: "Is my data and likeness secure?",
      answer: "Absolutely. Your images and outputs are encrypted and used only for your account.",
    },
    {
      question: "Can I publish content directly to Virtura?",
      answer: "Yes. Creators can publish to their profile for fans and consumers to explore.",
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer: "Yes. Change your subscription whenever needed.",
    },
    {
      question: "Is Virtura for creators or brands?",
      answer: "Both — Virtura is built for creators, consumers, businesses, and agencies.",
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
            ❓ Frequently Asked <span className="bg-gradient-text bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SFW, clean, and accurate answers
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
