import { Shield, Sparkles, Globe } from "lucide-react";

interface AboutSectionProps {
  id?: string;
}

export function AboutSection({ id }: AboutSectionProps) {
  return (
    <section id={id} className="py-32 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">About Virtura</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            The Future of <span className="bg-gradient-text bg-clip-text text-transparent">Content Creation</span>
          </h2>
          
          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed text-justify">
            <p>
              Virtura is a next-generation AI content platform designed to empower creators, brands, and consumers with studio-quality digital production tools. Our mission is simple: make high-quality content creation accessible, scalable, and limitless — without traditional production barriers.
            </p>
            <p>
              We believe digital identity is evolving, and Virtura exists to help people, brands, and creators express themselves in new, powerful, and inspiring ways.
            </p>
            <p>
              Built with advanced AI technology, privacy-first principles, and a commitment to SFW content, Virtura represents the future of creativity — where anyone can bring their ideas to life in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Advanced technology for stunning results</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Privacy-First</h3>
              <p className="text-sm text-muted-foreground">Your data stays secure and private</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2">SFW Only</h3>
              <p className="text-sm text-muted-foreground">Safe, professional content always</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
