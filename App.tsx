import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { Note } from './types';

// Mock data for first load
const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Welcome to Nebula Notes',
    content: 'This is a smart note-taking app powered by Gemini. \n\nTry selecting this text and using the "AI Tools" button to summarize or expand it.\n\nYou can also automatically generate tags based on your content.',
    tags: ['welcome', 'tutorial'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('nebula-notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nebula-notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    // Close sidebar on mobile when creating new
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const deleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (activeNoteId === id) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <main className="flex-1 h-full relative">
        {activeNote ? (
          <Editor 
            note={activeNote} 
            onUpdate={updateNote} 
            toggleSidebar={toggleSidebar}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
             <div className="mb-4 p-4 bg-white rounded-full shadow-sm">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-indigo-200">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
             <p className="text-lg font-medium text-gray-400">Select a note or create a new one</p>
             <button 
                onClick={createNote}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all md:hidden"
             >
                Create Note
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;