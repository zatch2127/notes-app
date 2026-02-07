# Quick Start Guide

Get the application running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed
- Git installed

## Local Development Setup

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd collab-notes-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Database

```bash
# Create database
createdb collab_notes_dev

# Or using psql:
psql
CREATE DATABASE collab_notes_dev;
\q
```

### 3. Configure Environment

**Backend (.env)**
```bash
cd backend
cat > .env << 'ENVFILE'
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://localhost/collab_notes_dev
JWT_SECRET=your-development-secret-key-min-32-characters-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ENVFILE
```

**Frontend (.env)**
```bash
cd ../frontend
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 4. Run Migrations

```bash
cd ../backend
npm run migrate
```

### 5. Start Servers

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

### 6. Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/health

## Test the Application

1. Open http://localhost:3000
2. Click "Sign up" and create an account
3. Create a new note
4. Open the same note in another browser tab
5. Edit from one tab and see real-time updates in the other!

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Backend (Railway)**
1. Push code to GitHub
2. Go to Railway.app
3. Create new project from GitHub
4. Add PostgreSQL database
5. Set environment variables
6. Deploy automatically

**Frontend (Vercel)**
1. Go to Vercel.com
2. Import from GitHub
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL`
5. Deploy automatically

## Common Commands

### Backend
```bash
npm run dev          # Start development server
npm start           # Start production server
npm run migrate     # Run database migrations
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
psql -l

# Create database if missing
createdb collab_notes_dev
```

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Migrations fail
```bash
# Drop and recreate database
dropdb collab_notes_dev
createdb collab_notes_dev
npm run migrate
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [API_DOCS.md](API_DOCS.md) for API reference
- Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for architecture details
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the documentation
3. Check console logs for errors
4. Verify environment variables

Happy coding! 🚀
