import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store';
import websocket from '../utils/websocket';
import { Save, Users, Share2, ArrowLeft } from 'lucide-react';
import Button from './ui/Button';
import toast from 'react-hot-toast';
import CollaboratorModal from './CollaboratorModal';
import ShareModal from './ShareModal';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNote, fetchNote, updateNote, setCurrentNote, activeUsers, updateNoteFromWebSocket } = useNotesStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Load initial note data
    fetchNote(id).then(note => {
      setTitle(note.title);
      setContent(note.content || '');
    }).catch(err => {
      toast.error('Failed to load note');
      navigate('/dashboard');
    });

    // Join note room
    websocket.joinNote(id);

    // Event handler
    const handleNoteUpdate = (data) => {
      if (data.noteId === id) {
        setTitle(data.title);
        setContent(data.content);
        updateNoteFromWebSocket(data);
      }
    };

    // Attach listener
    websocket.on('note-updated', handleNoteUpdate);

    // Cleanup
    return () => {
      websocket.off('note-updated', handleNoteUpdate);
      websocket.leaveNote(id);
    };
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
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors flex-shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="text-lg sm:text-2xl font-bold border-none outline-none w-full bg-transparent truncate"
              placeholder="Untitled note"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          {activeUsers.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 mr-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{activeUsers.length} active</span>
            </div>
          )}

          {/* Mobile Active Indicator (Just dot) */}
          {activeUsers.length > 0 && (
            <div className="sm:hidden w-3 h-3 rounded-full bg-green-500 animate-pulse mr-1" title={`${activeUsers.length} active`} />
          )}

          <Button
            onClick={() => setShowCollaborators(true)}
            variant="secondary"
            size="sm"
            className="hidden sm:flex"
          >
            <Users size={16} className="mr-2" />
            Collaborators
          </Button>

          <Button
            onClick={() => setShowShare(true)}
            variant="secondary"
            size="sm"
            className="hidden sm:flex"
          >
            <Share2 size={16} className="mr-2" />
            Share
          </Button>

          {/* Mobile Icon Buttons */}
          <button
            onClick={() => setShowCollaborators(true)}
            className="p-2 hover:bg-gray-100 rounded-full sm:hidden text-gray-600"
          >
            <Users size={20} />
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="p-2 hover:bg-gray-100 rounded-full sm:hidden text-gray-600"
          >
            <Share2 size={20} />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <Button onClick={handleSave} loading={isSaving} size="sm" className="px-3 sm:px-4">
            <Save size={16} className="mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleContentChange}
        className="flex-1 p-6 border-none outline-none resize-none font-mono text-lg leading-relaxed bg-gray-50 focus:bg-white transition-colors"
        placeholder="Start typing your note here..."
      />

      {showCollaborators && (
        <CollaboratorModal
          noteId={id}
          onClose={() => setShowCollaborators(false)}
        />
      )}

      {showShare && (
        <ShareModal
          noteId={id}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
