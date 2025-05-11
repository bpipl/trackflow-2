import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash, FileText } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { CourierPartner } from '@/types/models';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import ShreeCourierSlip from '@/components/slips/ShreeCourierSlip';
import TrackonSlip from '@/components/slips/TrackonSlip';
import GlobalPrimexSlip from '@/components/slips/GlobalPrimexSlip';
import SteelCargoSlip from '@/components/slips/SteelCargoSlip';

interface CourierListProps {
  couriers: CourierPartner[];
  searchTerm: string;
  onEditCourier: (courier: CourierPartner) => void;
  onDeleteCourier: (id: string) => void;
}

// Sample slip data for preview
const sampleSlip = {
  id: 'sample',
  trackingId: 'SAMPLE123',
  customerId: '1',
  customerName: 'Sample Customer',
  customerAddress: '123 Sample Street, Sample City, State, 123456',
  customerMobile: '9876543210',
  courierId: '1',
  courierName: 'Sample Courier',
  senderAddressId: '1',
  senderName: 'Your Company',
  senderAddress: '456 Company Address, City, State, ZIP, Phone: 1234567890',
  method: 'air' as 'air' | 'surface', // Type assertion for TypeScript
  weight: 1.5,
  numberOfBoxes: 2,
  generatedBy: 'admin',
  generatedAt: new Date().toISOString(),
  charges: 150,
  emailSent: false,
  isCancelled: false,
  isToPayShipping: false,
  isPacked: false
};

const CourierList: React.FC<CourierListProps> = ({
  couriers,
  searchTerm,
  onEditCourier,
  onDeleteCourier
}) => {
  const { isExpressModeActive } = useData();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<CourierPartner | null>(null);

  // Handle preview click
  const handlePreviewClick = (courier: CourierPartner) => {
    setSelectedCourier(courier);
    setPreviewOpen(true);
  };

  // Render the appropriate slip template based on courier name
  const renderSlipTemplate = () => {
    if (!selectedCourier) return null;

    // Create a slip with the courier name for preview
    const previewSlip = {
      ...sampleSlip,
      courierName: selectedCourier.name,
      courierId: selectedCourier.id
    };

    // Render the appropriate template based on courier name
    if (selectedCourier.name.includes('Shree')) {
      return <ShreeCourierSlip slip={previewSlip} />;
    } else if (selectedCourier.name.includes('Trackon')) {
      return <TrackonSlip slip={previewSlip} />;
    } else if (selectedCourier.name.includes('Global')) {
      return <GlobalPrimexSlip slip={previewSlip} />;
    } else if (selectedCourier.name.includes('Steel')) {
      return <SteelCargoSlip slip={previewSlip} />;
    }

    // Default to showing no template available
    return <div className="p-6 text-center">No template available for this courier</div>;
  };

  // Filter out the express master toggle courier from the normal list
  const visibleCouriers = couriers.filter(courier => {
    // When searching, show all couriers including Express Courier
    if (searchTerm) {
      return courier.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             courier.prefix.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Otherwise, show Express Courier only if the search is for it specifically
    return !courier.isExpressMasterToggle || searchTerm.toLowerCase() === 'express';
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Prefix</TableHead>
            <TableHead className="hidden md:table-cell">Current Tracking #</TableHead>
            <TableHead className="hidden md:table-cell">Air Charge (₹)</TableHead>
            <TableHead className="hidden md:table-cell">Surface Charge (₹)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleCouriers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No couriers found.
              </TableCell>
            </TableRow>
          ) : (
            visibleCouriers.map((courier) => (
              <TableRow key={courier.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {courier.name}
                  </div>
                </TableCell>
                <TableCell>{courier.prefix}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {courier.currentTrackingNumber}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {courier.charges.air}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {courier.charges.surface}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewClick(courier)}
                    >
                      <FileText className="h-3 w-3" />
                      <span className="sr-only md:not-sr-only md:ml-2 text-xs">
                        Preview
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditCourier(courier)}
                    >
                      <Edit className="h-3 w-3" />
                      <span className="sr-only md:not-sr-only md:ml-2 text-xs">
                        Edit
                      </span>
                    </Button>
                    {!courier.isExpressMasterToggle ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteCourier(courier.id)}
                      >
                        <Trash className="h-3 w-3" />
                        <span className="sr-only md:not-sr-only md:ml-2 text-xs">
                          Delete
                        </span>
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Trash className="h-3 w-3" />
                        <span className="sr-only md:not-sr-only md:ml-2 text-xs">
                          Delete
                        </span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedCourier?.name} Slip Preview
            </DialogTitle>
            <DialogDescription>
              A preview of how the courier slip will look when printed.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border border-gray-200 rounded">
            <div className="overflow-auto" style={{maxHeight: '70vh'}}>
              {renderSlipTemplate()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourierList;
