import { create } from 'zustand';
import { authAPI, notesAPI } from '../utils/api';
import websocket from '../utils/websocket';

// Auth Store
export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true, loading: false });
      
      // Connect websocket
      websocket.connect(token);
      
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true, loading: false });
      
      // Connect websocket
      websocket.connect(token);
      
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      websocket.disconnect();
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  initializeAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      websocket.connect(token);
    }
  },
}));

// Notes Store
export const useNotesStore = create((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  searchQuery: '',
  activeUsers: [],
  typingUsers: new Set(),

  fetchNotes: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await notesAPI.getNotes(params);
      set({ notes: response.data.notes, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchNote: async (id) => {
    set({ loading: true });
    try {
      const response = await notesAPI.getNote(id);
      set({ currentNote: response.data.note, loading: false });
      return response.data.note;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createNote: async (noteData) => {
    try {
      const response = await notesAPI.createNote(noteData);
      const newNote = response.data.note;
      set((state) => ({ notes: [newNote, ...state.notes] }));
      return newNote;
    } catch (error) {
      throw error;
    }
  },

  updateNote: async (id, data) => {
    try {
      const response = await notesAPI.updateNote(id, data);
      const updatedNote = response.data.note;
      
      set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id ? { ...note, ...updatedNote } : note
        ),
        currentNote: state.currentNote?.id === id 
          ? { ...state.currentNote, ...updatedNote } 
          : state.currentNote,
      }));
      
      return updatedNote;
    } catch (error) {
      throw error;
    }
  },

  deleteNote: async (id) => {
    try {
      await notesAPI.deleteNote(id);
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
      }));
    } catch (error) {
      throw error;
    }
  },

  searchNotes: async (query) => {
    set({ loading: true, searchQuery: query });
    try {
      const response = await notesAPI.searchNotes(query);
      set({ notes: response.data.notes, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentNote: (note) => set({ currentNote: note }),
  
  setActiveUsers: (users) => set({ activeUsers: users }),
  
  addTypingUser: (userId) => set((state) => ({
    typingUsers: new Set([...state.typingUsers, userId])
  })),
  
  removeTypingUser: (userId) => set((state) => {
    const newSet = new Set(state.typingUsers);
    newSet.delete(userId);
    return { typingUsers: newSet };
  }),

  updateNoteFromWebSocket: (noteData) => {
    set((state) => {
      if (state.currentNote?.id === noteData.noteId) {
        return {
          currentNote: {
            ...state.currentNote,
            title: noteData.title,
            content: noteData.content,
          },
        };
      }
      return state;
    });
  },
}));

// Collaborators Store
export const useCollaboratorsStore = create((set) => ({
  collaborators: [],
  loading: false,

  fetchCollaborators: async (noteId) => {
    set({ loading: true });
    try {
      const response = await notesAPI.getCollaborators(noteId);
      set({ collaborators: response.data.collaborators, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  addCollaborator: async (noteId, data) => {
    try {
      const response = await notesAPI.addCollaborator(noteId, data);
      set((state) => ({
        collaborators: [...state.collaborators, response.data.collaborator],
      }));
    } catch (error) {
      throw error;
    }
  },

  updateCollaborator: async (noteId, collaboratorId, data) => {
    try {
      const response = await notesAPI.updateCollaborator(noteId, collaboratorId, data);
      set((state) => ({
        collaborators: state.collaborators.map((c) =>
          c.user_id === collaboratorId ? response.data.collaborator : c
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  removeCollaborator: async (noteId, collaboratorId) => {
    try {
      await notesAPI.removeCollaborator(noteId, collaboratorId);
      set((state) => ({
        collaborators: state.collaborators.filter((c) => c.user_id !== collaboratorId),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
