import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareAPI } from '../utils/api';
import Card from '../components/ui/Card';
import { Lock } from 'lucide-react';

export default function SharedNote() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedNote();
  }, [token]);

  const loadSharedNote = async () => {
    try {
      const response = await shareAPI.getSharedNote(token);
      setNote(response.data.note);
    } catch (err) {
      setError('Note not found or link expired');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock size={16} />
            <span>Read-only view</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
          <div className="text-sm text-gray-600 mb-6">
            By {note.owner_name}
          </div>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans">{note.content}</pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
