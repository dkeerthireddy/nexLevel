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
- **Timezone Support** - 24-hour check-in windows reset at midnight in your timezone

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
- **Admin Dashboard** - System statistics, user management, and challenge deletion (admin only)
- **Certificates** - Generate achievement certificates for completed challenges
- **Mobile-First Design** - Responsive UI optimized for all devices

---

## 🚀 Quick Start - Local Development

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** database (MongoDB Atlas recommended)
- **Email Service** (Gmail with app password)
- **AI API Key** (Google Gemini API)

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
# MongoDB Connection (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret (Required) - Generate with: openssl rand -base64 32
JWT_SECRET=your-randomly-generated-secret-key-min-32-chars

# Email Configuration (Required for notifications)
ADMIN_EMAIL=your-email@example.com
ADMIN_EMAIL_PASSWORD=your-email-app-password

# AI API Key (Required for AI features)
GEMINI_API_KEY=your-api-key-here

# Optional: Image Upload Service
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Environment
NODE_ENV=development
PORT=4000
```

#### Client Configuration (`client/.env`)
Create `client/.env` from `client/.env.example`:

```env
# API Endpoint
VITE_API_URL=http://localhost:4000/graphql
```

### 4. Start Development Servers

```bash
# Start both client and API concurrently
npm run dev

# Or start individually:
npm run dev:client   # Client on http://localhost:5173
npm run dev:api      # API on http://localhost:4000
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **GraphQL Playground**: http://localhost:4000/graphql

---

## 🔧 Configuration

### Making a User Admin
```bash
cd api
node scripts/make-admin.js user@example.com
```

### Seeding Popular Challenges (Optional)
```bash
cd api
node scripts/seed-popular-challenges.js
```

---

## 📡 API Documentation

### GraphQL Endpoint
```
http://localhost:4000/graphql
```

### Example Queries

```graphql
# Get current user
query {
  me {
    id
    email
    displayName
    timezone
    stats {
      totalChallenges
      activeChallenges
      totalCheckIns
      longestStreak
    }
  }
}

# Browse challenges
query {
  challenges(category: "Fitness", limit: 10) {
    id
    name
    description
    category
    stats {
      totalUsers
      activeUsers
    }
  }
}

# Get user's active challenges
query {
  myActiveChallenges {
    id
    challenge {
      name
      description
    }
    currentStreak
    completionRate
    taskProgress {
      task {
        title
      }
      completed
    }
  }
}
```

### Example Mutations

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
│   ├── scripts/          # Admin utilities
│   └── package.json
│
└── package.json          # Root workspace config
```

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
