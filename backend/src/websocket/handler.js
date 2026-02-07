const jwt = require('jsonwebtoken');
const NoteModel = require('../models/Note');

class WebSocketHandler {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map(); // noteId -> Set of user socket ids
    this.userSockets = new Map(); // socketId -> user data
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
        
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.id}`);
      
      this.userSockets.set(socket.id, socket.user);

      // Join note room
      socket.on('join-note', async ({ noteId }) => {
        try {
          // Verify user has access to note
          await NoteModel.findById(noteId, socket.user.id);
          
          // Join the room
          socket.join(`note:${noteId}`);
          
          // Track active users
          if (!this.activeUsers.has(noteId)) {
            this.activeUsers.set(noteId, new Set());
          }
          this.activeUsers.get(noteId).add(socket.id);
          
          // Notify others
          socket.to(`note:${noteId}`).emit('user-joined', {
            userId: socket.user.id,
            email: socket.user.email
          });
          
          // Send current active users
          const activeUserIds = Array.from(this.activeUsers.get(noteId))
            .map(sid => this.userSockets.get(sid))
            .filter(u => u && u.id !== socket.user.id);
          
          socket.emit('active-users', {
            users: activeUserIds
          });
          
          console.log(`User ${socket.user.id} joined note ${noteId}`);
        } catch (error) {
          socket.emit('error', { message: 'Failed to join note' });
        }
      });

      // Leave note room
      socket.on('leave-note', ({ noteId }) => {
        this.handleLeaveNote(socket, noteId);
      });

      // Note content update
      socket.on('note-update', async ({ noteId, title, content, cursorPosition }) => {
        try {
          // Update note in database
          await NoteModel.update(noteId, socket.user.id, { title, content });
          
          // Broadcast to other users in the room
          socket.to(`note:${noteId}`).emit('note-updated', {
            noteId,
            title,
            content,
            updatedBy: socket.user.id,
            updatedByEmail: socket.user.email,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to update note' });
        }
      });

      // Cursor position update (for showing other users' cursors)
      socket.on('cursor-move', ({ noteId, position }) => {
        socket.to(`note:${noteId}`).emit('cursor-update', {
          userId: socket.user.id,
          email: socket.user.email,
          position
        });
      });

      // Typing indicator
      socket.on('typing-start', ({ noteId }) => {
        socket.to(`note:${noteId}`).emit('user-typing', {
          userId: socket.user.id,
          email: socket.user.email
        });
      });

      socket.on('typing-stop', ({ noteId }) => {
        socket.to(`note:${noteId}`).emit('user-stopped-typing', {
          userId: socket.user.id
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
        
        // Remove from all active note rooms
        this.activeUsers.forEach((users, noteId) => {
          if (users.has(socket.id)) {
            users.delete(socket.id);
            socket.to(`note:${noteId}`).emit('user-left', {
              userId: socket.user.id,
              email: socket.user.email
            });
            
            // Clean up empty sets
            if (users.size === 0) {
              this.activeUsers.delete(noteId);
            }
          }
        });
        
        this.userSockets.delete(socket.id);
      });
    });
  }

  handleLeaveNote(socket, noteId) {
    socket.leave(`note:${noteId}`);
    
    const users = this.activeUsers.get(noteId);
    if (users) {
      users.delete(socket.id);
      
      if (users.size === 0) {
        this.activeUsers.delete(noteId);
      }
      
      socket.to(`note:${noteId}`).emit('user-left', {
        userId: socket.user.id,
        email: socket.user.email
      });
    }
    
    console.log(`User ${socket.user.id} left note ${noteId}`);
  }

  // Broadcast note deletion to all users
  broadcastNoteDeleted(noteId) {
    this.io.to(`note:${noteId}`).emit('note-deleted', { noteId });
  }

  // Broadcast collaborator changes
  broadcastCollaboratorAdded(noteId, collaborator) {
    this.io.to(`note:${noteId}`).emit('collaborator-added', { collaborator });
  }

  broadcastCollaboratorRemoved(noteId, collaboratorId) {
    this.io.to(`note:${noteId}`).emit('collaborator-removed', { collaboratorId });
  }
}

module.exports = WebSocketHandler;
