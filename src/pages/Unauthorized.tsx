
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          Sorry, you don't have permission to access this page.
        </p>
        <p className="mb-6 text-gray-600">
          Your current role: <span className="font-semibold">{user?.role}</span>
        </p>
        <Button asChild>
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
