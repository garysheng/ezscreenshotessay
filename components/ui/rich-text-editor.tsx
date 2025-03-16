"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
}: RichTextEditorProps) {
  // Local state to handle SSR
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalChange = useRef(false);

  // Handle initial mounting and set the initial content
  useEffect(() => {
    setMounted(true);
    
    // Initialize the editor content on mount
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // Update the editor content when the value prop changes
  // But only if the change didn't originate from within the editor
  useEffect(() => {
    if (!mounted) return; // Skip during initial mount
    
    if (editorRef.current && !isInternalChange.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    
    // Reset the internal change flag
    isInternalChange.current = false;
  }, [value, mounted]);

  // Handle content edits
  const handleInput = () => {
    if (editorRef.current) {
      // Set flag to indicate this change came from inside the editor
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  // Reset all formatting and apply heading with toggle behavior
  const applyHeading = (level: 1 | 2 | 3 | 'p') => {
    if (!editorRef.current) return;
    
    // Focus the editor first
    editorRef.current.focus();
    
    // Get the current selection
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    try {
      // Check if we need to toggle off or apply new format
      let needsToToggleOff = false;
      
      // Get a reference to the current element
      const range = selection.getRangeAt(0);
      const parentEl = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement
        : range.commonAncestorContainer;
      
      // Check if we're already in a heading of this level
      if (parentEl && parentEl instanceof HTMLElement) {
        const tagName = parentEl.tagName.toLowerCase();
        if (level !== 'p' && tagName === `h${level}`) {
          needsToToggleOff = true;
        }
      }
      
      // Clear existing formatting first
      document.execCommand('removeFormat', false);
      
      // If we need to toggle off, just convert to paragraph
      if (needsToToggleOff) {
        document.execCommand('formatBlock', false, 'p');
      } 
      // Otherwise apply the requested format
      else if (level === 'p') {
        document.execCommand('formatBlock', false, 'p');
      } else {
        // For headings, we first normalize to paragraph, then apply heading
        document.execCommand('formatBlock', false, 'p');
        document.execCommand('formatBlock', false, `h${level}`);
      }
    } catch (e) {
      console.error("Error applying heading format:", e);
      // Fallback to simple format
      if (level === 'p') {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, `h${level}`);
      }
    }
    
    // Notify about the change
    handleInput();
  };

  // Apply basic formatting
  const applyFormat = (command: string, value?: string) => {
    // Focus the editor before applying command to ensure it works
    editorRef.current?.focus();
    
    // Apply the formatting command
    document.execCommand(command, false, value || "");
    
    // Ensure lists get proper styling
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      // Give the browser a moment to apply the command
      setTimeout(() => {
        if (editorRef.current) {
          // Make sure lists have the correct styling
          const lists = editorRef.current.querySelectorAll('ul, ol');
          lists.forEach(list => {
            if (list instanceof HTMLElement) {
              list.style.paddingLeft = '1.5em';
              list.style.margin = '0.5em 0';
            }
          });
          
          // And notify about the change
          handleInput();
        }
      }, 10);
    } else {
      // For other commands, notify immediately
      handleInput();
    }
  };

  // Helper for lists
  const toggleList = (type: 'ul' | 'ol') => {
    editorRef.current?.focus();
    
    // Use the appropriate command based on list type
    const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
    document.execCommand(command, false);
    
    // Need to manually trigger the input handler
    handleInput();
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        editorRef.current?.focus();
        document.execCommand('insertImage', false, e.target.result as string);
        handleInput();
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (!mounted) {
    return (
      <div className={cn(
        "min-h-[200px] w-full border rounded-md bg-muted/20",
        className
      )} />
    );
  }

  return (
    <div className={cn("rich-text-editor border rounded-md overflow-hidden relative", className)}>
      {/* Simple formatting toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted">
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyHeading(1)}
          title="Heading 1"
        >
          H1
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyHeading(2)}
          title="Heading 2"
        >
          H2
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyHeading(3)}
          title="Heading 3"
        >
          H3
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyHeading('p')}
          title="Paragraph"
        >
          P
        </button>
        <span className="h-6 w-px bg-border mx-1"></span>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyFormat('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyFormat('italic')}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyFormat('underline')}
          title="Underline"
        >
          <u>U</u>
        </button>
        <span className="h-6 w-px bg-border mx-1"></span>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => toggleList('ol')}
          title="Numbered List"
        >
          1.
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => toggleList('ul')}
          title="Bullet List"
        >
          •
        </button>
        <span className="h-6 w-px bg-border mx-1"></span>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={triggerImageUpload}
          title="Upload Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        
        {/* Hidden file input for image upload */}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {/* Editable content area with styling for lists */}
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] outline-none focus:ring-0 prose max-w-none bg-background editor-content"
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{ 
          minHeight: '200px',
          wordBreak: 'break-word'
        }}
      />

      <style jsx global>{`
        .editor-content ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .editor-content ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .editor-content li {
          margin: 0.25em 0;
        }
        
        .editor-content h1 {
          font-size: 2em;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
          font-weight: bold;
        }
        
        .editor-content h2 {
          font-size: 1.5em;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
          font-weight: bold;
        }
        
        .editor-content h3 {
          font-size: 1.17em;
          margin-top: 1em;
          margin-bottom: 1em;
          font-weight: bold;
        }
        
        .editor-content img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
      `}</style>
      
      {/* Placeholder text display */}
      {value === "" && (
        <div 
          className="absolute top-[calc(3.5rem+4px)] left-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        >
          {placeholder}
        </div>
      )}
    </div>
  );
} 