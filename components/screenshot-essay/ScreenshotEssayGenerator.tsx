"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScreenshotEssayOptions, WatermarkConfig } from "@/types";
import ScreenshotEssayPreview from "./ScreenshotEssayPreview";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { LexicalEditor } from "@/components/ui/lexical-editor";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import Image from "next/image";
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

// Default options to use when no saved state exists
const DEFAULT_OPTIONS: ScreenshotEssayOptions = {
  // Content
  content: "<h1>Lorem Ipsum</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p><p>Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio.</p><p>Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet. Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus.</p>",
  
  // Appearance
  aspectRatio: "6:7", // Changed default to 6:7
  width: 800, // Default width - will be adjusted based on container 
  height: undefined, // Optional fixed height
  fontSize: 18,
  autoScale: true, // Always enabled
  textDensity: 2.0, // Doubled from 1.5 to compensate for the new scaling
  lineHeight: 1.6,
  padding: 40,
  borderRadius: 12,
  fontFamily: "Inter, sans-serif",
  
  // Background
  backgroundColor: "#ffffff",
  textColor: "#000000",
  useTexture: false,
  customBackgroundImage: undefined,
  backgroundOpacity: 0.5,
  
  // Watermarks
  watermarks: {
    bottomRight: {
      type: 'text',
      text: "@yourusername",
      imageUrl: "",
      opacity: 1.0,
      enabled: true
    },
    diagonal: {
      type: 'diagonal',
      text: "@yourusername",
      imageUrl: "",
      opacity: 0.07,
      enabled: true,
      size: 1.0 // Default size multiplier
    }
  }
};

// Simplify the aspect ratio options to only 3 choices
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

// Local storage key
const STORAGE_KEY = "ezscreenshotessay-options";

export default function ScreenshotEssayGenerator() {
  // Initialize with null to indicate we haven't loaded yet
  const [options, setOptions] = useState<ScreenshotEssayOptions | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Explicit background type tracking for UI
  const [backgroundType, setBackgroundType] = useState<"solid" | "texture" | "custom">("solid");

  // Load saved options from localStorage on component mount
  useEffect(() => {
    try {
      const savedOptions = localStorage.getItem(STORAGE_KEY);
      if (savedOptions) {
        // If we have saved options, use them
        const parsedOptions = JSON.parse(savedOptions);
        setOptions(parsedOptions);
        
        // Set the correct background type based on loaded options
        if (parsedOptions.useTexture) {
          setBackgroundType("texture");
        } else if (parsedOptions.customBackgroundImage) {
          setBackgroundType("custom");
        } else {
          setBackgroundType("solid");
        }
        
        toast.success("Loaded your saved settings", {
          duration: 2000,
          position: "bottom-right",
        });
      } else {
        // Only use defaults if nothing exists in localStorage
        setOptions(DEFAULT_OPTIONS);
        
        // Set default background type
        setBackgroundType(DEFAULT_OPTIONS.useTexture ? "texture" : 
                          DEFAULT_OPTIONS.customBackgroundImage ? "custom" : "solid");
      }
    } catch (error) {
      console.error("Error loading saved options:", error);
      toast.error("Failed to load saved settings", {
        duration: 3000,
        position: "bottom-right",
      });
      // Fall back to defaults only if there's an error
      setOptions(DEFAULT_OPTIONS);
      setBackgroundType("solid");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save options to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || !options) return; // Skip initial render or if options not loaded yet
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch (error) {
      console.error("Error saving options:", error);
    }
  }, [options, isLoaded]);

  // Skip rendering until we've loaded options
  if (!options) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your settings...</p>
        </div>
      </div>
    );
  }

  const updateOptions = (newOptions: Partial<ScreenshotEssayOptions>) => {
    setOptions((prev) => prev ? { ...prev, ...newOptions } : { ...DEFAULT_OPTIONS, ...newOptions });
  };

  const updateWatermark = (key: 'bottomRight' | 'diagonal', config: Partial<WatermarkConfig>) => {
    setOptions((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        watermarks: {
          ...prev.watermarks,
          [key]: {
            ...prev.watermarks[key],
            ...config
          }
        }
      };
    });
  };

  const handleSaveManually = () => {
    if (!options) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
      toast.success("Settings saved successfully", {
        duration: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Error manually saving options:", error);
      toast.error("Failed to save settings", {
        duration: 3000,
        position: "bottom-right",
      });
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      setOptions(DEFAULT_OPTIONS);
      toast.info("Settings reset to default", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      <div>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Save/Reset Controls */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleSaveManually}
                  className="gap-1"
                  title="Your settings will be automatically remembered when you return to the site next time"
                >
                  <Save className="h-4 w-4" />
                  Save to local storage
                </Button>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="rounded-lg border border-border bg-yellow-50 dark:bg-yellow-900/20 p-4 space-y-4">
              <h3 className="text-lg font-medium">Content</h3>
              <div className="space-y-2">
                <LexicalEditor
                  value={options.content}
                  onChange={(value) => updateOptions({ content: value })}
                  placeholder="Enter your essay content here..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
            
            {/* Appearance Section */}
            <div className="rounded-lg border border-border bg-blue-50 dark:bg-blue-900/20 p-4 space-y-4">
              <h3 className="text-lg font-medium">Appearance</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  value={options.fontFamily}
                  onValueChange={(value) => updateOptions({ fontFamily: value })}
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
                    onChange={(e) => updateOptions({ textColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={options.textColor}
                    onChange={(e) => updateOptions({ textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-4 border border-border bg-background rounded-lg p-4">
                <h4 className="font-medium">Dimensions</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                  <Select
                    value={options.aspectRatio || "6:7"}
                    onValueChange={(value) => updateOptions({ aspectRatio: value })}
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
                    onValueChange={(value: number[]) => updateOptions({ textDensity: value[0] })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Control the font size directly (25% to 300%) without auto-scaling based on content length
                  </p>
                </div>
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
                  onValueChange={(value: number[]) => updateOptions({ padding: value[0] })}
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
                  onValueChange={(value: number[]) => updateOptions({ lineHeight: value[0] })}
                />
              </div>
            </div>
            
            {/* Colors Section */}
            <div className="rounded-lg border border-border bg-green-50 dark:bg-green-900/20 p-4 space-y-4">
              <h3 className="text-lg font-medium">Background</h3>
              
              <div className="space-y-2">
                <Label htmlFor="backgroundType">Background Type</Label>
                <Select
                  value={backgroundType}
                  onValueChange={(value: "solid" | "texture" | "custom") => {
                    setBackgroundType(value);
                    
                    if (value === "texture") {
                      updateOptions({ useTexture: true, customBackgroundImage: undefined });
                    } else if (value === "custom") {
                      updateOptions({ useTexture: false, customBackgroundImage: options.customBackgroundImage || "" });
                    } else {
                      updateOptions({ useTexture: false, customBackgroundImage: undefined });
                    }
                  }}
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
                    Background Opacity: {Math.round((options.backgroundOpacity || 0.5) * 100)}%
                  </Label>
                </div>
                <Slider
                  id="backgroundOpacity"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={[options.backgroundOpacity || 0.5]}
                  onValueChange={(value: number[]) => 
                    updateOptions({ backgroundOpacity: value[0] })
                  }
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
                      value={options.backgroundColor}
                      onChange={(e) => updateOptions({ backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={options.backgroundColor}
                      onChange={(e) => updateOptions({ backgroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
              
              {backgroundType === "custom" && (
                <>
                  {/* Image preview */}
                  {options.customBackgroundImage && (
                    <div className="space-y-2">
                      <Label>Custom Background Image</Label>
                      <div className="relative w-full h-28 bg-slate-100 rounded-md overflow-hidden">
                        <Image 
                          src={options.customBackgroundImage} 
                          alt="Custom background preview" 
                          className="w-full h-full object-cover"
                          width={112}
                          height={112}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => {
                            updateOptions({ customBackgroundImage: undefined });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* File upload input */}
                  <div className="space-y-2">
                    <Label htmlFor="customBackgroundImage">
                      {options.customBackgroundImage ? "Change Image" : "Upload Image"}
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
                              updateOptions({ 
                                customBackgroundImage: event.target.result.toString() 
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* Watermarks Section */}
            <div className="rounded-lg border border-border bg-purple-50 dark:bg-purple-900/20 p-4 space-y-4">
              <h3 className="text-lg font-medium">Watermarks</h3>
              
              {/* Bottom Right Watermark */}
              <div className="space-y-4 border border-border bg-background rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Bottom Right Watermark</h4>
                  <Switch
                    id="bottomRightEnabled"
                    checked={options.watermarks.bottomRight.enabled}
                    onCheckedChange={(checked) => 
                      updateWatermark('bottomRight', { enabled: checked })
                    }
                  />
                </div>
                
                {options.watermarks.bottomRight.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="bottomRightText">Watermark Text</Label>
                      <Input
                        id="bottomRightText"
                        value={options.watermarks.bottomRight.text}
                        onChange={(e) => updateWatermark('bottomRight', { text: e.target.value })}
                        placeholder="e.g. @yourusername"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Diagonal Watermark */}
              <div className="space-y-4 border border-border bg-background rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Diagonal Watermark</h4>
                  <Switch
                    id="diagonalEnabled"
                    checked={options.watermarks.diagonal.enabled}
                    onCheckedChange={(checked) => 
                      updateWatermark('diagonal', { enabled: checked })
                    }
                  />
                </div>
                
                {options.watermarks.diagonal.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="diagonalText">Watermark Text</Label>
                      <Input
                        id="diagonalText"
                        value={options.watermarks.diagonal.text}
                        onChange={(e) => updateWatermark('diagonal', { text: e.target.value })}
                        placeholder="e.g. @yourusername"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="diagonalOpacity">
                          Opacity: {Math.round(options.watermarks.diagonal.opacity * 100)}%
                        </Label>
                      </div>
                      <Slider
                        id="diagonalOpacity"
                        min={0.02}
                        max={0.2}
                        step={0.02}
                        value={[options.watermarks.diagonal.opacity]}
                        onValueChange={(value: number[]) => 
                          updateWatermark('diagonal', { opacity: value[0] })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="diagonalSize">
                          Size: {Math.round((options.watermarks.diagonal.size ?? 1.0) * 100)}%
                        </Label>
                      </div>
                      <Slider
                        id="diagonalSize"
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        value={[options.watermarks.diagonal.size ?? 1.0]}
                        onValueChange={(value: number[]) => 
                          updateWatermark('diagonal', { size: value[0] })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div>
        <div className="sticky top-24">
          <ScreenshotEssayPreview options={options} />
        </div>
      </div>
    </div>
  );
} 