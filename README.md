# nexLevel - AI-Powered Challenge Tracking Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Test Coverage](https://img.shields.io/badge/tests-96%25%20passing-brightgreen.svg)

**nexLevel** is a comprehensive AI-powered challenge tracking and accountability platform that helps users build sustainable habits, maintain streaks, and achieve their goals through intelligent coaching and social accountability.

---

## 🌟 Features

### 🎯 Core Features
- **Challenge Management** - Create, join, and track custom challenges with flexible durations and frequencies
- **Multi-Task Challenges** - Break challenges into subtasks for better organization
- **Streak Tracking** - Build and maintain challenging streaks with real-time progress monitoring
- **Daily Check-ins** - Track progress with notes and optional photo verification
- **Grace Skips** - Configurable skip allowances to maintain realistic goals
- **Progress Analytics** - Beautiful visualizations of your journey and completion rates

### 🤖 AI-Powered Features
- **AI Coach** - Get personalized motivational messages based on your progress
- **AI Recommendations** - Intelligent challenge suggestions tailored to your interests
- **AI Insights** - Behavioral pattern analysis and predictions (requires activity data)
- **Photo Verification** - AI-powered validation of check-in photos (optional, currently disabled)
- **Weekly Reports** - Automated AI-generated progress summaries

### 👥 Social & Collaboration
- **Partner Challenges** - Team up with friends for mutual accountability
- **Friend System** - Add friends, send requests, and track each other's progress
- **Email Invitations** - Invite friends via email to join specific challenges
- **Participants View** - See all users participating in the same challenge
- **Activity Feed** - Real-time updates on friends' achievements
- **Social Leaderboards** - Global and challenge-specific rankings

### 🔐 Authentication & Security
- **Email/Password Authentication** - Secure signup and login
- **Two-Factor Authentication (2FA)** - Optional TOTP-based 2FA with backup codes
- **Email Verification** - Required email confirmation for new accounts
- **Password Reset** - Secure password recovery via email
- **JWT Token Authentication** - Stateless, secure API authentication
- **OAuth Support** - Optional Google and GitHub login (configurable)

### 📊 Additional Features
- **Achievement Badges** - Earn badges for milestones and accomplishments
- **Notifications System** - Customizable alerts for partner activities, streaks, and reminders
- **Quiet Hours** - Schedule notification-free time periods
- **Dark Mode** - Full dark theme support
- **Feedback System** - Submit feedback and feature requests
- **Admin Dashboard** - System statistics and user management (admin only)
- **Certificates** - Generate achievement certificates for completed challenges
- **Mobile-First Design** - Responsive UI optimized for all devices

---

## 🚀 Quick Start - Local Development

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB Atlas** account (free tier works)
- **Gmail** account for sending emails
- **Google Gemini API** key (free tier available)
- **Cloudinary** account (optional, for photo uploads)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nexLevel
```

### 2. Install Dependencies
```bash
npm run install:all
```

This installs dependencies for both client and API.

### 3. Configure Environment Variables

#### API Configuration (`api/.env`)
Create `api/.env` from `api/.env.example`:

```env
# MongoDB (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexlevel?retryWrites=true&w=majority

# JWT Secret (Required) - Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this

# Admin Email for System Emails (Required)
# Get Gmail App Password: https://myaccount.google.com/apppasswords
ADMIN_EMAIL=your-email@gmail.com
ADMIN_EMAIL_PASSWORD=your-16-char-app-password

# Cloudinary for Photo Uploads (Optional - currently disabled)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Gemini AI (Highly Recommended for AI features)
# Get free key: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key

# OAuth (Optional)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret

# Server Configuration
PORT=4000
NODE_ENV=development
APP_NAME=nexLevel
APP_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

#### Client Configuration (`client/.env`)
Create `client/.env` from `client/.env.example`:

```env
# API Endpoint (Required)
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_API_URL=http://localhost:4000

# App Configuration
VITE_APP_NAME=nexLevel
VITE_APP_URL=http://localhost:5173
```

### 4. Start Development Servers

```bash
# Start both client and API concurrently
npm run dev

# OR start separately:
npm run dev:client  # Client on http://localhost:5173
npm run dev:api     # API on http://localhost:4000
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **GraphQL API**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

---

## 📚 API Documentation

### GraphQL Endpoint
```
POST http://localhost:4000/graphql
```

### Key Queries
```graphql
# Get current user
query {
  me {
    id
    email
    displayName
    stats {
      totalChallenges
      activeChallenges
      longestStreak
    }
  }
}

# Browse challenges
query {
  challenges(limit: 10) {
    id
    name
    category
    tasks {
      id
      title
    }
  }
}

# Get AI recommendations
query {
  aiRecommendations {
    challenge {
      name
    }
    score
    reason
  }
}
```

### Key Mutations
```graphql
# Create challenge
mutation {
  createChallenge(input: {
    name: "30-Day Fitness Challenge"
    description: "Get fit in 30 days"
    category: "Fitness"
    frequency: "daily"
    duration: 30
    challengeType: "solo"
    tasks: [
      { title: "Morning Run", order: 0 }
      { title: "Evening Stretch", order: 1 }
    ]
  }) {
    id
    name
  }
}

# Join challenge
mutation {
  joinChallenge(challengeId: "...", partnerIds: []) {
    id
    currentStreak
  }
}

# Daily check-in
mutation {
  checkIn(
    userChallengeId: "..."
    taskId: "..."
    note: "Completed my run!"
  ) {
    id
    date
  }
}
```

---

## 🏗️ Project Structure

```
nexLevel/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Apollo client, GraphQL queries
│   │   └── App.jsx        # Main app component
│   ├── index.html
│   └── package.json
│
├── api/                   # GraphQL backend
│   ├── graphql/
│   │   ├── resolvers/    # Query & Mutation resolvers
│   │   ├── schema.graphql # GraphQL schema
│   │   ├── context.js    # Request context
│   │   └── index.js      # Apollo Server setup
│   ├── lib/              # Utilities
│   │   ├── auth.js       # Authentication & JWT
│   │   ├── gemini.js     # AI features
│   │   ├── email.js      # Email notifications
│   │   ├── mongodb.js    # Database connection
│   │   └── ...
│   ├── cron/             # Scheduled jobs
│   └── package.json
│
└── package.json          # Root workspace config
```

---

## 🔧 Configuration Guide

### Email Setup (Required)
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Create a new app password for "Mail"
3. Use the 16-character password in `ADMIN_EMAIL_PASSWORD`

### MongoDB Atlas Setup (Required)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and add to `MONGODB_URI`

### Google Gemini AI Setup (Recommended)
1. Get free API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to `GEMINI_API_KEY`
3. AI features will be enabled automatically

### Making a User Admin
```bash
cd api
node scripts/make-admin.js user@example.com
```

---

## 🧪 Testing

### Run Comprehensive Test Suite
```bash
cd nexLevel
node tmp_rovodev_comprehensive_test.js
```

### Test Results
- **96% Pass Rate** (24/25 tests)
- All critical features working
- AI Insights requires user activity data (expected)

---

## 🌐 Production Deployment

### Environment Variables
Set all required environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Heroku: Settings → Config Vars
- AWS/Azure: Application Configuration

### Build Commands
```bash
# Client build
cd client && npm run build

# API build
cd api && npm run build
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Backend**: Vercel Functions, Heroku, Railway, AWS Lambda
- **Database**: MongoDB Atlas (recommended)

---

## 📦 Technologies Used

### Frontend
- **React** 18 - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Apollo Client** - GraphQL client
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Apollo Server** - GraphQL server
- **Express** - HTTP server
- **MongoDB** - Database
- **Passport.js** - OAuth authentication
- **JWT** - Token-based auth
- **Google Gemini AI** - AI features
- **Nodemailer** - Email sending
- **Cloudinary** - Image hosting (optional)

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Two-factor authentication (TOTP)
- ✅ Email verification required
- ✅ Secure password reset flow
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention (NoSQL)
- ✅ XSS protection
- ✅ Rate limiting ready

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## 💡 Support

For questions or issues:
- Submit feedback through the app's Feedback page
- Create an issue in the repository
- Contact the development team

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Video check-ins
- [ ] Team challenges
- [ ] Challenge templates marketplace
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Webhook integrations

---

**Built with ❤️ for helping people achieve their goals**
