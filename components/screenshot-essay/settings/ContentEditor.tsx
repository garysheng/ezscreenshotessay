import { SettingsSection } from "./SettingsSection";
import { LexicalEditor } from "@/components/ui/lexical-editor";

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  return (
    <SettingsSection title="Content" colorClass="bg-yellow-50 dark:bg-yellow-900/20">
      <div className="space-y-2">
        <LexicalEditor
          value={content}
          onChange={onChange}
          placeholder="Enter your essay content here..."
          className="min-h-[200px]"
        />
      </div>
    </SettingsSection>
  );
} 