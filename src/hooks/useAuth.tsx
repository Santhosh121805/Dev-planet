import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'web3' | 'email';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      
      // Start OAuth flow
      if (provider === 'google') {
        await initiateGoogleAuth();
      } else if (provider === 'github') {
        await initiateGithubAuth();
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const handleAuthCallback = async (code: string, provider: 'google' | 'github') => {
    try {
      const response = await fetch(`http://localhost:8000/api/auth/${provider}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          code,
          username: '', // Will be filled by backend from provider
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData = await response.json();
      
      const userData: User = {
        id: authData.user_id,
        username: authData.username,
        email: authData.email,
        avatar_url: authData.avatar_url,
        provider: authData.provider,
      };

      setUser(userData);
      setToken(authData.access_token);
      
      // Store in localStorage
      localStorage.setItem('auth_token', authData.access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      setLoading(false);
      
      return authData;
    } catch (error) {
      console.error('Auth callback failed:', error);
      setLoading(false);
      throw error;
    }
  };

  // Check URL for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      const provider = state as 'google' | 'github';
      if (provider === 'google' || provider === 'github') {
        handleAuthCallback(code, provider);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// OAuth utilities
const initiateGoogleAuth = async () => {
  // Get auth URL from backend
  try {
    const response = await fetch('http://localhost:8000/api/auth/google/url');
    const data = await response.json();
    window.location.href = data.auth_url;
  } catch (error) {
    console.error('Failed to get Google auth URL:', error);
    // Fallback to direct URL construction
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/`,
      scope: 'openid email profile',
      response_type: 'code',
      state: 'google',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  }
};

const initiateGithubAuth = async () => {
  // Get auth URL from backend  
  try {
    const response = await fetch('http://localhost:8000/api/auth/github/url');
    const data = await response.json();
    window.location.href = data.auth_url;
  } catch (error) {
    console.error('Failed to get GitHub auth URL:', error);
    // Fallback to direct URL construction
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/`,
      scope: 'user:email',
      state: 'github',
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    window.location.href = authUrl;
  }
};