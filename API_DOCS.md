# API Documentation

Base URL: `https://your-api-url.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "editor"  // Optional: admin, editor, viewer (default: editor)
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "editor"
    },
    "token": "jwt-token-here"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "editor"
    },
    "token": "jwt-token-here"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "editor",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Notes

### Get All Notes
```http
GET /notes?limit=50&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of notes to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "title": "My Note",
        "content": "Note content here...",
        "owner_id": "uuid",
        "owner_name": "John Doe",
        "user_permission": "owner",
        "collaborator_count": 3,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 10
    }
  }
}
```

### Get Single Note
```http
GET /notes/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "uuid",
      "title": "My Note",
      "content": "Note content...",
      "owner_id": "uuid",
      "owner_name": "John Doe",
      "user_permission": "editor",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "last_edited_by": "uuid"
    }
  }
}
```

### Create Note
```http
POST /notes
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My New Note",
  "content": "Note content here..."  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "note": {
      "id": "uuid",
      "title": "My New Note",
      "content": "Note content here...",
      "owner_id": "uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Note
```http
PATCH /notes/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",  // Optional
  "content": "Updated content..."  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "note": {
      "id": "uuid",
      "title": "Updated Title",
      "content": "Updated content...",
      "updated_at": "2024-01-01T01:00:00.000Z"
    }
  }
}
```

### Delete Note
```http
DELETE /notes/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

### Search Notes
```http
GET /notes/search?q=keyword&limit=50&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Results limit
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [...],
    "query": "keyword",
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 5
    }
  }
}
```

## Collaborators

### Get Collaborators
```http
GET /notes/:id/collaborators
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "collaborators": [
      {
        "id": "uuid",
        "permission": "editor",
        "user_id": "uuid",
        "email": "user@example.com",
        "name": "Jane Doe",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Add Collaborator
```http
POST /notes/:id/collaborators
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "uuid",
  "permission": "editor"  // editor or viewer
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collaborator added successfully",
  "data": {
    "collaborator": {
      "id": "uuid",
      "note_id": "uuid",
      "user_id": "uuid",
      "permission": "editor",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Collaborator Permission
```http
PATCH /notes/:id/collaborators/:collaboratorId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "permission": "viewer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collaborator updated successfully",
  "data": {
    "collaborator": {
      "id": "uuid",
      "permission": "viewer",
      "updated_at": "2024-01-01T01:00:00.000Z"
    }
  }
}
```

### Remove Collaborator
```http
DELETE /notes/:id/collaborators/:collaboratorId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Collaborator removed successfully"
}
```

## Share Links

### Create Share Link
```http
POST /share/:noteId/share
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "expiresInDays": 7  // Optional, null for permanent
}
```

**Response:**
```json
{
  "success": true,
  "message": "Share link created successfully",
  "data": {
    "shareLink": {
      "id": "uuid",
      "note_id": "uuid",
      "token": "random-token-here",
      "created_by": "uuid",
      "expires_at": "2024-01-08T00:00:00.000Z",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Share Links for Note
```http
GET /share/:noteId/share
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shareLinks": [
      {
        "id": "uuid",
        "token": "random-token",
        "created_by_name": "John Doe",
        "expires_at": "2024-01-08T00:00:00.000Z",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Access Shared Note (Public)
```http
GET /share/public/:token
```

**No authentication required**

**Response:**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "uuid",
      "title": "Shared Note",
      "content": "Note content...",
      "owner_name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "isPublic": true
  }
}
```

### Deactivate Share Link
```http
PATCH /share/:noteId/share/:linkId/deactivate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Share link deactivated successfully"
}
```

### Delete Share Link
```http
DELETE /share/:noteId/share/:linkId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Share link deleted successfully"
}
```

## Activity Logs

### Get Note Activities
```http
GET /notes/:id/activities?limit=50&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "uuid",
        "action": "note_updated",
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "details": {
          "title": "My Note"
        },
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0
    }
  }
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('https://your-api-url.com', {
  auth: { token: 'your-jwt-token' }
});
```

### Client Events (Emit)

#### Join Note Room
```javascript
socket.emit('join-note', { noteId: 'uuid' });
```

#### Leave Note Room
```javascript
socket.emit('leave-note', { noteId: 'uuid' });
```

#### Update Note Content
```javascript
socket.emit('note-update', {
  noteId: 'uuid',
  title: 'Updated Title',
  content: 'Updated content...',
  cursorPosition: 100
});
```

#### Send Cursor Position
```javascript
socket.emit('cursor-move', {
  noteId: 'uuid',
  position: 150
});
```

#### Typing Indicators
```javascript
socket.emit('typing-start', { noteId: 'uuid' });
socket.emit('typing-stop', { noteId: 'uuid' });
```

### Server Events (Listen)

#### User Joined
```javascript
socket.on('user-joined', (data) => {
  // data: { userId: 'uuid', email: 'user@example.com' }
});
```

#### User Left
```javascript
socket.on('user-left', (data) => {
  // data: { userId: 'uuid', email: 'user@example.com' }
});
```

#### Active Users List
```javascript
socket.on('active-users', (data) => {
  // data: { users: [{id, email}, ...] }
});
```

#### Note Updated
```javascript
socket.on('note-updated', (data) => {
  // data: {
  //   noteId: 'uuid',
  //   title: 'Updated Title',
  //   content: 'Updated content...',
  //   updatedBy: 'uuid',
  //   updatedByEmail: 'user@example.com',
  //   timestamp: '2024-01-01T00:00:00.000Z'
  // }
});
```

#### Cursor Update
```javascript
socket.on('cursor-update', (data) => {
  // data: {
  //   userId: 'uuid',
  //   email: 'user@example.com',
  //   position: 150
  // }
});
```

#### User Typing
```javascript
socket.on('user-typing', (data) => {
  // data: { userId: 'uuid', email: 'user@example.com' }
});

socket.on('user-stopped-typing', (data) => {
  // data: { userId: 'uuid' }
});
```

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [  // Optional, for validation errors
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Authenticated: Higher limits based on user role
- WebSocket: Connection-based limits

## Permissions

### Note Permissions
- **owner**: Full control (edit, delete, manage collaborators, share)
- **editor**: Can edit note content and title
- **viewer**: Can only view note content

### User Roles
- **admin**: Platform-wide administration
- **editor**: Can create and collaborate on notes
- **viewer**: Read-only access to shared notes
