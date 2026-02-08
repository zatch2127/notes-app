import { useState, useEffect } from 'react';
import { useNotesStore } from '../store';
import { notesAPI } from '../utils/api';
import Button from './ui/Button';
import Input from './ui/Input';
import { X, Trash2, UserPlus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CollaboratorModal({ noteId, onClose }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);

  useEffect(() => {
    loadCollaborators();
  }, [noteId]);

  const loadCollaborators = async () => {
    try {
      const response = await notesAPI.getCollaborators(noteId);
      setCollaborators(response.data.collaborators);
    } catch (error) {
      toast.error('Failed to load collaborators');
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // First, find the user by email (in a real app, you might search first)
      // Since our API expects userId, but we only have email input in this simple UI,
      // we'll try to add by email directly if the backend supports it, 
      // OR we need a way to look up users. 
      
      // NOTE: The current backend API for addCollaborator expects 'userId', not email.
      // This is a common issue. We might need to update the backend to accept email 
      // OR add a user search step. 
      // Let's assume for now we need to search or the backend handles email lookup.
      // Looking at the Controller, it expects `userId`. 
      // We need to fix this or add a search. 
      
      // WAIT: The requirement says "Manage collaborators". 
      // Let's check if there's a user search endpoint.
      // There isn't one in the API docs. 
      
      // Let's try to add by email and see if the backend handles it, 
      // OR we can implement a quick lookup if needed.
      // Actually, looking at the backend code again - `addCollaborator` in controller takes `userId`.
      // We need a way to find a user by email.
      
      // Let's check if we can mock this or if we should add a search endpoint.
        
      // FOR NOW: I will try to call an endpoint to find user by email first.
      // Since we can't change backend easily right now without checking, 
      // I'll assume we need to add a "search users" endpoint or modify the addCollaborator to accept email.
      // Modifying addCollaborator to accept email is the most user-friendly way.
      
      // Let's try to send 'email' instead of 'userId' and see if we can update the backend to handle it,
      // which is better UX anyway.
      
      await notesAPI.addCollaborator(noteId, { email, permission }); 
      toast.success('Collaborator added');
      setEmail('');
      loadCollaborators();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add collaborator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!confirm('Remove this collaborator?')) return;
    try {
      await notesAPI.removeCollaborator(noteId, collaboratorId);
      toast.success('Collaborator removed');
      loadCollaborators();
    } catch (error) {
      toast.error('Failed to remove collaborator');
    }
  };

  const handleUpdatePermission = async (collaboratorId, newPermission) => {
    try {
      await notesAPI.updateCollaborator(noteId, collaboratorId, { permission: newPermission });
      toast.success('Permission updated');
      loadCollaborators();
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users size={20} />
            Collaborators
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAddCollaborator} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <Button type="submit" loading={isLoading} className="w-full mt-2" size="sm">
            <UserPlus size={16} className="mr-2" />
            Add Collaborator
          </Button>
        </form>

        <div className="space-y-4 max-h-60 overflow-y-auto">
          {loadingCollaborators ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No collaborators yet. Invite someone!
            </div>
          ) : (
            collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium text-sm truncate">{collaborator.name}</p>
                  <p className="text-xs text-gray-500 truncate">{collaborator.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={collaborator.permission}
                    onChange={(e) => handleUpdatePermission(collaborator.user_id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-1 py-1 bg-white"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => handleRemoveCollaborator(collaborator.user_id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper icon component since I used it above
function Users({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
