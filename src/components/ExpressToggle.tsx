
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';

interface ExpressToggleProps {
  isExpressModeEnabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const ExpressToggle: React.FC<ExpressToggleProps> = ({ isExpressModeEnabled, onChange }) => {
  const { isExpressModeActive } = useData();

  if (!isExpressModeActive) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="express-mode"
        checked={isExpressModeEnabled}
        onCheckedChange={onChange}
      />
      <Label htmlFor="express-mode">Express Mode</Label>
    </div>
  );
};
