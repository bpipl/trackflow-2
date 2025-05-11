
// This file provides a mock Supabase client for local testing
// Mock Supabase client with noop methods
class MockSupabaseClient {
  auth = {
    signInWithPassword: async () => ({
      data: { session: { user: { id: '1', email: 'admin@example.com' } } },
      error: null
    }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ 
      data: { 
        subscription: { 
          unsubscribe: () => {} 
        } 
      } 
    })
  };

  from = (table: string) => {
    return {
      select: () => this,
      insert: () => this,
      update: () => this,
      delete: () => this,
      eq: () => this,
      in: () => this,
      single: () => this,
      order: () => this,
      limit: () => this,
      then: () => Promise.resolve({ data: [], error: null })
    };
  };
}

export const supabase = new MockSupabaseClient();

// Mock webhook URL (not used in local mode)
export const N8N_WEBHOOK_URL = "";
