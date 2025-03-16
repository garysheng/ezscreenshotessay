"use client";

import ScreenshotEssayGenerator from "@/components/screenshot-essay/ScreenshotEssayGenerator";

export default function ScreenshotEssayPage() {
  return (
    <div className="w-full h-screen max-h-screen overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        <ScreenshotEssayGenerator />
      </div>
    </div>
  );
}
