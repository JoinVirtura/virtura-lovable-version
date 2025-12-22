import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialsSectionProps {
  id?: string;
}

export function TestimonialsSection({ id }: TestimonialsSectionProps) {
  const testimonials = [
    {
      content: "Virtura replaced almost all of our content shoots. We create marketing visuals 10x faster and for a fraction of the cost.",
      rating: 5,
      avatar: "CA",
      name: "Creative Agency",
      role: "USA",
    },
    {
      content: "As a creator, this platform saved me hours every week. I never run out of content anymore.",
      rating: 5,
      avatar: "LC",
      name: "Lifestyle Creator",
      role: "",
    },
    {
      content: "Our brand now produces consistent, on-brand imagery every single day. Virtura is a game-changer.",
      rating: 5,
      avatar: "EB",
      name: "Ecommerce Brand",
      role: "",
    },
  ];

  return (
    <section id={id} className="py-32 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ⭐ <span className="bg-gradient-text bg-clip-text text-transparent">Testimonials</span>
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
                    {testimonial.role && (
                      <p className="text-sm text-muted-foreground">
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
