# Project Structure

## Complete Directory Tree

```
collab-notes-app/
├── README.md                       # Main documentation
├── DEPLOYMENT.md                   # Deployment guide
├── API_DOCS.md                     # API documentation
├── .gitignore                      # Git ignore rules
│
├── backend/                        # Node.js/Express backend
│   ├── package.json                # Backend dependencies
│   ├── .env.example                # Environment template
│   ├── .gitignore                  # Backend git ignore
│   ├── vercel.json                 # Vercel deployment config
│   │
│   └── src/
│       ├── server.js               # Main server file
│       │
│       ├── database/
│       │   ├── db.js               # Database connection pool
│       │   └── migrate.js          # Database migrations
│       │
│       ├── models/
│       │   ├── User.js             # User model
│       │   ├── Note.js             # Note model
│       │   ├── ActivityLog.js      # Activity log model
│       │   └── ShareLink.js        # Share link model
│       │
│       ├── controllers/
│       │   ├── authController.js   # Authentication logic
│       │   ├── notesController.js  # Notes CRUD logic
│       │   └── shareLinksController.js # Share links logic
│       │
│       ├── middleware/
│       │   ├── auth.js             # JWT authentication
│       │   ├── validation.js       # Request validation
│       │   └── errorHandler.js     # Error handling
│       │
│       ├── routes/
│       │   ├── auth.js             # Auth routes
│       │   ├── notes.js            # Notes routes
│       │   └── shareLinks.js       # Share routes
│       │
│       └── websocket/
│           └── handler.js          # WebSocket handler
│
└── frontend/                       # React frontend
    ├── package.json                # Frontend dependencies
    ├── vite.config.js              # Vite configuration
    ├── tailwind.config.js          # Tailwind CSS config
    ├── postcss.config.js           # PostCSS config
    ├── .env.example                # Environment template
    ├── .gitignore                  # Frontend git ignore
    ├── index.html                  # HTML entry point
    │
    └── src/
        ├── main.jsx                # React entry point
        ├── App.jsx                 # Main App component
        ├── index.css               # Global styles
        │
        ├── pages/
        │   ├── Login.jsx           # Login page
        │   ├── Register.jsx        # Registration page
        │   ├── Dashboard.jsx       # Dashboard page
        │   └── SharedNote.jsx      # Public note view
        │
        ├── components/
        │   ├── NoteEditor.jsx      # Note editing component
        │   │
        │   └── ui/                 # Reusable UI components
        │       ├── Button.jsx      # Button component
        │       ├── Input.jsx       # Input component
        │       ├── Card.jsx        # Card component
        │       └── Modal.jsx       # Modal component
        │
        ├── store/
        │   └── index.js            # Zustand state management
        │
        └── utils/
            ├── api.js              # API client
            └── websocket.js        # WebSocket service
```

## File Descriptions

### Backend Files

#### Core Files
- **src/server.js**
  - Express app initialization
  - Middleware setup
  - Route mounting
  - WebSocket initialization
  - Server startup

- **src/database/db.js**
  - PostgreSQL connection pool
  - Query execution wrapper
  - Transaction support
  - Connection management

- **src/database/migrate.js**
  - Database schema creation
  - Table definitions
  - Index creation
  - Triggers and functions

#### Models (Data Access Layer)
- **User.js**
  - `create()` - Create new user
  - `findByEmail()` - Find user by email
  - `findById()` - Find user by ID
  - `verifyPassword()` - Password verification
  - `updateRole()` - Update user role

- **Note.js**
  - `create()` - Create note with owner
  - `findById()` - Get note with permissions
  - `getUserNotes()` - Get all user notes
  - `update()` - Update note content
  - `delete()` - Delete note
  - `getCollaborators()` - Get note collaborators
  - `addCollaborator()` - Add collaborator
  - `updateCollaborator()` - Update permissions
  - `removeCollaborator()` - Remove collaborator

- **ActivityLog.js**
  - `log()` - Log user action
  - `getNoteActivities()` - Get note activities
  - `getUserActivities()` - Get user activities

- **ShareLink.js**
  - `create()` - Generate share link
  - `findByToken()` - Get note by token
  - `getNoteLinks()` - Get all links for note
  - `deactivate()` - Deactivate link
  - `delete()` - Delete link

#### Controllers (Business Logic)
- **authController.js**
  - `register()` - User registration
  - `login()` - User authentication
  - `getCurrentUser()` - Get logged-in user
  - `logout()` - Logout user

- **notesController.js**
  - `getNotes()` - List all notes
  - `getNote()` - Get single note
  - `createNote()` - Create new note
  - `updateNote()` - Update note
  - `deleteNote()` - Delete note
  - `searchNotes()` - Search functionality
  - Collaborator management methods

- **shareLinksController.js**
  - `createShareLink()` - Create share link
  - `getNoteShareLinks()` - Get note links
  - `getSharedNote()` - Public access
  - `deactivateShareLink()` - Deactivate link
  - `deleteShareLink()` - Delete link

#### Middleware
- **auth.js**
  - `authenticate()` - JWT verification
  - `optionalAuth()` - Optional authentication
  - `authorize()` - Role-based access
  - `generateToken()` - Create JWT

- **validation.js**
  - `schemas` - Joi validation schemas
  - `validate()` - Body validation
  - `validateQuery()` - Query validation

- **errorHandler.js**
  - Custom error classes
  - Global error handler
  - Async error wrapper
  - 404 handler

#### Routes
- **auth.js** - Authentication endpoints
- **notes.js** - Notes CRUD endpoints
- **shareLinks.js** - Share link endpoints

#### WebSocket
- **handler.js**
  - Connection management
  - Room management
  - Real-time events
  - User presence tracking

### Frontend Files

#### Core Files
- **main.jsx** - React app initialization
- **App.jsx** - Router and global layout
- **index.css** - Tailwind CSS imports

#### Pages
- **Login.jsx** - User login form
- **Register.jsx** - User registration form
- **Dashboard.jsx** - Notes dashboard
- **SharedNote.jsx** - Public note view

#### Components
- **NoteEditor.jsx** - Real-time note editor
- **ui/Button.jsx** - Reusable button
- **ui/Input.jsx** - Form input component
- **ui/Card.jsx** - Container component
- **ui/Modal.jsx** - Modal dialog

#### State Management
- **store/index.js**
  - `useAuthStore` - Authentication state
  - `useNotesStore` - Notes state
  - `useCollaboratorsStore` - Collaborators state

#### Utilities
- **api.js**
  - Axios instance
  - Request interceptors
  - API methods
  - Error handling

- **websocket.js**
  - Socket.IO client
  - Event handlers
  - Connection management

## Design Patterns Used

### Backend Patterns

1. **MVC Architecture**
   - Models: Data access
   - Controllers: Business logic
   - Routes: API endpoints

2. **Middleware Pattern**
   - Authentication
   - Validation
   - Error handling

3. **Repository Pattern**
   - Models abstract database access
   - Consistent interface

4. **Factory Pattern**
   - Validation middleware factory
   - Authorization middleware factory

5. **Singleton Pattern**
   - Database connection pool
   - WebSocket handler

### Frontend Patterns

1. **Component Composition**
   - Reusable UI components
   - Props-based customization

2. **Container/Presentational**
   - Pages (containers)
   - UI components (presentational)

3. **State Management**
   - Zustand for global state
   - React hooks for local state

4. **Service Layer**
   - API client service
   - WebSocket service

## Reusable Components

### Backend Reusables

1. **Database Utilities**
   - `db.query()` - Execute queries
   - `db.transaction()` - Run transactions

2. **Middleware**
   - `authenticate` - Apply to any route
   - `authorize(roles)` - Role-based protection
   - `validate(schema)` - Request validation
   - `asyncHandler(fn)` - Error wrapper

3. **Error Classes**
   - `AppError` - Base error
   - `ValidationError` - 400 errors
   - `UnauthorizedError` - 401 errors
   - `ForbiddenError` - 403 errors
   - `NotFoundError` - 404 errors

### Frontend Reusables

1. **UI Components**
   - `<Button>` - Multi-variant button
   - `<Input>` - Form input
   - `<Card>` - Container
   - `<Modal>` - Dialog

2. **Hooks** (can be added)
   - `useAuth()` - Authentication hook
   - `useNotes()` - Notes management
   - `useWebSocket()` - WebSocket connection

3. **Utilities**
   - `apiClient` - Configured axios
   - `websocket` - Socket.IO service

## Best Practices Implemented

### Code Quality
- ✅ Consistent naming conventions
- ✅ Separation of concerns
- ✅ DRY (Don't Repeat Yourself)
- ✅ Error handling throughout
- ✅ Input validation
- ✅ Security best practices

### Performance
- ✅ Database connection pooling
- ✅ Indexed database queries
- ✅ Efficient WebSocket management
- ✅ Code splitting (Vite)
- ✅ Compression middleware

### Security
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ SQL injection prevention
- ✅ XSS protection (Helmet)
- ✅ CORS configuration
- ✅ Input validation (Joi)

### Scalability
- ✅ Modular architecture
- ✅ Stateless API design
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Efficient queries

### Developer Experience
- ✅ Clear file structure
- ✅ Consistent patterns
- ✅ Reusable components
- ✅ Comprehensive documentation
- ✅ Environment configuration

## Technology Stack Summary

### Backend
- Runtime: Node.js 18+
- Framework: Express.js
- Database: PostgreSQL
- ORM: Raw SQL with pg
- WebSocket: Socket.IO
- Authentication: JWT
- Validation: Joi
- Security: Helmet, bcryptjs
- Utilities: uuid, date-fns

### Frontend
- Framework: React 18
- Build Tool: Vite
- Routing: React Router v6
- State: Zustand
- HTTP: Axios
- WebSocket: Socket.IO Client
- Styling: Tailwind CSS
- UI: Custom components
- Notifications: React Hot Toast
- Utilities: date-fns, clsx

### DevOps
- Version Control: Git
- Backend Deploy: Railway/Render
- Frontend Deploy: Vercel/Netlify
- Database: PostgreSQL (managed)
- Environment: .env files

## Extension Points

This architecture supports easy addition of:

1. **New Models** - Add to src/models/
2. **New Routes** - Add to src/routes/
3. **New Controllers** - Add to src/controllers/
4. **New Middleware** - Add to src/middleware/
5. **New UI Components** - Add to frontend/src/components/ui/
6. **New Pages** - Add to frontend/src/pages/
7. **New Features** - Follow existing patterns

Each new feature follows established patterns making the codebase easy to maintain and extend.
