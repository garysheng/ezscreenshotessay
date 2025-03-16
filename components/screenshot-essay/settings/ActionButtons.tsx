import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";

interface ActionButtonsProps {
  onReset: () => void;
  onSave: () => void;
}

export function ActionButtons({ onReset, onSave }: ActionButtonsProps) {
  return (
    <div className="flex justify-between items-center">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReset}
        className="gap-1"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
      <Button 
        variant="default" 
        size="sm" 
        onClick={onSave}
        className="gap-1"
        title="Your settings will be automatically remembered when you return to the site next time"
      >
        <Save className="h-4 w-4" />
        Save to local storage
      </Button>
    </div>
  );
} 