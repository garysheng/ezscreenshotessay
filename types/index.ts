export interface WatermarkConfig {
  type: 'none' | 'text' | 'diagonal' | 'image';
  text: string;
  imageUrl?: string;
  opacity: number;
  enabled: boolean;
  size?: number; // Size multiplier for the watermark (1.0 = default size)
}

export interface ScreenshotEssayOptions {
  // Content
  content: string;
  
  // Appearance
  width?: number; // Optional fixed width - will be calculated from container if not provided
  height?: number; // Optional fixed height
  aspectRatio?: string; // Aspect ratio in format like "16:9", "4:3", "1:1"
  fontSize: number;
  autoScale?: boolean; // Whether to auto-scale text to fit container
  textDensity?: number; // Control how tightly packed text appears (0.5 to 1.5)
  lineHeight: number;
  padding: number;
  borderRadius: number;
  fontFamily: string;
  
  // Background
  backgroundColor: string;
  textColor: string;
  useTexture: boolean;
  customBackgroundImage?: string; // Base64 encoded image or URL
  backgroundOpacity: number; // Opacity for the background image (0.0 to 1.0)
  
  // Watermarks
  watermarks: {
    bottomRight: WatermarkConfig;
    diagonal: WatermarkConfig;
  };
} 