import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN, SIGNUP, GET_ME } from '../lib/graphql';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('authToken'));

  // Get current user - always call the hook, but skip based on state
  const { data, refetch } = useQuery(GET_ME, {
    skip: !hasToken,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
        localStorage.setItem('user', JSON.stringify(data.me));
      }
      setLoading(false);
    },
    onError: (error) => {

      // Clear invalid authentication
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setHasToken(false);
      setLoading(false);
    }
  });

  // Login mutation
  const [loginMutation] = useMutation(LOGIN);

  // Signup mutation
  const [signupMutation] = useMutation(SIGNUP);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setHasToken(true);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        setHasToken(false);
      }
    } else {
      setHasToken(false);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const result = await loginMutation({ variables: { email, password } });
      
      // Debug logging

      // Apollo Client throws errors for GraphQL errors, so if we get here, result.data should exist
      if (!result || !result.data || !result.data.login) {
        console.error('❌ Unexpected response structure:', result);
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      
      const { token, user } = result.data.login;
      
      if (!token || !user) {
        console.error('❌ Missing token or user:', { token: !!token, user: !!user });
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setHasToken(true);

      return { success: true, redirectTo: '/dashboard' };
    } catch (error) {
      console.error('❌ Login error:', error);
      // GraphQL errors are thrown by Apollo Client - extract the message
      const message = error.graphQLErrors?.[0]?.message || error.message || 'Invalid email or password. Please check your credentials and try again.';
      throw new Error(message);
    }
  };

  const signup = async (email, password, displayName, timezone) => {
    try {
      const result = await signupMutation({ variables: { email, password, displayName, timezone } });
      
      // Debug logging

      // Apollo Client throws errors for GraphQL errors, so if we get here, result.data should exist
      if (!result || !result.data || !result.data.signup) {
        console.error('❌ Unexpected response structure:', result);
        throw new Error('Unexpected response from server. Please try again.');
      }
      
      const { token, user } = result.data.signup;
      
      if (!token || !user) {
        console.error('❌ Missing token or user:', { token: !!token, user: !!user });
        throw new Error('Incomplete signup data. Please try again.');
      }
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setHasToken(true);

      return { success: true, redirectTo: '/verify-email-code' };
    } catch (error) {
      console.error('❌ Signup error:', error);
      // GraphQL errors are thrown by Apollo Client - extract the message
      const message = error.graphQLErrors?.[0]?.message || error.message || 'Signup failed';
      throw new Error(message);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setHasToken(false);
    return { success: true, redirectTo: '/login' };
  }, []);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refetchUser: refetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
