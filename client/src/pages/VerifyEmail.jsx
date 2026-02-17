import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { VERIFY_EMAIL } from '../lib/graphql';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error

  const [verifyEmail] = useMutation(VERIFY_EMAIL, {
    onCompleted: () => {
      setStatus('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    },
    onError: (error) => {
      console.error('Email verification error:', error);
      setStatus('error');
    }
  });

  useEffect(() => {
    if (token) {
      verifyEmail({ variables: { token } });
    } else {
      setStatus('error');
    }
  }, [token, verifyEmail]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h2>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You now have access to all features!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to dashboard...
            </p>
            <Link 
              to="/dashboard"
              className="inline-block bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">
            This verification link is invalid or has expired.
          </p>
          <div className="space-y-3">
            <Link 
              to="/dashboard"
              className="block bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700"
            >
              Go to Dashboard
            </Link>
            <Link 
              to="/login"
              className="block text-gray-600 hover:text-gray-800"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
