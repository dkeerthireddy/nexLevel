import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import client from './lib/apollo';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyChallenges from './pages/MyChallenges';
import Browse from './pages/Browse';
import CreateChallenge from './pages/CreateChallenge';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import AICoach from './pages/AICoach';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import VerifyEmailCode from './pages/VerifyEmailCode';
import ChallengeDetail from './pages/ChallengeDetail';

// Layout
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/verify-email-code" element={<VerifyEmailCode />} />
              
              {/* Protected routes with layout */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/challenges" element={<MyChallenges />} />
                <Route path="/challenge/:challengeId" element={<ChallengeDetail />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/create-challenge" element={<CreateChallenge />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ai-coach" element={<AICoach />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
