import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Note, AIActionType } from '../types';
import { Sparkles, Tag, Clock, Save, Wand2, Loader2, List, FileText, SpellCheck, Type } from 'lucide-react';
import { processAIAction, generateNoteTags, generateNoteTitle } from '../services/gemini';

interface EditorProps {
  note: Note;
  onUpdate: (updatedNote: Note) => void;
  toggleSidebar: () => void;
}

const Editor: React.FC<EditorProps> = ({ note, onUpdate, toggleSidebar }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [showAITools, setShowAITools] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(note.updatedAt));
  
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal state when note prop changes (e.g. selecting different note)
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setLastSaved(new Date(note.updatedAt));
  }, [note.id]);

  // Debounced Save
  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== note.title || content !== note.content || JSON.stringify(tags) !== JSON.stringify(note.tags)) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [title, content, tags]);

  const handleSave = () => {
    const updatedNote = {
      ...note,
      title,
      content,
      tags,
      updatedAt: Date.now(),
    };
    onUpdate(updatedNote);
    setLastSaved(new Date());
  };

  const handleAIAction = async (action: AIActionType) => {
    setIsProcessingAI(true);
    setShowAITools(false);

    try {
      if (action === 'generate_tags') {
        const generatedTags = await generateNoteTags(content);
        if (generatedTags.length > 0) {
          // Merge unique tags
          const newTags = Array.from(new Set([...tags, ...generatedTags]));
          setTags(newTags);
        }
      } else if (action === 'generate_title') {
        const newTitle = await generateNoteTitle(content);
        setTitle(newTitle);
      } else {
        // Text manipulation actions
        let selectedText = "";
        const textarea = contentRef.current;
        
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            if (start !== end) {
                selectedText = content.substring(start, end);
            }
        }

        const result = await processAIAction(action, content, selectedText);
        
        if (selectedText && textarea) {
           // Replace selected text
           const newContent = content.substring(0, textarea.selectionStart) + result + content.substring(textarea.selectionEnd);
           setContent(newContent);
        } else {
            // Append if no selection (or specialized handling)
            if (action === 'summarize') {
                setContent(prev => prev + "\n\n### Summary\n" + result);
            } else {
                setContent(result);
            }
        }
      }
    } catch (error) {
      console.error("AI Action Failed", error);
      alert("Something went wrong with the AI request.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
        {/* Loading Overlay */}
        {isProcessingAI && (
            <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-indigo-500 mb-2 animate-spin" />
                    <span className="text-indigo-600 font-medium">Gemini is thinking...</span>
                </div>
            </div>
        )}

      {/* Header / Toolbar */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
            <List size={20} />
          </button>
          <div className="text-xs text-gray-400 flex items-center gap-1">
             <Clock size={12} />
             <span>Last saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
            <button 
                onClick={() => handleAIAction('generate_title')}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Auto-generate Title"
            >
                <Type size={18} />
            </button>
             <button 
                onClick={() => setShowAITools(!showAITools)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${showAITools ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
                <Sparkles size={16} />
                <span>AI Tools</span>
            </button>
            
            {/* AI Tools Dropdown */}
            {showAITools && (
                <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAITools(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden ring-1 ring-black/5 p-1 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Enhance</div>
                    <button onClick={() => handleAIAction('fix_grammar')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2">
                        <SpellCheck size={16} /> Fix Grammar
                    </button>
                    <button onClick={() => handleAIAction('elaborate')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2">
                        <Wand2 size={16} /> Make Longer
                    </button>
                    
                    <div className="my-1 border-t border-gray-100"></div>
                    
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Organize</div>
                    <button onClick={() => handleAIAction('summarize')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2">
                        <FileText size={16} /> Summarize
                    </button>
                    <button onClick={() => handleAIAction('generate_tags')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2">
                        <Tag size={16} /> Auto-Tag
                    </button>
                </div>
                </>
            )}
        </div>
      </header>

      {/* Title Input */}
      <div className="px-6 pt-6 pb-2 shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
        />
      </div>

      {/* Tags Input */}
      <div className="px-6 py-2 flex flex-wrap gap-2 items-center shrink-0 min-h-[40px]">
        {tags.map(tag => (
           <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 group">
             #{tag}
             <button onClick={() => removeTag(tag)} className="ml-1.5 text-gray-400 group-hover:text-red-500 focus:outline-none">
                &times;
             </button>
           </span> 
        ))}
        <div className="relative flex items-center">
            <Tag size={14} className="text-gray-400 absolute left-2" />
            <input 
                type="text" 
                placeholder="Add tag..."
                onKeyDown={handleTagInput}
                className="pl-7 pr-3 py-1 bg-transparent text-sm focus:outline-none focus:bg-gray-50 rounded-md placeholder-gray-400 transition-colors w-24 focus:w-48"
            />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 overflow-hidden flex flex-col">
        <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your thoughts..."
            className="w-full h-full resize-none focus:outline-none text-lg leading-relaxed text-gray-700 placeholder-gray-300 font-light"
        />
      </div>
    </div>
  );
};

export default Editor;