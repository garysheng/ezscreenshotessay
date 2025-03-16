"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LexicalEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
}: LexicalEditorProps) {
  // Simple loading state for SSR
  const [mounted, setMounted] = useState(false);
  
  // Refs for DOM elements
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef(value);
  const skipNextSyncRef = useRef(false);
  const isInitializedRef = useRef(false);
  
  // Initialize on mount
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
    
    // Initialize editor content if not already done
    if (editorRef.current && !isInitializedRef.current) {
      // Initialize with content and ensure it's not empty
      editorRef.current.innerHTML = value || '';
      contentRef.current = value || '';
      isInitializedRef.current = true;
    }
  }, [mounted, value]);
  
  // Add a separate effect just for initialization to avoid race conditions
  useEffect(() => {
    // Secondary check after the component is fully rendered
    if (mounted && editorRef.current && editorRef.current.innerHTML === '') {
      if (value) {
        editorRef.current.innerHTML = value;
        contentRef.current = value;
      }
    }
  }, [mounted, value]);
  
  // Sync external value changes to the editor
  useEffect(() => {
    // Skip if we're not mounted yet
    if (!mounted) return;
    
    // Skip if the change originated from this editor
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    
    // If externally changed value doesn't match our tracked value, update editor
    if (value !== contentRef.current && editorRef.current) {
      // Remember active element
      const activeElement = document.activeElement;
      
      // Remember selection
      let selection = null;
      
      if (activeElement === editorRef.current && window.getSelection) {
        const currentSelection = window.getSelection();
        if (currentSelection && currentSelection.rangeCount > 0) {
          selection = currentSelection.getRangeAt(0).cloneRange();
        }
      }
      
      // Update content, handling empty strings properly
      editorRef.current.innerHTML = value || '';
      contentRef.current = value || '';
      
      // Restore focus if needed
      if (activeElement === editorRef.current) {
        editorRef.current.focus();
        
        // Try to restore selection
        if (selection && window.getSelection) {
          const currentSelection = window.getSelection();
          if (currentSelection) {
            try {
              currentSelection.removeAllRanges();
              currentSelection.addRange(selection);
            } catch (e) {
              console.error("Failed to restore selection", e);
            }
          }
        }
      }
    }
  }, [value, mounted]);
  
  // Handle user content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const html = editorRef.current.innerHTML;
    
    // Only trigger if content has actually changed
    if (html !== contentRef.current) {
      // Update our reference
      contentRef.current = html;
      
      // Signal we should skip the next sync
      skipNextSyncRef.current = true;
      
      // Notify parent
      onChange(html);
    }
  }, [onChange]);
  
  // Apply basic formatting
  const applyFormat = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value || '');
    handleContentChange();
  }, [handleContentChange]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Check for Ctrl/Cmd+B (Bold)
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      applyFormat('bold');
    }
    
    // Check for Ctrl/Cmd+I (Italic)
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      applyFormat('italic');
    }
  }, [applyFormat]);
  
  // Insert a horizontal line
  const insertHorizontalRule = useCallback(() => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand('insertHorizontalRule');
    handleContentChange();
  }, [handleContentChange]);
  
  // Format application functions
  const applyHeading = useCallback((level: 1 | 2 | 3 | 'p') => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    try {
      // Check if we need to toggle
      let shouldToggleOff = false;
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentEl = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentElement
          : range.commonAncestorContainer;
        
        if (parentEl && parentEl instanceof HTMLElement) {
          const tagName = parentEl.tagName.toLowerCase();
          if (level !== 'p' && tagName === `h${level}`) {
            shouldToggleOff = true;
          }
        }
      }
      
      // Apply formatting
      if (shouldToggleOff) {
        document.execCommand('formatBlock', false, 'p');
      } else if (level === 'p') {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, `h${level}`);
      }
      
      handleContentChange();
    } catch (e) {
      console.error('Error applying heading', e);
    }
  }, [handleContentChange]);
  
  // Toggle lists
  const toggleList = useCallback((type: 'ul' | 'ol') => {
    editorRef.current?.focus();
    const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
    document.execCommand(command, false);
    handleContentChange();
  }, [handleContentChange]);
  
  // Toggle blockquote with left bar styling
  const toggleBlockquote = useCallback(() => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Check if we're in a blockquote already
    const selection = window.getSelection();
    let blockquoteToRemove = null;
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let parentEl = range.commonAncestorContainer;
      
      if (parentEl.nodeType === Node.TEXT_NODE) {
        parentEl = parentEl.parentElement;
      }
      
      // Find if we're inside a blockquote
      let currentEl = parentEl;
      while (currentEl && currentEl !== editorRef.current) {
        if (currentEl instanceof HTMLElement && currentEl.tagName.toLowerCase() === 'blockquote') {
          blockquoteToRemove = currentEl;
          break;
        }
        currentEl = currentEl.parentElement;
      }
    }
    
    if (blockquoteToRemove) {
      // We're in a blockquote, so unwrap it
      const fragment = document.createDocumentFragment();
      while (blockquoteToRemove.firstChild) {
        fragment.appendChild(blockquoteToRemove.firstChild);
      }
      blockquoteToRemove.parentNode?.replaceChild(fragment, blockquoteToRemove);
    } else {
      // We're not in a blockquote, so create one
      document.execCommand('formatBlock', false, 'blockquote');
      
      // Find the created blockquote and add styling
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let parentEl = range.commonAncestorContainer;
        
        if (parentEl.nodeType === Node.TEXT_NODE) {
          parentEl = parentEl.parentElement;
        }
        
        // Find our newly created blockquote
        let currentEl = parentEl;
        while (currentEl && currentEl !== editorRef.current) {
          if (currentEl instanceof HTMLElement && currentEl.tagName.toLowerCase() === 'blockquote') {
            // Add the bar quote styling with current text color
            currentEl.style.borderLeft = '4px solid currentColor';
            currentEl.style.paddingLeft = '1rem';
            currentEl.style.marginLeft = '0';
            currentEl.style.fontStyle = 'italic';
            break;
          }
          currentEl = currentEl.parentElement;
        }
      }
    }
    
    handleContentChange();
  }, [handleContentChange]);
  
  // Handle image uploads
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertImage', false, event.target.result.toString());
        handleContentChange();
      }
    };
    
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleContentChange]);

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
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted">
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyHeading(1)}
        >
          H1
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyHeading(2)}
        >
          H2
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyHeading(3)}
        >
          H3
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyHeading('p')}
        >
          P
        </button>
        <span className="h-6 w-px bg-border mx-1"></span>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyFormat('bold')}
        >
          <strong>B</strong>
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyFormat('italic')}
        >
          <em>I</em>
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => applyFormat('underline')}
        >
          <u>U</u>
        </button>
        <span className="h-6 w-px bg-border mx-1"></span>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => toggleList('ol')}
        >
          1.
        </button>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => toggleList('ul')}
        >
          •
        </button>
        <span className="h-6 w-px bg-border mx-1"></span>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={insertHorizontalRule}
          title="Insert Horizontal Line"
        >
          —
        </button>
        <span className="h-6 w-px bg-border mx-1"></span>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => toggleBlockquote()}
          title="Bar Quote"
        >
          <span className="inline-block w-4 border-l-4 border-current h-5 mx-0.5"></span>
        </button>
        <span className="h-6 w-px bg-border mx-1"></span>
        <button 
          type="button" 
          className="p-1 rounded hover:bg-muted-foreground/20"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] outline-none focus:ring-0 prose max-w-none bg-background editor-content"
        contentEditable
        onInput={handleContentChange}
        onBlur={handleContentChange}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={mounted ? undefined : { __html: value }}
        style={{ 
          minHeight: '200px',
          wordBreak: 'break-word'
        }}
      />

      {/* Hidden styles for rendered content */}
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
        
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        
        .editor-content blockquote {
          border-left: 4px solid currentColor !important;
          padding-left: 1rem !important;
          margin-left: 0 !important;
          font-style: italic !important;
          color: inherit !important;
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
        }
      `}</style>
    </div>
  );
} 