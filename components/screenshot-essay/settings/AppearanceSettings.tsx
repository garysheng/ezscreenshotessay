import { SettingsSection } from "./SettingsSection";
import { ScreenshotEssayOptions } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Font options
const FONT_OPTIONS = [
  // Sans-serif fonts
  { value: "Inter, sans-serif", label: "Inter (Sans-serif)" },
  { value: "Arial, sans-serif", label: "Arial (Sans-serif)" },
  { value: "Helvetica, sans-serif", label: "Helvetica (Sans-serif)" },
  { value: "Verdana, sans-serif", label: "Verdana (Sans-serif)" },
  
  // Serif fonts
  { value: "Georgia, serif", label: "Georgia (Serif)" },
  { value: "Times New Roman, serif", label: "Times New Roman (Serif)" },
  { value: "Garamond, serif", label: "Garamond (Serif)" },
  { value: "Baskerville, serif", label: "Baskerville (Serif)" },
  
  // Monospace fonts
  { value: "Consolas, monospace", label: "Consolas (Monospace)" },
  { value: "Courier New, monospace", label: "Courier New (Monospace)" },
  { value: "Monaco, monospace", label: "Monaco (Monospace)" },
  { value: "JetBrains Mono, monospace", label: "JetBrains Mono (Monospace)" },
];

// Aspect ratio options
const ASPECT_RATIO_OPTIONS = [
  { 
    value: "6:7", 
    label: "6:7 (Portrait)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 35" width="30" height="35" className="mr-2 text-muted-foreground">
        <rect width="30" height="35" rx="2" fill="currentColor" opacity="0.2" />
      </svg>
    )
  },
  { 
    value: "1:1", 
    label: "1:1 (Square)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="40" height="30" className="mr-2 text-muted-foreground">
        <rect width="30" height="30" rx="2" fill="currentColor" opacity="0.2" />
      </svg>
    )
  },
  { 
    value: "3:4", 
    label: "3:4",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" width="30" height="40" className="mr-2 text-muted-foreground">
        <rect width="30" height="40" rx="2" fill="currentColor" opacity="0.2" />
      </svg>
    )
  }
];

interface AppearanceSettingsProps {
  options: Pick<ScreenshotEssayOptions, 'fontFamily' | 'textColor' | 'aspectRatio' | 'textDensity' | 'padding' | 'lineHeight'>;
  onUpdate: (key: string, value: any) => void;
}

export function AppearanceSettings({ options, onUpdate }: AppearanceSettingsProps) {
  return (
    <SettingsSection title="Appearance" colorClass="bg-blue-50 dark:bg-blue-900/20">
      <div className="space-y-2">
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select
          value={options.fontFamily}
          onValueChange={(value) => onUpdate('fontFamily', value)}
        >
          <SelectTrigger id="fontFamily" className="w-full">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            <div className="max-h-[300px] overflow-y-auto">
              {FONT_OPTIONS.map((font) => (
                <SelectItem 
                  key={font.value} 
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="textColor">Text Color</Label>
        <div className="flex gap-2">
          <Input
            id="textColor"
            type="color"
            value={options.textColor}
            onChange={(e) => onUpdate('textColor', e.target.value)}
            className="w-12 h-10 p-1"
          />
          <Input
            value={options.textColor}
            onChange={(e) => onUpdate('textColor', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
      
      <h4 className="font-medium pt-2">Dimensions</h4>
      
      <div className="space-y-2">
        <Label htmlFor="aspectRatio">Aspect Ratio</Label>
        <Select
          value={options.aspectRatio || "6:7"}
          onValueChange={(value) => onUpdate('aspectRatio', value)}
        >
          <SelectTrigger id="aspectRatio" className="w-full">
            {/* Custom display for selected aspect ratio */}
            {(() => {
              const selected = ASPECT_RATIO_OPTIONS.find(
                option => option.value === (options.aspectRatio || "6:7")
              );
              return (
                <div className="flex items-center w-full">
                  {selected?.icon}
                  <span>{selected?.label}</span>
                </div>
              );
            })()}
          </SelectTrigger>
          <SelectContent>
            <div className="max-h-[300px] overflow-y-auto">
              {ASPECT_RATIO_OPTIONS.map((ratio) => (
                <SelectItem 
                  key={ratio.value} 
                  value={ratio.value}
                >
                  <div className="flex items-center">
                    {ratio.icon}
                    {ratio.label}
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose an aspect ratio for your screenshot
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="textDensity">Font Size: {((options.textDensity || 1.5) * 50).toFixed(0)}%</Label>
        </div>
        <Slider
          id="textDensity"
          min={0.5}
          max={6.0}
          step={0.1}
          value={[options.textDensity || 1.5]}
          onValueChange={(value: number[]) => onUpdate('textDensity', value[0])}
        />
        <p className="text-sm text-muted-foreground">
          Control the font size directly (25% to 300%) without auto-scaling based on content length
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="padding">Padding: {options.padding}px</Label>
        </div>
        <Slider
          id="padding"
          min={20}
          max={100}
          step={5}
          value={[options.padding]}
          onValueChange={(value: number[]) => onUpdate('padding', value[0])}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="lineHeight">Line Height: {options.lineHeight}</Label>
        </div>
        <Slider
          id="lineHeight"
          min={1.2}
          max={2.0}
          step={0.1}
          value={[options.lineHeight]}
          onValueChange={(value: number[]) => onUpdate('lineHeight', value[0])}
        />
      </div>
    </SettingsSection>
  );
} 