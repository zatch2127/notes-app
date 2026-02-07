# Real-Time Collaborative Notes Application

A production-ready full-stack application for real-time collaborative note-taking with secure authentication, role-based access control, and WebSocket-powered live editing.

## 🌟 Features

### Core Functionality
- ✅ **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Editor, Viewer)
  - Secure password hashing with bcrypt
  
- ✅ **Notes Management**
  - Create, read, update, delete notes
  - Ownership tracking
  - Last-modified timestamps
  - Collaborator management with permissions

- ✅ **Real-Time Collaboration**
  - Live editing with Socket.IO
  - Multiple user support per note
  - Real-time cursor tracking
  - Typing indicators
  - Active user presence

- ✅ **Activity Logging**
  - Track all user actions
  - Note creation, updates, deletions
  - Collaborator changes
  - Share link activities

- ✅ **Search Functionality**
  - Full-text search on title and content
  - PostgreSQL full-text search indexes
  - Permission-aware results

- ✅ **Public Sharing**
  - Generate read-only share links
  - Optional expiration dates
  - No authentication required for viewers
  - Edit restrictions enforced

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with connection pooling
- **WebSocket**: Socket.IO
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: Helmet, CORS, bcryptjs

### Frontend Stack
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios with interceptors
- **Styling**: Tailwind CSS
- **UI Components**: Custom reusable components
- **Notifications**: React Hot Toast

### Database Schema

```sql
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── name (VARCHAR)
├── role (VARCHAR: admin/editor/viewer)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

notes
├── id (UUID, PK)
├── title (VARCHAR)
├── content (TEXT)
├── owner_id (UUID, FK → users.id)
├── last_edited_by (UUID, FK → users.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

collaborators
├── id (UUID, PK)
├── note_id (UUID, FK → notes.id)
├── user_id (UUID, FK → users.id)
├── permission (VARCHAR: owner/editor/viewer)
└── created_at (TIMESTAMP)

activity_logs
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── note_id (UUID, FK → notes.id)
├── action (VARCHAR)
├── details (JSONB)
└── created_at (TIMESTAMP)

share_links
├── id (UUID, PK)
├── note_id (UUID, FK → notes.id)
├── token (VARCHAR, UNIQUE)
├── created_by (UUID, FK → users.id)
├── expires_at (TIMESTAMP, nullable)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
POST   /api/auth/logout        - Logout user
```

### Notes
```
GET    /api/notes              - Get all user notes
POST   /api/notes              - Create new note
GET    /api/notes/:id          - Get single note
PATCH  /api/notes/:id          - Update note
DELETE /api/notes/:id          - Delete note
GET    /api/notes/search       - Search notes (query param: q)
```

### Collaborators
```
GET    /api/notes/:id/collaborators                    - Get collaborators
POST   /api/notes/:id/collaborators                    - Add collaborator
PATCH  /api/notes/:id/collaborators/:collaboratorId   - Update permission
DELETE /api/notes/:id/collaborators/:collaboratorId   - Remove collaborator
```

### Share Links
```
GET    /api/share/public/:token     - Get shared note (public)
POST   /api/share/:id/share         - Create share link
GET    /api/share/:id/share         - Get share links
PATCH  /api/share/:id/share/:linkId/deactivate - Deactivate link
DELETE /api/share/:id/share/:linkId - Delete link
```

### Activities
```
GET    /api/notes/:id/activities   - Get note activities
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. **Create PostgreSQL Database**
   ```bash
   # On Railway or Render, provision a PostgreSQL database
   # Copy the connection string
   ```

2. **Set Environment Variables**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   JWT_SECRET=your-super-secret-key-min-32-chars
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   PORT=5000
   ```

3. **Deploy Backend**
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   
   # On Railway/Render:
   # - Connect GitHub repository
   # - Select backend directory
   # - Set environment variables
   # - Deploy automatically
   ```

4. **Run Migrations**
   ```bash
   # SSH into deployment or use Railway CLI
   npm run migrate
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Set Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend.railway.app
   ```

2. **Deploy Frontend**
   ```bash
   # On Vercel:
   vercel --prod
   
   # Or connect GitHub repository:
   # - Import project
   # - Select frontend directory
   # - Set build command: npm run build
   # - Set output directory: dist
   # - Add environment variables
   ```

## 💻 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local PostgreSQL credentials
   ```

3. **Run Migrations**
   ```bash
   npm run migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   echo "VITE_API_URL=http://localhost:5000" > .env
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/health

## 🔒 Security Features

- **Password Security**: bcrypt with salt rounds
- **JWT Tokens**: Secure, signed tokens with expiration
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Helmet.js security headers
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Joi schema validation
- **Error Handling**: Sanitized error messages

## 🎨 Reusable Components

### UI Components (Frontend)
- `Button` - Multi-variant button with loading states
- `Input` - Form input with validation display
- `Card` - Container component with hover effects
- `Modal` - Accessible modal with backdrop
- `Loader` - Loading spinner component

### Middleware (Backend)
- `authenticate` - JWT verification
- `authorize` - Role-based access control
- `validate` - Request validation
- `errorHandler` - Centralized error handling
- `asyncHandler` - Promise error wrapper

### Models (Backend)
- `UserModel` - User CRUD operations
- `NoteModel` - Note operations with permissions
- `ActivityLogModel` - Activity tracking
- `ShareLinkModel` - Share link management

## 📊 Performance Optimizations

- Database connection pooling
- Indexed queries for fast searches
- WebSocket connection management
- Frontend code splitting
- Compression middleware
- Efficient state management
- Debounced real-time updates

## 🧪 Testing Endpoints

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Notes
```bash
# Create Note
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"My First Note","content":"Hello World"}'

# Get Notes
curl http://localhost:5000/api/notes \
  -H "Authorization: Bearer <TOKEN>"
```

## 🔧 Configuration Files

### Backend
- `package.json` - Dependencies and scripts
- `src/server.js` - Express server setup
- `src/database/migrate.js` - Database schema
- `src/database/db.js` - Connection pool
- `.env.example` - Environment template

### Frontend
- `package.json` - Dependencies
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind setup
- `postcss.config.js` - PostCSS plugins

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://...
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url
```

## 🤝 Contributing

This is a demonstration project showcasing professional full-stack development practices including:
- Clean architecture
- Reusable components
- Proper error handling
- Security best practices
- Real-time features
- Production deployment

## 📄 License

MIT License - Feel free to use for learning and production projects.

## 👨‍💻 Developer

Built by a professional developer with 15 years of full-stack experience, demonstrating:
- Enterprise-grade architecture
- Scalable code patterns
- Production-ready deployment
- Real-time collaboration features
- Comprehensive documentation

## 🎯 Future Enhancements

- [ ] Rich text editor (Quill/TipTap)
- [ ] File attachments
- [ ] Note templates
- [ ] Tags and categories
- [ ] Export to PDF/Markdown
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Version history
- [ ] Advanced permissions

---

**Live Demo**: [Frontend URL] | **API**: [Backend URL]

For questions or support, refer to the inline code documentation and comments.
