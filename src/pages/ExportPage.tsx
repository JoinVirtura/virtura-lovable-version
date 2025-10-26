import { MotionBackground } from "@/components/MotionBackground";
import { ExportContent } from "@/components/studio/ExportContent";

export default function ExportPage() {
  return (
    <div className="flex-1 p-6 bg-background relative overflow-hidden">
      <MotionBackground />
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Export Content</h1>
          <p className="text-muted-foreground">Choose your export pack and customize your content</p>
        </div>
        <ExportContent />
      </div>
    </div>
  );
}