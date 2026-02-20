# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Verification

### Code Quality
- [x] All bug fixes implemented and tested (96% pass rate)
- [x] Task Progress Management working
- [x] Feature Requests system working
- [x] Friend Activity Feed working
- [x] Photo upload gracefully disabled
- [x] No console errors in production build
- [x] All TypeScript/ESLint errors resolved

### Environment Configuration
- [ ] MongoDB Atlas cluster created and configured
- [ ] Production MongoDB URI set in environment variables
- [ ] JWT_SECRET generated (use: `openssl rand -base64 32`)
- [ ] Gmail App Password configured for ADMIN_EMAIL
- [ ] Google Gemini API key obtained and configured
- [ ] Cloudinary credentials set (optional, currently disabled)
- [ ] CORS_ORIGIN set to production domain
- [ ] NODE_ENV=production

### Security
- [x] All sensitive data in .env files (not committed)
- [x] .gitignore properly configured
- [x] Password hashing enabled (bcrypt)
- [x] JWT authentication working
- [x] 2FA implementation tested
- [x] Email verification required
- [ ] Rate limiting configured (optional)
- [ ] SSL/HTTPS enabled on production domain

### Database
- [ ] MongoDB indexes created (automatic on first run)
- [ ] Database backups configured
- [ ] Connection string uses SSL
- [ ] Database user has appropriate permissions

### Testing
- [x] 24/25 tests passing (96%)
- [x] Authentication flows tested
- [x] Challenge CRUD operations tested
- [x] AI features tested
- [x] Social features tested
- [x] Email features tested

---

## 🌐 Deployment Steps

### Option 1: Vercel (Recommended)

#### Frontend Deployment
```bash
cd client
npm run build
vercel --prod
```

**Environment Variables to Set:**
- `VITE_GRAPHQL_ENDPOINT`
- `VITE_API_URL`
- `VITE_APP_NAME`
- `VITE_APP_URL`

#### Backend Deployment
```bash
cd api
vercel --prod
```

**Environment Variables to Set:**
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_EMAIL_PASSWORD`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME` (optional)
- `CLOUDINARY_API_KEY` (optional)
- `CLOUDINARY_API_SECRET` (optional)
- `PORT`
- `NODE_ENV=production`
- `APP_URL`
- `CLIENT_URL`
- `CORS_ORIGIN`

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy API
cd api
railway up

# Deploy Client
cd ../client
railway up
```

### Option 3: Heroku

```bash
# Install Heroku CLI
# Create apps
heroku create nexlevel-api
heroku create nexlevel-client

# Set environment variables
heroku config:set MONGODB_URI=... --app nexlevel-api
heroku config:set JWT_SECRET=... --app nexlevel-api
# ... (all other env vars)

# Deploy
git push heroku main
```

---

## 🔍 Post-Deployment Verification

### Health Checks
- [ ] API health endpoint responding: `GET /health`
- [ ] GraphQL playground accessible: `/graphql`
- [ ] Frontend loads without errors
- [ ] Database connection successful

### Functional Testing
- [ ] User can sign up
- [ ] User can log in
- [ ] Email verification works
- [ ] Password reset works
- [ ] Create challenge works
- [ ] Join challenge works
- [ ] Check-in works
- [ ] AI recommendations work
- [ ] Friend features work
- [ ] Notifications work

### Performance
- [ ] API response time < 500ms
- [ ] Frontend loads < 3 seconds
- [ ] No memory leaks
- [ ] Database queries optimized

### Monitoring
- [ ] Error logging configured (e.g., Sentry)
- [ ] Performance monitoring (e.g., New Relic)
- [ ] Uptime monitoring (e.g., UptimeRobot)
- [ ] Email delivery monitoring

---

## 🎯 Production Configuration

### Required Services

1. **MongoDB Atlas** (Database)
   - Free tier available
   - Automatic backups
   - Global distribution

2. **Gmail** (Email Service)
   - App password required
   - Sends verification emails, password resets

3. **Google Gemini AI** (AI Features)
   - Free tier: 60 requests/minute
   - Required for AI coach, insights, recommendations

4. **Vercel** (Hosting - Recommended)
   - Free tier available
   - Automatic deployments
   - SSL included

### Optional Services

5. **Cloudinary** (Image Hosting)
   - Currently disabled
   - Enable when needed for photo uploads

6. **Sentry** (Error Tracking)
   - Recommended for production
   - Real-time error alerts

---

## 🔧 Environment Variables Reference

### Critical (Required)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<generate-with-openssl>
ADMIN_EMAIL=your-email@gmail.com
ADMIN_EMAIL_PASSWORD=<16-char-app-password>
NODE_ENV=production
```

### Highly Recommended
```env
GEMINI_API_KEY=<google-ai-studio-key>
CORS_ORIGIN=https://your-domain.com
APP_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com
```

### Optional
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## 📊 Success Metrics

After deployment, verify:
- ✅ **Uptime**: >99.9%
- ✅ **Response Time**: <500ms (API), <3s (Frontend)
- ✅ **Error Rate**: <1%
- ✅ **User Signup Success**: >95%
- ✅ **Email Delivery**: >98%
- ✅ **AI Feature Availability**: >99%

---

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check connection string
- Verify IP whitelist (0.0.0.0/0 for serverless)
- Check database user permissions

**Email Not Sending**
- Verify Gmail App Password (16 chars, no spaces)
- Check ADMIN_EMAIL is correct
- Enable "Less secure apps" if needed

**AI Features Not Working**
- Verify GEMINI_API_KEY is set
- Check API quota limits
- Review error logs

**CORS Errors**
- Update CORS_ORIGIN to match frontend domain
- Include https:// in origin
- Check trailing slashes

---

## 🎉 Deployment Complete!

Once all checklist items are complete:
1. Monitor error logs for first 24 hours
2. Set up automated backups
3. Configure monitoring alerts
4. Document any custom configurations
5. Share access with team

---

**Need Help?**
- Check application logs
- Review MongoDB Atlas logs
- Contact support team
