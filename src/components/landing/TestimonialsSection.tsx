import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialsSectionProps {
  id?: string;
}

export function TestimonialsSection({ id }: TestimonialsSectionProps) {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content: "Virtura AI has transformed our content production. We've reduced costs by 70% while increasing output 5x! The quality is incredible.",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "Mike Thompson",
      role: "Content Creator",
      company: "Independent",
      content: "As a solo creator, I can now compete with big studios. The quality is unbelievable! It's like having a team of designers at my fingertips.",
      rating: 5,
      avatar: "MT",
    },
    {
      name: "Lisa Kim",
      role: "Small Business Owner",
      company: "Creative Studio",
      content: "The AI understands exactly what I want. It's intuitive, fast, and produces professional results every single time.",
      rating: 5,
      avatar: "LK",
    },
  ];

  return (
    <section id={id} className="py-32 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="bg-gradient-text bg-clip-text text-transparent">Creators Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied creators transforming their workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-violet-glow/50 transition-all duration-300">
              <CardContent className="p-8">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                      {testimonial.company && ` • ${testimonial.company}`}
                    </p>
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
