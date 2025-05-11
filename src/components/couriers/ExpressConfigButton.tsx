
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface ExpressConfigButtonProps {
  courier: any;
  onConfigClick: () => void;
}

const ExpressConfigButton: React.FC<ExpressConfigButtonProps> = ({ courier, onConfigClick }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-2"
      onClick={(e) => {
        e.stopPropagation();
        onConfigClick();
      }}
    >
      <Settings className="h-3 w-3 mr-1" />
      <span className="text-xs">Express Config</span>
    </Button>
  );
};

export default ExpressConfigButton;
