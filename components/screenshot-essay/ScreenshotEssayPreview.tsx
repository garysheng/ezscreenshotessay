"use client";

import { useRef, useState, useEffect } from "react";
import { ScreenshotEssayOptions } from "@/types";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

interface ScreenshotEssayPreviewProps {
  options: ScreenshotEssayOptions;
  onDownload?: () => void; // Optional callback for parent component to handle download
}

export default function ScreenshotEssayPreview({ options, onDownload }: ScreenshotEssayPreviewProps) {
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
    
    // Get maximum available width (container width minus padding)
    const maxWidth = Math.max(300, containerWidth - 48); // 24px padding on each side
    
    // If height is set, use aspect ratio to calculate width
    if (options.height) {
      return Math.min(maxWidth, options.height * parseAspectRatio());
    }
    
    // Use a sensible default maximum width
    return Math.min(maxWidth, 800);
  };
  
  // Calculate height based on width and aspect ratio
  const calculateHeight = () => {
    if (options.height) return options.height;
    
    const width = calculateWidth();
    const aspectRatio = parseAspectRatio();
    
    // Calculate height from width and aspect ratio
    return Math.round(width / aspectRatio);
  };
  
  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    // Set initial width
    updateWidth();
    
    // Listen for resize events
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate auto-scaled font size based on container width and content volume
  const calculateFontSize = () => {
    // Get the calculated width
    const width = calculateWidth();
    
    // Base calculation on container width only
    const minWidth = 400;
    const maxWidth = 1200;
    const minFontSize = 14;
    const maxFontSize = 24;
    
    // Clamp width to our min/max range
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, width));
    
    // Linear interpolation for base font size based on width
    let fontSize = minFontSize + 
      (maxFontSize - minFontSize) * 
      (clampedWidth - minWidth) / 
      (maxWidth - minWidth);
    
    // Apply the user's text density factor as the final adjustment
    // This is now the only factor that affects font size
    // Halve the scaling effect so 50% is now 25%, 100% is 50%, etc.
    const textDensity = options.textDensity || 1.0;
    fontSize *= (textDensity * 0.5);
    
    // Round to nearest 0.5
    return Math.round(fontSize * 2) / 2;
  };
  
  // Get the effective font size (auto-calculated or user-specified)
  const effectiveFontSize = calculateFontSize();

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    try {
      const dataUrl = await toPng(previewRef.current, { quality: 0.95 });
      saveAs(dataUrl, "ezscreenshotessay.png");
      // Call parent callback if provided
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  // Create diagonal watermark
  const renderDiagonalWatermark = () => {
    const { diagonal } = options.watermarks;
    if (!diagonal.enabled) return null;
    
    const watermarkText = diagonal.text || '@username';
    const fontSize = `${36 * (diagonal.size ?? 1.0)}px`;
    
    return (
      <div 
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
      >
        <div
          className="absolute whitespace-nowrap"
          style={{
            transform: 'rotate(-45deg)',
            fontSize,
            fontWeight: 'bold',
            opacity: diagonal.opacity,
            color: options.textColor,
            textAlign: 'center',
            width: '150%',
            letterSpacing: `${2 * (diagonal.size ?? 1.0)}px`,
          }}
        >
          {watermarkText}
        </div>
      </div>
    );
  };

  // Create bottom right watermark
  const renderBottomRightWatermark = () => {
    const { bottomRight } = options.watermarks;
    if (!bottomRight.enabled) return null;
    
    return (
      <div 
        className="absolute bottom-4 right-4 text-sm z-20"
        style={{ 
          opacity: bottomRight.opacity,
          color: options.textColor,
        }}
      >
        {bottomRight.text}
      </div>
    );
  };

  // Determine if we need extra bottom padding for watermark
  const needsExtraBottomPadding = options.watermarks.bottomRight.enabled;
  
  // Calculate content padding - ensure minimum bottom padding when watermark is present
  const contentPadding = {
    paddingTop: `${options.padding}px`,
    paddingRight: `${options.padding}px`,
    paddingBottom: needsExtraBottomPadding ? `${Math.max(options.padding, 46)}px` : `${options.padding}px`,
    paddingLeft: `${options.padding}px`,
  };

  // Custom styles for rich text content with images
  const richTextStyles = `
    /* Debug styles to see element outlines */
    .rich-text-content * {
      /*outline: 1px solid rgba(255, 0, 0, 0.1);*/
    }
    
    .rich-text-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1rem 0;
      display: block;
    }

    /* More specific and stronger selectors for headings */
    .rich-text-content h1,
    .rich-text-content h1.h1,
    .rich-text-content > h1 {
      font-size: 2em !important;
      margin-top: 0.67em !important;
      margin-bottom: 0.67em !important;
      font-weight: bold !important;
      line-height: 1.2 !important;
    }
    
    .rich-text-content h2,
    .rich-text-content h2.h2,
    .rich-text-content > h2 {
      font-size: 1.5em !important;
      margin-top: 0.83em !important;
      margin-bottom: 0.83em !important;
      font-weight: bold !important;
      line-height: 1.3 !important;
    }
    
    .rich-text-content h3,
    .rich-text-content h3.h3,
    .rich-text-content > h3 {
      font-size: 1.17em !important;
      margin-top: 1em !important;
      margin-bottom: 1em !important;
      font-weight: bold !important;
      line-height: 1.4 !important;
    }

    /* List styles */
    .rich-text-content ul {
      list-style-type: disc !important;
      padding-left: 1.5em !important;
      margin: 0.5em 0 !important;
    }
    
    .rich-text-content ol {
      list-style-type: decimal !important;
      padding-left: 1.5em !important;
      margin: 0.5em 0 !important;
    }
    
    .rich-text-content li {
      margin: 0.25em 0 !important;
      display: list-item !important;
    }
  `;

  // Get calculated dimensions
  const effectiveWidth = calculateWidth();
  const effectiveHeight = calculateHeight();

  // Add CSS styles for the responsive preview container
  const responsivePreviewStyles = `
    .aspect-container {
      transition: all 0.3s ease-in-out;
    }
    
    .aspect-container:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    @media (max-width: 640px) {
      .aspect-container {
        width: 100% !important;
      }
    }
  `;

  return (
    <div className="flex flex-col gap-4 w-full" ref={containerRef}>
      {/* Add custom styles for rich text content */}
      <style jsx global>{richTextStyles}</style>
      
      {/* Add responsive preview styles */}
      <style jsx global>{responsivePreviewStyles}</style>
      
      <div className="w-full relative">
        <div className="flex justify-center">
          <div 
            className="w-full max-w-full relative aspect-container"
            style={{
              maxWidth: `${effectiveWidth}px`,
            }}
          >
            {/* Main preview container - clean, simplified version */}
            <div 
              ref={previewRef}
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: options.aspectRatio ? options.aspectRatio.replace(':', '/') : '16/9',
                backgroundColor: options.useTexture || options.customBackgroundImage ? 'transparent' : options.backgroundColor,
                borderRadius: `${options.borderRadius}px`,
                // Remove any extra borders or shadows
                border: 'none',
                boxShadow: 'none',
                overflow: 'hidden',
              }}
            >
              {/* Paper texture background */}
              {options.useTexture && (
                <div 
                  className="absolute inset-0 z-0" 
                  style={{
                    backgroundImage: `url('/textures/paper.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: options.backgroundOpacity,
                  }}
                />
              )}
              
              {/* Custom background image */}
              {!options.useTexture && options.customBackgroundImage && (
                <div 
                  className="absolute inset-0 z-0" 
                  style={{
                    backgroundImage: `url('${options.customBackgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: options.backgroundOpacity,
                  }}
                />
              )}
              
              {/* Solid color background with opacity */}
              {!options.useTexture && !options.customBackgroundImage && (
                <div 
                  className="absolute inset-0 z-0" 
                  style={{
                    backgroundColor: options.backgroundColor,
                    opacity: 1, // Use full opacity to prevent seeing through
                  }}
                />
              )}
              
              {/* Content section */}
              <div 
                className="relative z-10 rich-text-content w-full h-full"
                style={{ 
                  ...contentPadding,
                  fontSize: `${effectiveFontSize}px`,
                  lineHeight: options.lineHeight,
                  color: options.textColor,
                  fontFamily: options.fontFamily,
                  backgroundColor: 'transparent',
                  overflow: 'hidden',
                }}
                dangerouslySetInnerHTML={{ 
                  __html: options.content.replace(/<h1/g, '<h1 class="h1"')
                                        .replace(/<h2/g, '<h2 class="h2"')
                                        .replace(/<h3/g, '<h3 class="h3"')
                }}
              />
              
              {/* Watermarks */}
              {renderDiagonalWatermark()}
              {renderBottomRightWatermark()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the download function for parent components
export { toPng, saveAs }; 