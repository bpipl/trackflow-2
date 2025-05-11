import React from 'react';
import { isLocalMode, verifyNoExternalConnections } from '@/lib/envCheck';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

/**
 * Component to display the current environment information in the application
 * This helps users understand they're working in local mode with mock data
 */
export const EnvironmentInfo = () => {
  const isLocal = isLocalMode();
  const connectionInfo = verifyNoExternalConnections();
  
  if (!isLocal) return null;
  
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-700">Local Development Mode</AlertTitle>
      <AlertDescription className="text-blue-600">
        <p>This application is running with mock data only. No external database connections are active.</p>
        <p className="mt-1 text-sm">
          <span className="font-semibold">Authentication:</span> Use <code className="bg-blue-100 px-1 rounded">admin</code> / <code className="bg-blue-100 px-1 rounded">admin123</code> to log in as an administrator
          or <code className="bg-blue-100 px-1 rounded">staff</code> / <code className="bg-blue-100 px-1 rounded">staff123</code> for staff access.
        </p>
        <p className="mt-1 text-sm">
          <span className="font-semibold">Status:</span> {connectionInfo.success ? '✓ All systems operational' : '⚠ Connection issues detected'}
        </p>
      </AlertDescription>
    </Alert>
  );
};
