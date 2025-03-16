"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScreenshotEssayOptions, WatermarkConfig } from "@/types";
import ScreenshotEssayPreview, { toPng, saveAs } from "./ScreenshotEssayPreview";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Settings as SettingsIcon, Eye as EyeIcon, GripVertical, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";

// Import our reusable components
import { ContentEditor } from "./settings/ContentEditor";
import { AppearanceSettings } from "./settings/AppearanceSettings";
import { BackgroundSettings } from "./settings/BackgroundSettings";
import { WatermarkSettings } from "./settings/WatermarkSettings";
import { TemplateControls, SavedTemplate } from "./settings/TemplateControls";
import { ActionButtons } from "./settings/ActionButtons";
import { PreviewPanel } from "./settings/PreviewPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Local storage keys
const STORAGE_KEY = "ezscreenshotessay-options";
const TEMPLATES_STORAGE_KEY = "ezscreenshotessay-templates";

export default function ScreenshotEssayGenerator() {
  // Initialize with null to indicate we haven't loaded yet
  const [options, setOptions] = useState<ScreenshotEssayOptions | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Template state
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string | undefined>(undefined);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Explicit background type tracking for UI
  const [backgroundType, setBackgroundType] = useState<"solid" | "texture" | "custom">("solid");

  // Add a state to track screen size for responsive layout
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  
  // Add state for mobile tabs
  const [activeTab, setActiveTab] = useState("settings");

  const previewRef = useRef<HTMLDivElement>(null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load saved options from localStorage on component mount
  useEffect(() => {
    try {
      // Load saved templates first
      const savedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates);
        setTemplates(parsedTemplates.templates || []);
        setActiveTemplate(parsedTemplates.activeTemplate);
      }

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

  const updateSingleOption = (key: string, value: unknown) => {
    updateOptions({ [key]: value });
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
      setActiveTemplate(undefined);
      toast.info("Settings reset to default", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };

  // Handle background type changes
  const handleBackgroundTypeChange = (type: "solid" | "texture" | "custom") => {
    setBackgroundType(type);
    
    if (type === "texture") {
      updateOptions({ useTexture: true, customBackgroundImage: undefined });
    } else if (type === "custom") {
      updateOptions({ useTexture: false, customBackgroundImage: options.customBackgroundImage || "" });
    } else {
      updateOptions({ useTexture: false, customBackgroundImage: undefined });
    }
  };

  // Template management functions
  const saveAsTemplate = (name: string) => {
    if (!options) return;
    
    setIsLoading(true);
    
    try {
      // Check if template with this name already exists
      const existingIndex = templates.findIndex(t => t.name === name);
      const updatedTemplates = [...templates];
      
      if (existingIndex >= 0) {
        // Update existing template
        updatedTemplates[existingIndex] = {
          name,
          timestamp: Date.now(),
          options: {...options}
        };
        toast.success(`Template "${name}" updated`, { duration: 2000 });
      } else {
        // Add new template
        updatedTemplates.push({
          name,
          timestamp: Date.now(),
          options: {...options}
        });
        toast.success(`Template "${name}" saved`, { duration: 2000 });
      }
      
      // Update state and localStorage
      setTemplates(updatedTemplates);
      setActiveTemplate(name);
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify({
        templates: updatedTemplates,
        activeTemplate: name
      }));
      
      // Close dialog and reset name
      setSaveDialogOpen(false);
      setNewTemplateName("");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template", { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (name: string) => {
    const template = templates.find(t => t.name === name);
    if (!template) return;
    
    setIsLoading(true);
    
    try {
      // Load template options - we need to cast the options to the correct type
      setOptions(template.options as unknown as ScreenshotEssayOptions);
      
      // Update active template
      setActiveTemplate(name);
      
      // Update background type
      const typedOptions = template.options as Record<string, unknown>;
      if (typedOptions.useTexture === true) {
        setBackgroundType("texture");
      } else if (typedOptions.customBackgroundImage) {
        setBackgroundType("custom");
      } else {
        setBackgroundType("solid");
      }
      
      // Update localStorage
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify({
        templates,
        activeTemplate: name
      }));
      
      toast.success(`Template "${name}" loaded`, { duration: 2000 });
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template", { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentTemplate = () => {
    if (!activeTemplate || !options) return;
    
    setIsLoading(true);
    
    try {
      // Find and update the template
      const updatedTemplates = templates.map(t => 
        t.name === activeTemplate 
          ? { ...t, timestamp: Date.now(), options: {...options} }
          : t
      );
      
      // Update state and localStorage
      setTemplates(updatedTemplates);
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify({
        templates: updatedTemplates,
        activeTemplate
      }));
      
      toast.success(`Template "${activeTemplate}" updated`, { duration: 2000 });
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template", { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = (name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;
    
    setIsLoading(true);
    
    try {
      // Filter out the template to delete
      const updatedTemplates = templates.filter(t => t.name !== name);
      
      // Update state
      setTemplates(updatedTemplates);
      
      // If active template was deleted, clear it
      if (activeTemplate === name) {
        setActiveTemplate(undefined);
      }
      
      // Update localStorage
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify({
        templates: updatedTemplates,
        activeTemplate: activeTemplate === name ? undefined : activeTemplate
      }));
      
      toast.success(`Template "${name}" deleted`, { duration: 2000 });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template", { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // If on mobile, switch to preview tab before download
      if (!isLargeScreen) {
        setActiveTab("preview");
      }
      
      if (!previewRef.current) {
        // Try to find the preview element using query selector as a fallback
        const previewElement = document.querySelector('[data-preview-content="true"]');
        if (!previewElement) {
          toast.error("Could not find preview element to download", { duration: 3000 });
          return;
        }
        
        const dataUrl = await toPng(previewElement as HTMLElement, { quality: 0.95 });
        saveAs(dataUrl, "ezscreenshotessay.png");
      } else {
        const dataUrl = await toPng(previewRef.current, { quality: 0.95 });
        saveAs(dataUrl, "ezscreenshotessay.png");
      }
      
      toast.success("Screenshot downloaded", { duration: 2000 });
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to download screenshot", { duration: 3000 });
    }
  };

  const renderSettingsPanel = () => (
    <div className="h-full overflow-y-auto">
      <Card className="h-full border-0 rounded-none shadow-none">
        {/* Site header */}
        <div className="border-b pb-2">
          <div className="flex flex-col space-y-2 p-4 pb-2">
            <h1 className="text-3xl font-bold">EZScreenshotEssay.com</h1>
            <p className="text-sm text-muted-foreground">
              Create beautiful screenshots with custom styling, images, and watermarks
            </p>
            <p className="text-xs text-muted-foreground pt-2">
              Made with ❤️ by Gary Sheng • <a href="https://github.com/garysheng/ezscreenshotessay" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
            </p>
          </div>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Content Section */}
          <ContentEditor 
            content={options.content}
            onChange={(content) => updateOptions({ content })}
          />
          
          {/* Appearance Section */}
          <AppearanceSettings 
            options={options}
            onUpdate={updateSingleOption}
          />
          
          {/* Background Section */}
          <BackgroundSettings 
            backgroundType={backgroundType}
            backgroundColor={options.backgroundColor}
            backgroundOpacity={options.backgroundOpacity || 0.5}
            customBackgroundImage={options.customBackgroundImage}
            onTypeChange={handleBackgroundTypeChange}
            onColorChange={(color) => updateOptions({ backgroundColor: color })}
            onOpacityChange={(opacity) => updateOptions({ backgroundOpacity: opacity })}
            onImageChange={(imageDataUrl) => updateOptions({ customBackgroundImage: imageDataUrl })}
          />
          
          {/* Watermarks Section */}
          <WatermarkSettings 
            bottomRight={options.watermarks.bottomRight}
            diagonal={options.watermarks.diagonal}
            onBottomRightChange={(config) => updateWatermark('bottomRight', config)}
            onDiagonalChange={(config) => updateWatermark('diagonal', config)}
          />

          {/* Control buttons and template section */}
          <div className="mt-8 pt-6 border-t border-border">
            {/* Template controls */}
            <TemplateControls 
              templates={templates}
              activeTemplate={activeTemplate}
              isLoading={isLoading}
              onLoadTemplate={loadTemplate}
              onUpdateTemplate={updateCurrentTemplate}
              onSaveTemplate={saveAsTemplate}
              onDeleteTemplate={deleteTemplate}
            />
            
            {/* Save/Reset buttons */}
            <ActionButtons 
              onReset={handleReset}
              onSave={handleSaveManually}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="w-full h-full overflow-hidden">
      {isLargeScreen ? (
        // Use resizable panels only on desktop
        <PanelGroup 
          direction="horizontal" 
          className="h-full"
          autoSaveId="screenshot-essay-layout"
        >
          {/* Editor Panel */}
          <Panel defaultSize={50} minSize={30}>
            {renderSettingsPanel()}
          </Panel>
          
          {/* Resize Handle */}
          <PanelResizeHandle className="w-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors duration-150 cursor-col-resize flex items-center justify-center">
            <div className="w-1 h-8 rounded-full opacity-30">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </PanelResizeHandle>
          
          {/* Preview Panel */}
          <Panel defaultSize={50} minSize={30}>
            <PreviewPanel
              onDownload={handleDownload}
              isLargeScreen={true}
            >
                <div ref={previewRef}>
                  <ScreenshotEssayPreview options={options} />
                </div>
            </PreviewPanel>
          </Panel>
        </PanelGroup>
      ) : (
        // Tabbed layout for mobile
        <div className="flex flex-col h-full">
          <Tabs 
            defaultValue="settings" 
            className="flex flex-col h-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full grid grid-cols-2 sticky top-0 z-10 bg-background shadow-md mb-0">
              <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2 py-3">
                <EyeIcon className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="flex-grow overflow-y-auto m-0 p-0">
              <div className="pb-8">
                {renderSettingsPanel()}
              </div>
            </TabsContent>
            
            <TabsContent value="preview" 
              className="flex-grow overflow-y-auto m-0 p-0 h-[calc(100vh-56px)] dark:bg-slate-900 dark:[--grid-color:rgba(255,255,255,0.07)] dark:[--grid-bg:#111827]"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, var(--grid-color) 25%, transparent 25%),
                  linear-gradient(-45deg, var(--grid-color) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, var(--grid-color) 75%),
                  linear-gradient(-45deg, transparent 75%, var(--grid-color) 75%)
                `,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
                backgroundColor: 'var(--grid-bg)',
                ['--grid-color' as string]: 'rgba(0, 0, 0, 0.05)',
                ['--grid-bg' as string]: '#ffffff',
              }}
            >
              {/* Floating download button */}
              <div className="sticky top-0 right-0 p-4 flex justify-end z-20 bg-gradient-to-b from-background/80 via-background/30 to-transparent">
                <Button 
                  onClick={handleDownload} 
                  className="gap-2 shadow-md hover:shadow-lg transition-shadow"
                  size="default"
                >
                  <Download className="h-5 w-5" />
                  Download PNG
                </Button>
              </div>
              
              {/* Preview content centered in the checkered background */}
              <div className="px-4 pt-2 pb-16">
                <div className="flex justify-center py-8">
                  <div data-preview-content="true" className="mx-auto max-w-md">
                    <ScreenshotEssayPreview options={options} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Template Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save your current configuration as a reusable template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="My Template"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveAsTemplate(newTemplateName)}
              disabled={!newTemplateName.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 