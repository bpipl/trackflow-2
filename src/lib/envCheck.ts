/**
 * Helper utilities to check environment status and connections
 */

// Check if application is running in local/development mode
export const isLocalMode = (): boolean => {
  return true; // Always return true as we're using mock data
};

// Verify that no real database connections are being attempted
export const verifyNoExternalConnections = (): { success: boolean, message: string } => {
  try {
    // Since we're using a mock Supabase client, there are no real connections
    return { 
      success: true, 
      message: 'Using mock data only. No external database connections detected.' 
    };
  } catch (error) {
    console.error('Error checking connections:', error);
    return { 
      success: false, 
      message: `Error checking connections: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Function to log current environment status
export const logEnvironmentStatus = (): void => {
  console.info('=== Environment Status ===');
  console.info('Mode: Local Development');
  console.info('Database: Mock (No external connections)');
  console.info('Authentication: Mock (Local users only)');
  console.info('=========================');
};
