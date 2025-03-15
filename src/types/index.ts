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
  width: number;
  height?: number; // Optional fixed height
  fontSize: number;
  autoScale: boolean; // Whether to automatically scale text based on dimensions
  lineHeight: number;
  padding: number;
  borderRadius: number;
  fontFamily: string;
  
  // Background
  backgroundColor: string;
  textColor: string;
  useTexture: boolean;
  
  // Watermarks
  watermarks: {
    bottomRight: WatermarkConfig;
    diagonal: WatermarkConfig;
  };
} 