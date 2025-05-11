// JWT token handling utility functions

// Token storage key in localStorage
const TOKEN_KEY = 'track_flow_jwt_token';

/**
 * Get the JWT token from localStorage
 * @returns The JWT token or null if not found
 */
export const getJwtToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store the JWT token in localStorage
 * @param token The JWT token to store
 */
export const setJwtToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clear the JWT token from localStorage
 */
export const clearJwtToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if a JWT token exists
 * @returns True if a token exists, false otherwise
 */
export const hasJwtToken = (): boolean => {
  return !!getJwtToken();
};
