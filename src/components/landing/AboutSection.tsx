import { Shield, Sparkles, Globe } from "lucide-react";

interface AboutSectionProps {
  id?: string;
}

export function AboutSection({ id }: AboutSectionProps) {
  return (
    <section id={id} className="py-20 sm:py-32 bg-card/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-primary font-medium">About Virtura</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">
            The Future of <span className="bg-gradient-text bg-clip-text text-transparent">Content Creation</span>
          </h2>
          
          <div className="space-y-4 sm:space-y-6 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed text-left">
            <p>
              Virtura is a next-generation AI content platform designed to empower creators, brands, and consumers with studio-quality digital production tools. Our mission is simple: make high-quality content creation accessible, scalable, and limitless, without traditional production barriers.
            </p>
            <p>
              We believe digital identity is evolving, and Virtura exists to help people, brands, and creators express themselves in new, powerful, and inspiring ways.
            </p>
            <p>
              Built with advanced AI technology and privacy-first principles, Virtura represents the future of creativity, where anyone can bring their ideas to life in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">AI-Powered</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Advanced technology for stunning results</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Privacy-First</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Your data stays secure and private</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-3 sm:mb-4">
                <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Creator-Focused</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Built for creators, brands, and everyone</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
