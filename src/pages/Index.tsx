// Update this page (the content is just a fallback if you fail to update the page)

import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Gallery } from "@/components/Gallery";
import { CreateAvatar } from "@/components/CreateAvatar";
import { AvatarStudio } from "@/components/AvatarStudio";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <CreateAvatar />
      <Gallery />
      <AvatarStudio />
    </div>
  );
};

export default Index;
