import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Check, Loader2, Trash2, MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ScreenshotEssayOptions } from "@/types";

export interface SavedTemplate {
  name: string;
  timestamp: number;
  options: ScreenshotEssayOptions; // Use the proper type instead of any
}

interface TemplateControlsProps {
  templates: SavedTemplate[];
  activeTemplate?: string;
  isLoading: boolean;
  onLoadTemplate: (name: string) => void;
  onUpdateTemplate: () => void;
  onSaveTemplate: (name: string) => void;
  onDeleteTemplate: (name: string) => void;
}

export function TemplateControls({
  templates,
  activeTemplate,
  isLoading,
  onLoadTemplate,
  onUpdateTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}: TemplateControlsProps) {
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const handleSaveTemplate = () => {
    onSaveTemplate(newTemplateName);
    setSaveDialogOpen(false);
    setNewTemplateName("");
  };

  return (
    <>
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-md mb-4">
        <FileText className="h-5 w-5 text-muted-foreground ml-1" />
        
        {templates.length > 0 ? (
          <div className="flex-1 flex gap-2">
            <Select
              value={activeTemplate}
              onValueChange={onLoadTemplate}
            >
              <SelectTrigger 
                className="flex-1 bg-background"
                disabled={isLoading}
              >
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem 
                    key={template.name} 
                    value={template.name}
                  >
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {activeTemplate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="size-9 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Template actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeleteTemplate(activeTemplate)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ) : (
          <div className="flex-1 text-sm text-muted-foreground px-3 py-1">
            No saved templates
          </div>
        )}
        
        {activeTemplate ? (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onUpdateTemplate}
            disabled={isLoading}
            title="Update current template with your changes"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Update
          </Button>
        ) : null}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          Save as
        </Button>
      </div>

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
              onClick={handleSaveTemplate}
              disabled={!newTemplateName.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 