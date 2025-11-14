import { Clock, Sparkles, Award, DollarSign, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface BenefitsSectionProps {
  id?: string;
}

export function BenefitsSection({ id }: BenefitsSectionProps) {
  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Create professional content 10x faster than traditional methods",
      metric: "10x faster"
    },
    {
      icon: Sparkles,
      title: "No Skills Required",
      description: "Anyone can create stunning visuals without design experience",
      metric: "Zero experience"
    },
    {
      icon: Award,
      title: "Consistent Quality",
      description: "AI ensures professional results every time",
      metric: "100% quality"
    },
    {
      icon: DollarSign,
      title: "Cost Effective",
      description: "Replace expensive designers and studios with AI",
      metric: "Save 90%"
    },
    {
      icon: Zap,
      title: "Unlimited Creativity",
      description: "Generate unlimited variations until it's perfect",
      metric: "∞ variations"
    },
    {
      icon: TrendingUp,
      title: "Scale Effortlessly",
      description: "Produce content at scale without hiring more staff",
      metric: "Unlimited scale"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id={id} className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary-blue/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="bg-gradient-text bg-clip-text text-transparent">Virtura AI</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools designed to transform your content creation workflow
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="group hover:shadow-violet-glow transition-all duration-500 hover:-translate-y-2 relative overflow-hidden border-border/50 hover:border-primary/30">
                {/* Number badge */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary/20 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-8 relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:shadow-violet-glow group-hover:scale-110 transition-all duration-500">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                    <span className="text-xs font-bold text-primary px-2 py-1 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {benefit.metric}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
