import { SettingsSection } from "./SettingsSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BackgroundSettingsProps {
  backgroundType: "solid" | "texture" | "custom";
  backgroundColor: string;
  backgroundOpacity: number;
  customBackgroundImage?: string;
  onTypeChange: (type: "solid" | "texture" | "custom") => void;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onImageChange: (imageDataUrl: string | undefined) => void;
}

export function BackgroundSettings({
  backgroundType,
  backgroundColor,
  backgroundOpacity,
  customBackgroundImage,
  onTypeChange,
  onColorChange,
  onOpacityChange,
  onImageChange,
}: BackgroundSettingsProps) {
  return (
    <SettingsSection title="Background" colorClass="bg-green-50 dark:bg-green-900/20">
      <div className="space-y-2">
        <Label htmlFor="backgroundType">Background Type</Label>
        <Select
          value={backgroundType}
          onValueChange={(value: "solid" | "texture" | "custom") => onTypeChange(value)}
        >
          <SelectTrigger id="backgroundType" className="w-full">
            <SelectValue placeholder="Select background type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid Color</SelectItem>
            <SelectItem value="texture">Paper Texture</SelectItem>
            <SelectItem value="custom">Custom Image</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose between a solid color, paper texture, or custom image background
        </p>
      </div>
      
      {/* Background opacity slider - shown for all background types */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="backgroundOpacity">
            Background Opacity: {Math.round(backgroundOpacity * 100)}%
          </Label>
        </div>
        <Slider
          id="backgroundOpacity"
          min={0.1}
          max={1.0}
          step={0.05}
          value={[backgroundOpacity]}
          onValueChange={(value: number[]) => onOpacityChange(value[0])}
        />
        <p className="text-sm text-muted-foreground">
          Adjust the opacity of the background
        </p>
      </div>
      
      {/* Background type specific controls */}
      {backgroundType === "solid" && (
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Color</Label>
          <div className="flex gap-2">
            <Input
              id="backgroundColor"
              type="color"
              value={backgroundColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              value={backgroundColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      )}
      
      {backgroundType === "custom" && (
        <>
          {/* Image preview */}
          {customBackgroundImage && (
            <div className="space-y-2">
              <Label>Custom Background Image</Label>
              <div className="relative w-full h-28 bg-slate-100 rounded-md overflow-hidden">
                <Image 
                  src={customBackgroundImage} 
                  alt="Custom background preview" 
                  className="w-full h-full object-cover"
                  width={112}
                  height={112}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={() => onImageChange(undefined)}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
          
          {/* File upload input */}
          <div className="space-y-2">
            <Label htmlFor="customBackgroundImage">
              {customBackgroundImage ? "Change Image" : "Upload Image"}
            </Label>
            <Input
              id="customBackgroundImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      onImageChange(event.target.result.toString());
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </>
      )}
    </SettingsSection>
  );
} 