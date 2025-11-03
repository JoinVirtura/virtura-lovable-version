import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Palette, Type, Loader2, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ColorPicker } from "./ColorPicker";
import { FontSelector } from "./FontSelector";
import type { Brand } from "@/hooks/useBrandAssets";

interface BrandKitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onBrandUpdated: () => void;
}

export function BrandKitDialog({
  open,
  onOpenChange,
  brand,
  onBrandUpdated,
}: BrandKitDialogProps) {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [colors, setColors] = useState(
    brand?.brand_colors || { primary: "#000000", secondary: "#666666", accent: "#FF0000" }
  );
  const [fonts, setFonts] = useState(
    brand?.brand_fonts || { heading: "Inter", body: "Inter" }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !brand) return;

    try {
      setLoading(true);

      // Upload to Supabase Storage
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `brand-logos/${brand.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("virtura-media")
        .upload(fileName, logoFile, {
          contentType: logoFile.type,
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("virtura-media").getPublicUrl(fileName);

      // Update brand record
      const { error: updateError } = await supabase
        .from("brands")
        .update({ logo_url: publicUrl })
        .eq("id", brand.id);

      if (updateError) throw updateError;

      toast.success("Logo uploaded successfully!");
      onBrandUpdated();
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err: any) {
      console.error("Error uploading logo:", err);
      toast.error("Failed to upload logo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveColors = async () => {
    if (!brand) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("brands")
        .update({ brand_colors: colors })
        .eq("id", brand.id);

      if (error) throw error;

      toast.success("Brand colors saved!");
      onBrandUpdated();
    } catch (err: any) {
      console.error("Error saving colors:", err);
      toast.error("Failed to save colors: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFonts = async () => {
    if (!brand) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("brands")
        .update({ brand_fonts: fonts })
        .eq("id", brand.id);

      if (error) throw error;

      toast.success("Brand fonts saved!");
      onBrandUpdated();
    } catch (err: any) {
      console.error("Error saving fonts:", err);
      toast.error("Failed to save fonts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brand Kit Settings</DialogTitle>
          <DialogDescription>
            Customize your brand identity with logos, colors, and fonts
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="logo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logo">
              <Upload className="w-4 h-4 mr-2" />
              Logo
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="w-4 h-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="fonts">
              <Type className="w-4 h-4 mr-2" />
              Fonts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logo" className="space-y-4 pt-4">
            <div className="space-y-4">
              {/* Current Logo */}
              {brand?.logo_url && !logoPreview && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Logo</p>
                  <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center">
                    <img
                      src={brand.logo_url}
                      alt="Brand logo"
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Logo Preview */}
              {logoPreview && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">New Logo Preview</p>
                  <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {logoFile ? "Change Logo" : "Select Logo"}
                </Button>

                {logoFile && (
                  <Button onClick={handleLogoUpload} disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Upload
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Recommended: PNG or SVG format, transparent background, square ratio (1:1)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4 pt-4">
            <ColorPicker colors={colors} onChange={setColors} />
            <Button onClick={handleSaveColors} disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Colors
            </Button>
          </TabsContent>

          <TabsContent value="fonts" className="space-y-4 pt-4">
            <FontSelector fonts={fonts} onChange={setFonts} />
            <Button onClick={handleSaveFonts} disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Fonts
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
