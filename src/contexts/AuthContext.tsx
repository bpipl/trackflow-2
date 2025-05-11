
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/models';
import { defaultPermissions } from '@/components/users/PermissionGroups';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getUserPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  getUserPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

// Mock user with admin permissions for local testing
const mockAdminUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin' as UserRole,
  permissions: {
    // Set all permissions to true for admin
    ...Object.keys(defaultPermissions).reduce((acc, key) => {
      acc[key as keyof typeof defaultPermissions] = true;
      return acc;
    }, {} as Record<string, boolean>)
  }
};

// Mock user with staff permissions
const mockStaffUser: User = {
  id: '2',
  username: 'staff',
  email: 'staff@example.com',
  role: 'staff' as UserRole,
  permissions: {
    ...defaultPermissions,
    viewCustomerDatabase: true,
    editCustomerDatabase: true,
    generateSlips: true,
    printSlips: true,
    reprintSlips: true,
    viewBoxWeights: true,
    editBoxWeights: true,
    viewCouriers: true,
    viewSenders: true
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get stored user from localStorage if available
  const storedUser = localStorage.getItem('mockUser');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  
  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('mockUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('mockUser');
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      // For local testing, we'll accept any credentials
      // In a real app, we would validate credentials
      
      // If username contains "admin", log in as admin, otherwise as staff
      const mockUser = username.toLowerCase().includes('admin') ? mockAdminUser : mockStaffUser;
      
      // Set the user state
      setUser(mockUser);
      
      // No need to throw error for mock login
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid username or password');
    }
  };

  const logout = async () => {
    setUser(null);
  };
  
  // Helper function to check if a user has a specific permission
  const getUserPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions[permission as keyof User['permissions']] === true;
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        getUserPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
