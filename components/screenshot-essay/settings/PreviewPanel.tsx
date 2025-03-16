import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PreviewPanelProps {
  children: ReactNode;
  onDownload: () => void;
  isLargeScreen: boolean;
}

export function PreviewPanel({ children, onDownload, isLargeScreen }: PreviewPanelProps) {
  const gridStyles = {
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
  };

  if (isLargeScreen) {
    return (
      <div 
        className="h-full overflow-y-auto dark:bg-slate-900 dark:[--grid-color:rgba(255,255,255,0.07)] dark:[--grid-bg:#111827]"
        style={gridStyles}
      >
        {/* Download button outside of the preview content container for better positioning */}
        <div className="sticky top-0 right-0 p-2 flex justify-end z-20 bg-gradient-to-b from-white/80 to-transparent dark:from-slate-900/80">
          <Button 
            onClick={onDownload} 
            className="gap-2 hover:scale-105 transition-transform hover:shadow-md"
            size="sm"
          >
            <Download size={16} />
            Download PNG
          </Button>
        </div>
        <div className="p-6 flex justify-center items-center">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 bg-slate-50 dark:bg-slate-900 pb-8 pt-2 rounded-t-xl shadow-lg">      
      {/* Preview header with better styling */}
      <div className="flex justify-between items-center mb-6 px-4 py-2 bg-black dark:bg-white text-white dark:text-black mx-4 rounded-md">
        <h3 className="text-xl font-bold">Preview</h3>
        {/* Mobile download button */}
        <Button 
          onClick={onDownload} 
          className="gap-1 hover:scale-105 transition-transform hover:shadow-md bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90"
          size="sm"
        >
          <Download size={16} />
          Download
        </Button>
      </div>
      <div 
        className="rounded-md mx-4 p-6 flex justify-center"
        style={gridStyles}
      >
        {children}
      </div>
    </div>
  );
} 