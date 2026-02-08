import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return this.socket;
    }

    // Close existing closed/error socket if exists
    if (this.socket) {
      this.socket.close();
    }

    console.log('Connecting to WebSocket...');
    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'], // Try websocket first
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  setupDefaultListeners() {
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  joinNote(noteId) {
    if (!this.socket?.connected) return;
    this.socket.emit('join-note', { noteId });
  }

  leaveNote(noteId) {
    if (!this.socket?.connected) return;
    this.socket.emit('leave-note', { noteId });
  }

  updateNote(noteId, data) {
    if (!this.socket?.connected) return;
    this.socket.emit('note-update', {
      noteId,
      ...data,
    });
  }

  sendCursorPosition(noteId, position) {
    if (!this.socket?.connected) return;
    this.socket.emit('cursor-move', { noteId, position });
  }

  startTyping(noteId) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing-start', { noteId });
  }

  stopTyping(noteId) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing-stop', { noteId });
  }

  on(event, callback) {
    if (!this.socket) return;

    // wrapper to ensure we don't bind same callback twice if called repeatedly
    // but the caller usually passes an anonymous function so this check is tricky
    // relying on component cleanup is better
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export default new WebSocketService();
