import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store';
import websocket from '../utils/websocket';
import { Save, Users, Share2, Activity } from 'lucide-react';
import Button from './ui/Button';
import toast from 'react-hot-toast';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNote, fetchNote, updateNote, setCurrentNote, activeUsers, updateNoteFromWebSocket } = useNotesStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    if (id) {
      fetchNote(id).then(note => {
        setTitle(note.title);
        setContent(note.content || '');
        websocket.joinNote(id);
      }).catch(err => {
        toast.error('Failed to load note');
        navigate('/dashboard');
      });
    }

    return () => {
      if (id) {
        websocket.leaveNote(id);
      }
    };
  }, [id]);

  useEffect(() => {
    const handleNoteUpdate = (data) => {
      if (data.noteId === id) {
        setTitle(data.title);
        setContent(data.content);
        updateNoteFromWebSocket(data);
      }
    };

    websocket.on('note-updated', handleNoteUpdate);
    return () => websocket.off('note-updated', handleNoteUpdate);
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await updateNote(id, { title, content });
      toast.success('Note saved');
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    websocket.startTyping(id);
    
    const timeout = setTimeout(() => {
      websocket.stopTyping(id);
      websocket.updateNote(id, { title, content: newContent });
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          className="text-2xl font-bold border-none outline-none flex-1"
          placeholder="Untitled note"
        />
        <div className="flex items-center gap-2">
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={16} />
              <span>{activeUsers.length} active</span>
            </div>
          )}
          <Button onClick={handleSave} loading={isSaving} size="sm">
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={handleContentChange}
        className="flex-1 p-6 border-none outline-none resize-none font-mono"
        placeholder="Start typing..."
      />
    </div>
  );
}
