import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * OAuth Callback Handler
 * Handles the redirect from OAuth providers and stores the token
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetchUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Store token
      localStorage.setItem('authToken', token);
      
      // Refetch user data
      refetchUser().then(() => {
        navigate('/dashboard');
      }).catch((err) => {
        console.error('Failed to fetch user:', err);
        navigate('/login?error=auth_failed');
      });
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, refetchUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-cyan-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing you in...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication</p>
      </div>
    </div>
  );
};

export default AuthCallback;
