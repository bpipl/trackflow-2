
// Mock implementations for local testing without Supabase

// This function just logs a message - no actual DB connection
export async function ensureDefaultCouriersExist() {
  console.log('Using mock couriers from DataContext instead of Supabase');
  return Promise.resolve();
}

// Mock user permissions sync - always returns success
export async function syncUserPermissions(userId, permissions) {
  console.log('Mock: Syncing permissions for user', userId);
  return Promise.resolve(true);
}

// Mock set user role - always returns success
export async function setUserRole(userId, role) {
  console.log('Mock: Setting role', role, 'for user', userId);
  return Promise.resolve(true);
}
