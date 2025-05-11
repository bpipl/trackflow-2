// Auth module index file
// Re-exports JWT functions with appropriate names for backward compatibility

import {
  getJwtToken,
  setJwtToken,
  clearJwtToken,
  hasJwtToken
} from './jwt';

// Export JWT functions directly
export {
  getJwtToken,
  setJwtToken,
  clearJwtToken,
  hasJwtToken
};

// Alias functions for backward compatibility
export const generateToken = setJwtToken;
export const verifyToken = (token: string): boolean => {
  // This is a simple implementation
  // In a real application, you would validate the token structure and expiration
  return !!token && typeof token === 'string' && token.length > 0;
};

// Default export for convenient imports
export default {
  getJwtToken,
  setJwtToken,
  clearJwtToken,
  hasJwtToken,
  generateToken,
  verifyToken
};
