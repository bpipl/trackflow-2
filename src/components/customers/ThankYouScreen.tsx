
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ThankYouScreen = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4 py-6 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto rounded-full w-12 h-12 bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Thanks for signing up!</h1>
          
          <p className="text-gray-600 mb-6">
            You'll hear from us on WhatsApp soon. Your information has been submitted successfully.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
