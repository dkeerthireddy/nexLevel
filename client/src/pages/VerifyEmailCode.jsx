import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { VERIFY_EMAIL, RESEND_VERIFICATION_EMAIL } from '../lib/graphql';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const VerifyEmailCode = () => {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [verifyEmail, { loading }] = useMutation(VERIFY_EMAIL, {
    onCompleted: async () => {
      setSuccess(true);
      await refetchUser();
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    },
    onError: (error) => {
      console.error('Email verification error:', error);
      setError(error.message || 'Invalid verification code. Please try again.');
    }
  });

  const [resendEmail, { loading: resending }] = useMutation(RESEND_VERIFICATION_EMAIL, {
    onCompleted: () => {
      setError('');
      alert('✅ Verification code resent! Check your email.');
    },
    onError: (error) => {
      console.error('Resend error:', error);
      setError('Failed to resend code. Please try again.');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    await verifyEmail({ variables: { code: code.trim() } });
  };

  const handleResend = async () => {
    await resendEmail();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified! 🎉</h2>
            <p className="text-gray-600 mb-4">
              Your email has been successfully verified. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-cyan-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">
            We sent a 6-digit verification code to <strong>{user?.email}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1 text-center">Enter the 6-digit code from your email</p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-cyan-600 hover:text-indigo-700 font-medium text-sm disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Skip for now (verify later in settings)
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailCode;
