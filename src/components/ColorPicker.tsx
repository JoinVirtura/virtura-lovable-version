import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface ColorPickerProps {
  colors: { [key: string]: string };
  onChange: (colors: { [key: string]: string }) => void;
}

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorValue, setNewColorValue] = useState("#000000");

  const defaultColorKeys = ['primary', 'secondary', 'accent'];

  const addColor = () => {
    if (newColorName && newColorValue) {
      onChange({ ...colors, [newColorName]: newColorValue });
      setNewColorName("");
      setNewColorValue("#000000");
    }
  };

  const updateColor = (key: string, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  const removeColor = (key: string) => {
    const newColors = { ...colors };
    delete newColors[key];
    onChange(newColors);
  };

  // Ensure default colors exist
  const ensureDefaultColors = () => {
    const updatedColors = { ...colors };
    defaultColorKeys.forEach(key => {
      if (!updatedColors[key]) {
        updatedColors[key] = key === 'primary' ? '#000000' : key === 'secondary' ? '#666666' : '#FF0000';
      }
    });
    return updatedColors;
  };

  const currentColors = ensureDefaultColors();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {Object.entries(currentColors).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs capitalize">{key}</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="w-12 h-10 rounded border border-input cursor-pointer"
                />
                <Input
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            {!defaultColorKeys.includes(key) && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeColor(key)}
                className="mt-5"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Label className="text-sm mb-2 block">Add Custom Color</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Color name"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            className="flex-1"
          />
          <input
            type="color"
            value={newColorValue}
            onChange={(e) => setNewColorValue(e.target.value)}
            className="w-12 h-10 rounded border border-input cursor-pointer"
          />
          <Button type="button" size="icon" onClick={addColor}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(currentColors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 bg-muted p-2 rounded">
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: value }}
              />
              <span className="text-xs capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
