import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/models';
import { authAPI } from '@/lib/apiClient';
import { getJwtToken, setJwtToken, clearJwtToken } from '@/lib/auth/jwt';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getUserPermission: (permission: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  getUserPermission: () => false,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getJwtToken();
        
        if (token) {
          // Validate token
          try {
            // Decode token to check expiration
            // Simple JWT parsing (token has format: header.payload.signature)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
              throw new Error('Invalid token format');
            }
            
            // Decode the payload (middle part)
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Date.now() / 1000;
            
            if (payload.exp && payload.exp < currentTime) {
              // Token expired, clear it
              console.log('Token expired, logging out');
              clearJwtToken();
              localStorage.removeItem('user');
              setUser(null);
            } else {
              // Token valid, get user data from storage or API
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                setUser(JSON.parse(storedUser) as User);
              } else {
                // If no stored user but valid token, fetch user from API
                const userData = await authAPI.getCurrentUser();
                setUser(userData as User);
                localStorage.setItem('user', JSON.stringify(userData));
              }
            }
          } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      // Use real API endpoint
      const response = await authAPI.login(username, password);
      
      // Type guard for the response
      interface AuthResponse {
        token: string;
        user: User;
      }
      
      const isAuthResponse = (data: any): data is AuthResponse => {
        return data && typeof data === 'object' && 'token' in data && 'user' in data;
      };
      
      if (isAuthResponse(response)) {
        // Store token
        setJwtToken(response.token);
        
        // Get user data
        const userData = response.user;
        setUser(userData);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Login failed: Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearJwtToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  // Helper function to check if a user has a specific permission
  const getUserPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions && user.permissions[permission as keyof User['permissions']] === true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        getUserPermission,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
