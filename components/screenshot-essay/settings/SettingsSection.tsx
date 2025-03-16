import { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  colorClass?: string;
}

/**
 * A reusable component for rendering a settings section with a title and colored background
 */
export function SettingsSection({ title, children, colorClass = "bg-gray-50 dark:bg-gray-900/20" }: SettingsSectionProps) {
  return (
    <div className={`rounded-lg border border-border ${colorClass} p-4 space-y-4`}>
      <h3 className="text-lg font-medium">{title}</h3>
      {children}
    </div>
  );
} 