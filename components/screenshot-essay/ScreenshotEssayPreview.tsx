"use client";

import { useRef, useState, useEffect } from "react";
import { ScreenshotEssayOptions } from "@/types";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

interface ScreenshotEssayPreviewProps {
  options: ScreenshotEssayOptions;
  onDownload?: () => void; // Optional callback for parent component to handle download
}

export default function ScreenshotEssayPreview({ options }: ScreenshotEssayPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Parse aspect ratio (default to 16:9 if not specified)
  const parseAspectRatio = () => {
    const aspectRatio = options.aspectRatio || '16:9';
    const [width, height] = aspectRatio.split(':').map(Number);
    return width / height;
  };

  // Calculate width based on container size or use fixed width if provided
  const calculateWidth = () => {
    if (options.width) return options.width;
    return Math.min(containerWidth || 800, 1200); // Clamp width to 1200px max
  };

  // Calculate height based on aspect ratio or use fixed height if provided
  const calculateHeight = () => {
    if (options.height) return options.height;
    
    const width = calculateWidth();
    const ratio = parseAspectRatio();
    return width / ratio;
  };

  // Get effective font size based on text density
  const getEffectiveFontSize = () => {
    const baseFontSize = options.fontSize || 16;
    const density = options.textDensity || 1.5;
    return baseFontSize * (density / 1.5);
  };

  // Resize handler
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 16); // Account for some padding
      }
    };

    // Initial update
    updateContainerWidth();

    // Update on window resize
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  // Get container style
  const containerStyle = {
    '--preview-width': `${calculateWidth()}px`,
    '--preview-height': `${calculateHeight()}px`,
    width: 'var(--preview-width)',
    height: 'var(--preview-height)',
    backgroundColor: options.backgroundColor,
    borderRadius: `${options.borderRadius}px`,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties;

  // Add background image or texture if specified
  const backgroundStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: options.backgroundOpacity || 0.5,
  } as React.CSSProperties;

  if (options.useTexture) {
    backgroundStyle.backgroundImage = 'url("/paper-texture.png")';
    backgroundStyle.backgroundSize = 'cover';
  } else if (options.customBackgroundImage) {
    backgroundStyle.backgroundImage = `url("${options.customBackgroundImage}")`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
  }

  // Create diagonal watermark pattern
  const diagonalWatermarkStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'auto',
    backgroundRepeat: 'repeat',
    opacity: options.watermarks.diagonal.opacity,
    pointerEvents: 'none',
    color: options.textColor || '#000',
  } as React.CSSProperties;

  // Get content style with padding
  const contentStyle = {
    padding: `${options.padding}px`,
    color: options.textColor,
    fontFamily: options.fontFamily || 'system-ui, sans-serif',
    fontSize: `${getEffectiveFontSize()}px`,
    lineHeight: options.lineHeight || 1.5,
    overflowWrap: 'break-word',
    height: '100%',
    position: 'relative',
    zIndex: 2,
  } as React.CSSProperties;

  // Calculate watermark size based on container dimensions
  const getWatermarkSize = () => {
    // Base size on smaller dimension - either width or height
    const smallerDimension = Math.min(calculateWidth(), calculateHeight());
    const sizeMultiplier = options.watermarks.diagonal.size || 1.0;
    return Math.max(smallerDimension * 0.15 * sizeMultiplier, 30); // Min 30px, scale with container size
  };

  // Generate watermark pattern on the fly using CSS
  const createDiagonalPattern = () => {
    if (!options.watermarks.diagonal.enabled || !options.watermarks.diagonal.text) {
      return {};
    }

    // Calculate watermark sizing based on container size
    const watermarkSize = getWatermarkSize();
    const fontSize = watermarkSize * 0.5; // 50% of the watermark size
    
    return {
      backgroundImage: `repeating-linear-gradient(
        -45deg,
        transparent,
        transparent ${watermarkSize * 0.5}px,
        currentColor ${watermarkSize * 0.5}px,
        currentColor ${watermarkSize * 0.6}px
      )`,
      fontSize: `${fontSize}px`,
      lineHeight: `${fontSize * 1.2}px`,
      fontFamily: options.fontFamily,
    };
  };

  // Create bottom right watermark style
  const bottomWatermarkStyle = {
    position: 'absolute',
    right: `${options.padding / 2}px`,
    bottom: `${options.padding / 2}px`,
    fontFamily: options.fontFamily || 'system-ui, sans-serif',
    fontSize: `${getEffectiveFontSize() * 0.8}px`, 
    color: options.textColor,
    opacity: 0.7,
    zIndex: 3,
    pointerEvents: 'none',
  } as React.CSSProperties;

  // Render the preview
  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: '100%' }}>
      <div ref={previewRef} style={containerStyle} data-preview-content="true">
        {/* Background layer */}
        {(options.useTexture || options.customBackgroundImage) && (
          <div style={backgroundStyle} />
        )}
        
        {/* Diagonal watermark layer - text provided in content props */}
        {options.watermarks.diagonal.enabled && options.watermarks.diagonal.text && (
          <div 
            style={{
              ...diagonalWatermarkStyle,
              ...createDiagonalPattern()
            }} 
            className="diagonal-watermark"
            aria-hidden="true"
          >
            <div className="sr-only">{options.watermarks.diagonal.text} (Diagonal Watermark)</div>
          </div>
        )}
        
        {/* Content layer */}
        <div 
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: options.content }}
        />
        
        {/* Bottom right watermark */}
        {options.watermarks.bottomRight.enabled && options.watermarks.bottomRight.text && (
          <div style={bottomWatermarkStyle} aria-hidden="true">
            {options.watermarks.bottomRight.text}
          </div>
        )}
      </div>
    </div>
  );
}

// Export these functions so they can be used by the parent component
export { toPng, saveAs }; 