
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CourierForm from './CourierForm';
import { CourierPartner } from '@/types/models';

interface ExpressConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courier: CourierPartner | null;
  couriers: CourierPartner[];
  onSubmit: (data: {
    expressPrefix?: string;
    expressStartingTrackingNumber?: number;
    expressCurrentTrackingNumber?: number;
    expressEndTrackingNumber?: number;
    expressCharges?: { air: number; surface: number };
  }) => void;
}

const ExpressConfigDialog: React.FC<ExpressConfigDialogProps> = ({
  isOpen,
  onOpenChange,
  courier,
  couriers,
  onSubmit
}) => {
  if (!courier) return null;

  // Handler to ensure we're only submitting express-related fields
  const handleSubmit = (data: any) => {
    // Extract only the express-related fields to avoid affecting standard mode
    const expressOnlyData = {
      expressPrefix: data.expressPrefix,
      expressStartingTrackingNumber: data.expressStartingTrackingNumber,
      expressCurrentTrackingNumber: data.expressCurrentTrackingNumber,
      expressEndTrackingNumber: data.expressEndTrackingNumber,
      expressCharges: data.expressCharges
    };
    
    onSubmit(expressOnlyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Express Mode Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <CourierForm
            onSubmit={handleSubmit}
            initialData={{
              name: courier.name,
              prefix: courier.prefix,
              startingTrackingNumber: courier.startingTrackingNumber,
              currentTrackingNumber: courier.currentTrackingNumber,
              endTrackingNumber: courier.endTrackingNumber,
              charges: {
                air: courier.charges.air,
                surface: courier.charges.surface,
              },
              expressPrefix: courier.expressPrefix || `EX-${courier.prefix}`,
              expressStartingTrackingNumber: courier.expressStartingTrackingNumber || 1000,
              expressCurrentTrackingNumber: courier.expressCurrentTrackingNumber || 1000,
              expressEndTrackingNumber: courier.expressEndTrackingNumber || 9999,
              expressCharges: courier.expressCharges || {
                air: courier.charges.air,
                surface: courier.charges.surface,
              }
            }}
            title={`Express Configuration for ${courier.name}`}
            isExpressConfigMode={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpressConfigDialog;
