# StreakMate 🔥

**Build Better Habits Together** - A modern habit tracking app with AI coaching, social accountability, and gamification.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🌟 Features

- 📊 **Challenge Tracking** - Create and join customizable habit challenges
- ✅ **Daily Check-ins** - Task-based tracking with optional notes
- 🔥 **Streak Management** - Visual progress and streak tracking
- 👥 **Social Accountability** - Partner with friends on challenges
- 🤖 **AI Coach** - Powered by Google Gemini for personalized motivation
- 🌓 **Dark Mode** - Full dark mode support
- 📧 **Email Notifications** - Reminders and partner activity alerts
- 🔐 **Secure Authentication** - JWT + email verification + 2FA
- 📱 **Responsive Design** - Works on all devices

---

## 🚀 Quick Start for Users

Visit the deployed app at your domain, sign up, and start building better habits! No technical setup required for end users.

---

## 💻 For Developers - Local Development

### Prerequisites

- Node.js 16+
- MongoDB (Atlas recommended)
- Gmail account (for emails)
- Cloudinary account (for images)

### Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/streakmate.git
   cd streakmate
   
   # Install API dependencies
   cd api && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy templates
   cp api/.env.example api/.env
   cp client/.env.example client/.env
   ```
   
   Edit the `.env` files with your credentials (see below).

3. **Start Development Servers**
   ```bash
   # Terminal 1 - API
   cd api && npm run dev
   
   # Terminal 2 - Client
   cd client && npm run dev
   ```

4. **Access the App**
   - Client: http://localhost:5173
   - API: http://localhost:4000/graphql

---

## 🌍 Production Deployment to Vercel

### What You'll Need (All Free Accounts)

1. **GitHub** - [Sign up](https://github.com/signup)
2. **Vercel** - [Sign up](https://vercel.com/signup) (use GitHub to sign in)
3. **MongoDB Atlas** - [Sign up](https://www.mongodb.com/cloud/atlas/register)
4. **Gmail** - Your existing Gmail + [App Password](https://myaccount.google.com/apppasswords)
5. **Cloudinary** - [Sign up](https://cloudinary.com/users/register/free)
6. **Google Gemini** (Optional) - [Get API Key](https://aistudio.google.com/app/apikey)

---

## 📦 Step-by-Step Deployment Guide

### Step 1: Get Your Service Credentials (10 minutes)

#### MongoDB Atlas (3 minutes)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string: `mongodb+srv://user:password@cluster.mongodb.net/streakmate?retryWrites=true&w=majority`
5. Go to "Network Access" → Add IP Address → "Allow Access from Anywhere"

#### Gmail App Password (2 minutes)
1. Enable 2-Step Verification on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create password for "StreakMate"
4. Copy 16-character password (remove spaces)

#### Cloudinary (3 minutes)
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret

#### Google Gemini - Optional (2 minutes)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API Key
3. Copy the key

---

### Step 2: Push to GitHub (5 minutes)

```bash
cd streakmate

# Initialize Git
git init
git add .
git commit -m "Initial commit - StreakMate"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/streakmate.git

# Push to GitHub
git push -u origin main
```

**Important:** Verify that `api/.env` and `client/.env` are NOT visible on GitHub! Only `.env.example` files should be there.

---

### Step 3: Deploy API to Vercel (5 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **Configure Project:**
   - Project Name: `streakmate-api`
   - Framework Preset: **Other**
   - Root Directory: **`.`** (root, not a subdirectory)
5. **Add Environment Variables** (click "Environment Variables"):

```bash
# Required - Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/streakmate?retryWrites=true&w=majority

# Required - Authentication (generate random 32+ char string)
JWT_SECRET=your-super-secret-random-string-min-32-chars

# Required - Email
ADMIN_EMAIL=your@gmail.com
ADMIN_EMAIL_PASSWORD=your-16-char-app-password

# Required - File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional - AI Features
GEMINI_API_KEY=your-gemini-key

# Required - Configuration
NODE_ENV=production
APP_URL=https://temp-will-update-later.vercel.app
CLIENT_URL=https://temp-will-update-later.vercel.app
CRON_SECRET=another-random-32-char-string

# Optional - OAuth (can skip for now)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
```

6. Click **"Deploy"**
7. Wait for deployment to complete (2-3 minutes)
8. **Save your API URL**: `https://streakmate-api-xyz.vercel.app`

**Generate Random Secrets:**
```bash
# Mac/Linux:
openssl rand -base64 32

# Windows PowerShell:
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))
```

---

### Step 4: Deploy Client to Vercel (5 minutes)

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import the **SAME GitHub repository** again
3. **Configure Project:**
   - Project Name: `streakmate-client`
   - Framework Preset: **Vite**
   - Root Directory: Click **"Edit"** → Select **`client`**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add Environment Variables:**

```bash
# Replace YOUR-API-URL with your actual API URL from Step 3
VITE_GRAPHQL_ENDPOINT=https://YOUR-API-URL.vercel.app/graphql
VITE_API_URL=https://YOUR-API-URL.vercel.app
VITE_APP_NAME=StreakMate
VITE_APP_URL=https://temp-will-get-after-deploy.vercel.app
```

5. Click **"Deploy"**
6. Wait for deployment (2-3 minutes)
7. **Save your Client URL**: `https://streakmate-client-abc.vercel.app`

---

### Step 5: Update API with Client URL (2 minutes)

1. Go back to your **API project** in Vercel
2. Go to **Settings** → **Environment Variables**
3. **Edit** these two variables with your actual client URL:
   - `APP_URL` = `https://your-actual-client-url.vercel.app`
   - `CLIENT_URL` = `https://your-actual-client-url.vercel.app`
4. Go to **Deployments** tab
5. Click **"..."** on latest deployment → **"Redeploy"**

---

### Step 6: Test Your Deployment! (2 minutes)

1. Visit your client URL: `https://your-client-url.vercel.app`
2. Click **"Sign Up"**
3. Create a test account
4. Check your email for verification code
5. Verify email and log in
6. Create a challenge
7. Test check-in functionality

**🎉 Congratulations! Your app is live!**

---

## 🔐 Environment Variables Reference

### API (Backend) - Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@...` |
| `JWT_SECRET` | Secret for JWT tokens (32+ chars) | `random-secret-string` |
| `ADMIN_EMAIL` | Gmail address for system emails | `your@gmail.com` |
| `ADMIN_EMAIL_PASSWORD` | Gmail App Password | `abcdefghijklmnop` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz` |
| `NODE_ENV` | Environment | `production` |
| `APP_URL` | Your client URL | `https://your-app.vercel.app` |
| `CLIENT_URL` | Your client URL (same) | `https://your-app.vercel.app` |
| `CRON_SECRET` | Secret for cron jobs | `random-secret-string` |

### API (Backend) - Optional

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini for AI features |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |

### Client (Frontend) - Required

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GRAPHQL_ENDPOINT` | API GraphQL endpoint | `https://api-url.vercel.app/graphql` |
| `VITE_API_URL` | API base URL | `https://api-url.vercel.app` |
| `VITE_APP_NAME` | Application name | `StreakMate` |
| `VITE_APP_URL` | Client URL | `https://your-app.vercel.app` |

---

## 🏗️ Project Structure

```
streakmate/
├── api/                    # Backend GraphQL API
│   ├── graphql/           # Schema & resolvers
│   ├── lib/               # Auth, email, AI utilities
│   ├── cron/              # Scheduled jobs
│   ├── routes/            # REST endpoints
│   ├── .env.example       # Environment template
│   └── package.json
│
├── client/                # Frontend React app
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Apollo, GraphQL
│   ├── .env.example       # Environment template
│   └── package.json
│
├── vercel.json            # Vercel configuration
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Apollo Client (GraphQL)
- React Router v6
- Lucide Icons

### Backend
- Node.js
- GraphQL (Apollo Server)
- MongoDB (native driver)
- JWT + bcrypt
- Cloudinary (file storage)
- Google Gemini (AI)
- Nodemailer (email)

---

## 🆘 Troubleshooting

### Issue: Email not sending
**Solution:**
- Verify `ADMIN_EMAIL` is correct Gmail address
- Verify `ADMIN_EMAIL_PASSWORD` is App Password (not regular password)
- Check spam folder

### Issue: "Network Error" when loading app
**Solution:**
- Check `VITE_GRAPHQL_ENDPOINT` has `/graphql` at the end
- Verify API is deployed and running
- Check browser console for errors

### Issue: Database connection failed
**Solution:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas "Network Access" allows 0.0.0.0/0
- Ensure database user has read/write permissions

### Issue: "Unauthorized" errors
**Solution:**
- Verify `JWT_SECRET` is set in API environment variables
- Make sure secret is at least 32 characters

### Issue: Images not uploading
**Solution:**
- Check Cloudinary credentials are correct
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`

---

## 🔄 Continuous Deployment

After initial setup, deployment is automatic:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
3. Vercel automatically deploys both API and client
4. Check deployment status in Vercel dashboard

---

## 🌐 Custom Domain (Optional)

### Add Domain to Vercel

1. Go to your Vercel project → Settings → Domains
2. Add your domain (e.g., `app.yourdomain.com` for client, `api.yourdomain.com` for API)
3. Follow DNS configuration instructions
4. Update environment variables with new URLs
5. Redeploy

---

## 📱 Key Pages

- `/dashboard` - Overview of challenges and stats
- `/challenges` - Manage active challenges
- `/challenge/:id` - Detailed challenge view with participants
- `/browse` - Discover new challenges
- `/create-challenge` - Create custom challenges
- `/progress` - Track progress and achievements
- `/ai-coach` - AI-powered coaching
- `/profile` - User profile and settings

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification
- Two-factor authentication (2FA)
- Rate limiting
- Secure password reset
- CORS protection
- Environment variable protection

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- AI powered by Google Gemini
- Hosted on Vercel

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review environment variables configuration

---

## 🗺️ Roadmap

- [ ] Mobile native apps
- [ ] Team challenges
- [ ] Advanced analytics
- [ ] Fitness tracker integration
- [ ] Public challenge marketplace
- [ ] Gamification with badges

---

**Built with ❤️ for building better habits together**
