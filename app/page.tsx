"use client";

import ScreenshotEssayGenerator from "@/components/screenshot-essay/ScreenshotEssayGenerator";
import Link from "next/link";

export default function ScreenshotEssayPage() {
  return (
    <div className="container mx-auto py-4 pb-16 pt-16 flex flex-col min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold">EZScreenshotEssay.com</h1>
        <p className="text-sm text-muted-foreground sm:text-right">
          Create beautiful screenshots with custom styling, images, and watermarks
        </p>
      </div>
      
      <div className="flex-grow">
        <ScreenshotEssayGenerator />
      </div>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground border-t pt-6">
        <p>
          Made with ❤️ by{" "}
          <Link 
            href="https://x.com/garysheng" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Gary Sheng
          </Link>
          {" • "}
          <Link 
            href="https://github.com/garysheng/ezscreenshotessay" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            GitHub
          </Link>
        </p>
      </footer>
    </div>
  );
}
