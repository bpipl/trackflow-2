// Real implementation of Supabase client that connects to our Express API
// This is now a wrapper around fetch APIs to communicate with our backend

import { getJwtToken, setJwtToken, clearJwtToken } from '../../lib/auth/jwt';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthResponse {
  user: {
    id: string;
    username: string;
    role: string;
    permissions: Record<string, boolean>;
  };
  token: string;
}

class ApiClient {
  private getAuthHeaders() {
    const token = getJwtToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async fetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {})
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }
    
    return data;
  }
  
  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const data: AuthResponse = await this.fetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username: email, password })
        });
        
        // Store the JWT token
        if (data.token) {
          setJwtToken(data.token);
        }
        
        return {
          data: { 
            session: { 
              user: {
                id: data.user.id,
                email: data.user.username,
                role: data.user.role,
                permissions: data.user.permissions
              }
            }
          },
          error: null
        };
      } catch (error) {
        console.error('Login error:', error);
        return { data: { session: null }, error };
      }
    },
    
    signOut: async () => {
      try {
        // Clear the JWT token
        clearJwtToken();
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    
    getSession: async () => {
      try {
        const token = getJwtToken();
        
        if (!token) {
          return { data: { session: null }, error: null };
        }
        
        // In a real implementation, you might want to verify the token with the server
        // For now, we'll just assume it's valid if it exists
        
        return {
          data: { 
            session: { 
              user: {
                // This is a placeholder - in a real implementation, 
                // you might decode the JWT to get the user info
                id: 'current-user',
                email: 'user@example.com'
              }
            }
          },
          error: null
        };
      } catch (error) {
        return { data: { session: null }, error };
      }
    },
    
    onAuthStateChange: (callback: Function) => {
      // This is a simplified implementation
      // In a real app, you might want to use events or polling
      const subscription = {
        unsubscribe: () => {}
      };
      
      return {
        data: { subscription }
      };
    }
  };
  
  from = (table: string) => {
    return {
      select: () => {
        const fetcher = async () => {
          try {
            const data = await this.fetch(`/${table}`);
            return { data, error: null };
          } catch (error) {
            return { data: null, error };
          }
        };
        
        return {
          ...this.createChainMethods(table),
          then: (resolve, reject) => fetcher().then(resolve, reject)
        };
      },
      
      insert: (values: any) => {
        const fetcher = async () => {
          try {
            const data = await this.fetch(`/${table}`, {
              method: 'POST',
              body: JSON.stringify(values)
            });
            return { data, error: null };
          } catch (error) {
            return { data: null, error };
          }
        };
        
        return {
          ...this.createChainMethods(table),
          then: (resolve, reject) => fetcher().then(resolve, reject)
        };
      },
      
      update: (values: any) => {
        return {
          eq: (column: string, value: any) => {
            const fetcher = async () => {
              try {
                const data = await this.fetch(`/${table}/${value}`, {
                  method: 'PATCH',
                  body: JSON.stringify(values)
                });
                return { data, error: null };
              } catch (error) {
                return { data: null, error };
              }
            };
            
            return {
              ...this.createChainMethods(table),
              then: (resolve, reject) => fetcher().then(resolve, reject)
            };
          }
        };
      },
      
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            const fetcher = async () => {
              try {
                const data = await this.fetch(`/${table}/${value}`, {
                  method: 'DELETE'
                });
                return { data, error: null };
              } catch (error) {
                return { data: null, error };
              }
            };
            
            return {
              ...this.createChainMethods(table),
              then: (resolve, reject) => fetcher().then(resolve, reject)
            };
          }
        };
      }
    };
  };
  
  private createChainMethods(table: string) {
    return {
      eq: () => this.from(table),
      in: () => this.from(table),
      single: () => this.from(table),
      order: () => this.from(table),
      limit: () => this.from(table)
    };
  }
}

export const supabase = new ApiClient();

// No webhook needed for our implementation
export const N8N_WEBHOOK_URL = "";
