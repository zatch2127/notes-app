import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  setupDefaultListeners() {
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  joinNote(noteId) {
    if (!this.socket) return;
    this.socket.emit('join-note', { noteId });
  }

  leaveNote(noteId) {
    if (!this.socket) return;
    this.socket.emit('leave-note', { noteId });
  }

  updateNote(noteId, data) {
    if (!this.socket) return;
    this.socket.emit('note-update', {
      noteId,
      ...data,
    });
  }

  sendCursorPosition(noteId, position) {
    if (!this.socket) return;
    this.socket.emit('cursor-move', { noteId, position });
  }

  startTyping(noteId) {
    if (!this.socket) return;
    this.socket.emit('typing-start', { noteId });
  }

  stopTyping(noteId) {
    if (!this.socket) return;
    this.socket.emit('typing-stop', { noteId });
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
    
    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  removeAllListeners(event) {
    if (!this.socket) return;
    
    if (event) {
      this.socket.off(event);
      this.listeners.delete(event);
    } else {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export default new WebSocketService();
