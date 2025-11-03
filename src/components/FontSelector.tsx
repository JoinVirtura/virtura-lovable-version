import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface FontSelectorProps {
  fonts: { heading?: string; body?: string };
  onChange: (fonts: { heading: string; body: string }) => void;
}

const popularFonts = [
  { name: "Inter", category: "sans-serif" },
  { name: "Roboto", category: "sans-serif" },
  { name: "Open Sans", category: "sans-serif" },
  { name: "Lato", category: "sans-serif" },
  { name: "Montserrat", category: "sans-serif" },
  { name: "Poppins", category: "sans-serif" },
  { name: "Playfair Display", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "PT Serif", category: "serif" },
  { name: "Raleway", category: "sans-serif" },
  { name: "Ubuntu", category: "sans-serif" },
  { name: "Nunito", category: "sans-serif" },
  { name: "Source Sans Pro", category: "sans-serif" },
  { name: "Oswald", category: "sans-serif" },
];

export function FontSelector({ fonts, onChange }: FontSelectorProps) {
  const [headingFont, setHeadingFont] = useState(fonts.heading || "Inter");
  const [bodyFont, setBodyFont] = useState(fonts.body || "Inter");

  // Load Google Fonts dynamically
  useEffect(() => {
    const loadFont = (fontName: string) => {
      const fontLink = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
      
      // Check if font is already loaded
      const existingLink = document.querySelector(`link[href="${fontLink}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontLink;
        document.head.appendChild(link);
      }
    };

    loadFont(headingFont);
    loadFont(bodyFont);
  }, [headingFont, bodyFont]);

  const handleHeadingChange = (value: string) => {
    setHeadingFont(value);
    onChange({ heading: value, body: bodyFont });
  };

  const handleBodyChange = (value: string) => {
    setBodyFont(value);
    onChange({ heading: headingFont, body: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Heading Font</Label>
        <Select value={headingFont} onValueChange={handleHeadingChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {popularFonts.map((font) => (
              <SelectItem key={font.name} value={font.name}>
                <span style={{ fontFamily: font.name }}>{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Body Font</Label>
        <Select value={bodyFont} onValueChange={handleBodyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {popularFonts.map((font) => (
              <SelectItem key={font.name} value={font.name}>
                <span style={{ fontFamily: font.name }}>{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t">
        <Label className="text-xs text-muted-foreground mb-3 block">Preview</Label>
        <Card className="p-4 space-y-3">
          <div>
            <h3
              className="text-2xl font-bold"
              style={{ fontFamily: headingFont }}
            >
              Heading Preview
            </h3>
            <p className="text-xs text-muted-foreground">{headingFont}</p>
          </div>
          <div>
            <p
              className="text-sm"
              style={{ fontFamily: bodyFont }}
            >
              Body text preview. This is how your content will look with the selected font.
              The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-xs text-muted-foreground">{bodyFont}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
