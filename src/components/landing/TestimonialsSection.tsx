import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialsSectionProps {
  id?: string;
}

export function TestimonialsSection({ id }: TestimonialsSectionProps) {
  const testimonials = [
    {
      content: "We didn't replace photographers entirely, but Virtura eliminated 80% of our repeat shoots. For pitch decks, ads, and social content, it's become our first stop. Clients actually think we increased our production budget, we didn't.",
      rating: 5,
      avatar: "CA",
      name: "Creative Agency Founder",
      role: "New York",
    },
    {
      content: "Consistency was our biggest problem. Our product photos never matched across campaigns. Virtura fixed that overnight. Same lighting, same look, same brand feel, without reshoots.",
      rating: 5,
      avatar: "EB",
      name: "Ecommerce Marketing Manager",
      role: "",
    },
    {
      content: "I honestly assumed this would look 'AI-ish.' It doesn't. My audience can't tell the difference, and engagement actually went up because I'm posting more often without burning out.",
      rating: 5,
      avatar: "SC",
      name: "Lifestyle Creator",
      role: "120k+ followers",
    },
    {
      content: "Before Virtura, content was a bottleneck. Now our team can spin up launch visuals in a single afternoon. For a startup, that speed is everything.",
      rating: 5,
      avatar: "SF",
      name: "SaaS Founder",
      role: "USA",
    },
    {
      content: "I used to schedule shoots every 2-3 months. Now I generate on-brand visuals whenever I need them, listings, Instagram, press features. It's saved me time, money, and coordination headaches.",
      rating: 5,
      avatar: "RB",
      name: "Real Estate Broker",
      role: "",
    },
    {
      content: "Virtura didn't replace creativity, it removed friction. Our designers still direct the vision, but execution is faster and more scalable. That's the real win.",
      rating: 5,
      avatar: "AC",
      name: "Head of Content",
      role: "Digital Agency",
    },
  ];

  return (
    <section id={id} className="py-20 sm:py-32 bg-card/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ⭐ <span className="bg-gradient-text bg-clip-text text-transparent">Testimonials</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied creators transforming their workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-violet-glow/50 transition-all duration-300">
              <CardContent className="p-5 sm:p-6 md:p-8">
                {/* Rating */}
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold text-xs sm:text-sm">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                    {testimonial.role && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
