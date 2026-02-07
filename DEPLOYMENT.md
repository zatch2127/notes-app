# Deployment Guide

## Quick Deploy to Production

### Option 1: Railway (Backend) + Vercel (Frontend)

#### Backend Deployment on Railway

1. **Sign up at Railway.app**
   ```
   https://railway.app
   ```

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create DATABASE_URL

4. **Set Environment Variables**
   ```
   JWT_SECRET=your-super-secret-key-at-least-32-characters-long
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Deploy**
   - Railway auto-deploys on every push
   - Copy the deployment URL (e.g., https://your-app.railway.app)

6. **Run Migrations**
   ```bash
   # In Railway dashboard, open shell and run:
   npm run migrate
   ```

#### Frontend Deployment on Vercel

1. **Sign up at Vercel.com**
   ```
   https://vercel.com
   ```

2. **Import Project**
   - Click "Import Project"
   - Select your GitHub repository
   - Set Root Directory to `frontend`

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variable**
   ```
   VITE_API_URL=https://your-app.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - You'll get a URL like https://your-app.vercel.app

6. **Update Backend FRONTEND_URL**
   - Go back to Railway
   - Update FRONTEND_URL to match your Vercel URL
   - Redeploy backend

### Option 2: Render (Backend + Database) + Netlify (Frontend)

#### Backend on Render

1. **Sign up at Render.com**

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Choose plan (Free tier available)
   - Copy Internal Database URL

3. **Create Web Service**
   - New → Web Service
   - Connect your repository
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`

4. **Environment Variables**
   ```
   DATABASE_URL=[Paste from PostgreSQL]
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-app.netlify.app
   ```

5. **Deploy & Migrate**
   - Deploy will start automatically
   - After deployment, go to Shell and run:
   ```bash
   npm run migrate
   ```

#### Frontend on Netlify

1. **Sign up at Netlify.com**

2. **Import from Git**
   - New site from Git
   - Choose repository
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variable**
   ```
   VITE_API_URL=https://your-app.onrender.com
   ```

4. **Deploy**
   - Deploy site
   - Copy the URL and update Render's FRONTEND_URL

## Local Development Setup

### Prerequisites
```bash
node -v  # Should be 18+
psql --version  # Should be 14+
```

### Database Setup
```bash
# Create PostgreSQL database
createdb collab_notes_dev

# Or using psql:
psql
CREATE DATABASE collab_notes_dev;
\q
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://localhost/collab_notes_dev
JWT_SECRET=dev-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EOF

# Run migrations
npm run migrate

# Start server
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## Testing the Deployment

### Test Backend Health
```bash
curl https://your-backend-url.railway.app/health
```

### Test Authentication
```bash
# Register
curl -X POST https://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Common Issues & Solutions

### Issue: Database connection fails
**Solution**: Check DATABASE_URL format:
```
postgresql://username:password@host/database?sslmode=require
```

### Issue: CORS errors
**Solution**: Ensure FRONTEND_URL in backend matches exact frontend URL (including https://)

### Issue: WebSocket connection fails
**Solution**: 
1. Check if backend supports WebSocket
2. Verify firewall allows WebSocket connections
3. Ensure frontend uses correct protocol (wss:// for https)

### Issue: Migrations fail
**Solution**:
```bash
# Connect to production database
psql $DATABASE_URL

# Run migration SQL manually
# Copy schema from backend/src/database/migrate.js
```

## Environment Variables Checklist

### Backend (.env)
- [x] DATABASE_URL - PostgreSQL connection string
- [x] JWT_SECRET - At least 32 characters
- [x] JWT_EXPIRES_IN - Token expiration (e.g., 7d)
- [x] FRONTEND_URL - Exact frontend URL
- [x] NODE_ENV - Set to 'production'
- [ ] PORT - Usually set by hosting platform

### Frontend (.env)
- [x] VITE_API_URL - Backend URL

## Performance Tips

1. **Database Indexing**: Already included in migrations
2. **Connection Pooling**: Configured in db.js
3. **Compression**: Enabled in server.js
4. **Caching**: Add Redis for session storage (optional)

## Monitoring

### Backend Logs
- Railway: View in dashboard
- Render: View in logs tab

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for monitoring

## Security Checklist

- [x] Environment variables not committed
- [x] JWT secret is strong and unique
- [x] HTTPS enabled (automatic on Railway/Vercel)
- [x] CORS configured for specific origin
- [x] SQL injection prevention (parameterized queries)
- [x] Password hashing (bcrypt)
- [x] Input validation (Joi)
- [ ] Rate limiting enabled
- [ ] API rate limits per user

## Scaling

### Database
- Upgrade PostgreSQL plan as needed
- Add read replicas for heavy read operations

### Backend
- Railway/Render auto-scale
- Add Redis for session management
- Consider serverless functions for specific endpoints

### Frontend
- Vercel/Netlify have CDN built-in
- Already optimized with code splitting

## Backup Strategy

### Database Backups
```bash
# Railway: Automated daily backups
# Render: Configure in database settings

# Manual backup:
pg_dump $DATABASE_URL > backup.sql
```

### Code
- Git repository is your backup
- Tag releases for easy rollback

## Next Steps After Deployment

1. Test all features thoroughly
2. Create demo user accounts
3. Monitor error logs
4. Set up alerts for downtime
5. Create user documentation
6. Add analytics (optional)

## Support

For issues:
1. Check logs in hosting dashboard
2. Review environment variables
3. Test API endpoints with curl
4. Check database connectivity
5. Verify WebSocket connections

---

**Congratulations!** Your collaborative notes app is now live! 🎉
