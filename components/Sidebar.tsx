import React, { useMemo } from 'react';
import { Note } from '../types';
import { Plus, Search, Trash2, Menu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (e: React.MouseEvent, id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  setSearchQuery,
  isOpen,
  toggleSidebar
}) => {
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const lowerQuery = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [notes, searchQuery]);

  // Mobile sidebar overlay
  const mobileClasses = isOpen ? "translate-x-0" : "-translate-x-full";
  
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 md:translate-x-0 ${mobileClasses}`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Nebula</span>
          </div>
          <button onClick={onCreateNote} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors" title="New Note">
            <Plus size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              {searchQuery ? "No matching notes found" : "Create your first note"}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  onSelectNote(note.id);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  activeNoteId === note.id
                    ? "bg-indigo-50 border-indigo-100 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <h3 className={`font-medium mb-1 truncate pr-6 ${activeNoteId === note.id ? "text-indigo-900" : "text-gray-800"}`}>
                  {note.title || "Untitled Note"}
                </h3>
                <p className="text-xs text-gray-500 truncate mb-2">
                  {note.content || "No additional text"}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 overflow-hidden">
                        {note.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="inline-block px-1.5 py-0.5 text-[10px] bg-gray-200 text-gray-600 rounded-full truncate max-w-[60px]">
                                #{tag}
                            </span>
                        ))}
                        {note.tags.length > 2 && <span className="text-[10px] text-gray-400">+{note.tags.length - 2}</span>}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {formatDistanceToNow(note.updatedAt, { addSuffix: true }).replace('about ', '')}
                    </span>
                </div>
                
                <button
                  onClick={(e) => onDeleteNote(e, note.id)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;