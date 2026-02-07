import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Authentication API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// Notes API
export const notesAPI = {
  getNotes: (params) => apiClient.get('/notes', { params }),
  getNote: (id) => apiClient.get(`/notes/${id}`),
  createNote: (data) => apiClient.post('/notes', data),
  updateNote: (id, data) => apiClient.patch(`/notes/${id}`, data),
  deleteNote: (id) => apiClient.delete(`/notes/${id}`),
  searchNotes: (query, params) => apiClient.get('/notes/search', { params: { q: query, ...params } }),
  
  // Collaborators
  getCollaborators: (noteId) => apiClient.get(`/notes/${noteId}/collaborators`),
  addCollaborator: (noteId, data) => apiClient.post(`/notes/${noteId}/collaborators`, data),
  updateCollaborator: (noteId, collaboratorId, data) => 
    apiClient.patch(`/notes/${noteId}/collaborators/${collaboratorId}`, data),
  removeCollaborator: (noteId, collaboratorId) => 
    apiClient.delete(`/notes/${noteId}/collaborators/${collaboratorId}`),
  
  // Activities
  getActivities: (noteId, params) => apiClient.get(`/notes/${noteId}/activities`, { params }),
};

// Share Links API
export const shareAPI = {
  createShareLink: (noteId, data) => apiClient.post(`/share/${noteId}/share`, data),
  getShareLinks: (noteId) => apiClient.get(`/share/${noteId}/share`),
  deactivateShareLink: (noteId, linkId) => 
    apiClient.patch(`/share/${noteId}/share/${linkId}/deactivate`),
  deleteShareLink: (noteId, linkId) => apiClient.delete(`/share/${noteId}/share/${linkId}`),
  getSharedNote: (token) => apiClient.get(`/share/public/${token}`),
};

export default apiClient;
