import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore, useAuthStore } from '../store';
import { Plus, Search, LogOut, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { notes, fetchNotes, createNote, searchNotes, loading } = useNotesStore();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async () => {
    try {
      const note = await createNote({ title: 'Untitled Note', content: '' });
      navigate(`/notes/${note.id}`);
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      searchNotes(query);
    } else {
      fetchNotes();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button onClick={handleCreateNote}>
            <Plus size={20} className="mr-2" />
            New Note
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No notes yet</p>
            <Button onClick={handleCreateNote}>Create your first note</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                hover
                className="cursor-pointer"
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {note.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {note.content || 'Empty note'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDistanceToNow(new Date(note.updated_at))} ago</span>
                  {note.collaborator_count > 1 && (
                    <span>{note.collaborator_count} collaborators</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
