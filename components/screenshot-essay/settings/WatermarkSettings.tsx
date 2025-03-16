import { SettingsSection } from "./SettingsSection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { WatermarkConfig } from "@/types";

interface WatermarkSettingsProps {
  bottomRight: WatermarkConfig;
  diagonal: WatermarkConfig;
  onBottomRightChange: (config: Partial<WatermarkConfig>) => void;
  onDiagonalChange: (config: Partial<WatermarkConfig>) => void;
}

export function WatermarkSettings({
  bottomRight,
  diagonal,
  onBottomRightChange,
  onDiagonalChange,
}: WatermarkSettingsProps) {
  return (
    <SettingsSection title="Watermarks" colorClass="bg-purple-50 dark:bg-purple-900/20">
      {/* Bottom Right Watermark */}
      <div className="space-y-4 border border-border bg-background rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Bottom Right Watermark</h4>
          <Switch
            id="bottomRightEnabled"
            checked={bottomRight.enabled}
            onCheckedChange={(checked) => 
              onBottomRightChange({ enabled: checked })
            }
          />
        </div>
        
        {bottomRight.enabled && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bottomRightText">Watermark Text</Label>
              <Input
                id="bottomRightText"
                value={bottomRight.text}
                onChange={(e) => onBottomRightChange({ text: e.target.value })}
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
            checked={diagonal.enabled}
            onCheckedChange={(checked) => 
              onDiagonalChange({ enabled: checked })
            }
          />
        </div>
        
        {diagonal.enabled && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="diagonalText">Watermark Text</Label>
              <Input
                id="diagonalText"
                value={diagonal.text}
                onChange={(e) => onDiagonalChange({ text: e.target.value })}
                placeholder="e.g. @yourusername"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="diagonalOpacity">
                  Opacity: {Math.round(diagonal.opacity * 100)}%
                </Label>
              </div>
              <Slider
                id="diagonalOpacity"
                min={0.02}
                max={0.2}
                step={0.02}
                value={[diagonal.opacity]}
                onValueChange={(value: number[]) => 
                  onDiagonalChange({ opacity: value[0] })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="diagonalSize">
                  Size: {Math.round((diagonal.size ?? 1.0) * 100)}%
                </Label>
              </div>
              <Slider
                id="diagonalSize"
                min={0.5}
                max={2.0}
                step={0.1}
                value={[diagonal.size ?? 1.0]}
                onValueChange={(value: number[]) => 
                  onDiagonalChange({ size: value[0] })
                }
              />
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  );
} 