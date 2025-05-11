import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { CourierPartner } from '@/types/models';

// Import our new components
import CourierForm from '@/components/couriers/CourierForm';
import CourierList from '@/components/couriers/CourierList';
import ExpressConfigDialog from '@/components/couriers/ExpressConfigDialog';

const Couriers = () => {
  const { user, logout } = useAuth();
  const { couriers, addCourier, updateCourier, deleteCourier, isExpressModeActive } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCourier, setEditingCourier] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExpressConfigDialogOpen, setIsExpressConfigDialogOpen] = useState(false);
  const [expressConfigCourier, setExpressConfigCourier] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddCourier = (data: {
    name: string;
    prefix: string;
    startingTrackingNumber: number;
    currentTrackingNumber: number;
    endTrackingNumber: number;
    charges: { air: number; surface: number };
    expressPrefix?: string;
    expressStartingTrackingNumber?: number;
    expressCurrentTrackingNumber?: number;
    expressEndTrackingNumber?: number;
    expressCharges?: { air: number; surface: number };
    isExpressMasterToggle?: boolean;
  }) => {
    addCourier(data);
    setIsAddDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Courier added successfully.',
    });
  };

  const handleEditCourier = (data: {
    name: string;
    prefix: string;
    startingTrackingNumber: number;
    currentTrackingNumber: number;
    endTrackingNumber: number;
    charges: { air: number; surface: number };
    expressPrefix?: string;
    expressStartingTrackingNumber?: number;
    expressCurrentTrackingNumber?: number;
    expressEndTrackingNumber?: number;
    expressCharges?: { air: number; surface: number };
    isExpressMasterToggle?: boolean;
  }) => {
    if (editingCourier) {
      updateCourier(editingCourier, data);
      setEditingCourier(null);
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Courier updated successfully.',
      });
    }
  };
  
  const handleExpressConfig = (data: {
    expressPrefix?: string;
    expressStartingTrackingNumber?: number;
    expressCurrentTrackingNumber?: number;
    expressEndTrackingNumber?: number;
    expressCharges?: { air: number; surface: number };
  }) => {
    if (expressConfigCourier) {
      // Only update express-related fields
      updateCourier(expressConfigCourier, {
        expressPrefix: data.expressPrefix,
        expressStartingTrackingNumber: data.expressStartingTrackingNumber,
        expressCurrentTrackingNumber: data.expressCurrentTrackingNumber,
        expressEndTrackingNumber: data.expressEndTrackingNumber,
        expressCharges: data.expressCharges
      });
      
      setExpressConfigCourier(null);
      setIsExpressConfigDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Express configuration updated successfully.',
      });
    }
  };

  const handleDeleteCourier = (id: string) => {
    // Find the courier
    const courier = couriers.find(c => c.id === id);
    
    // Don't allow deleting Express Courier
    if (courier?.isExpressMasterToggle) {
      toast({
        title: 'Error',
        description: 'The Express Courier cannot be deleted as it is a system courier.',
        variant: 'destructive',
      });
      return;
    }
    
    if (confirm('Are you sure you want to delete this courier?')) {
      deleteCourier(id);
      toast({
        title: 'Success',
        description: 'Courier deleted successfully.',
      });
    }
  };

  const openEditDialog = (courier: CourierPartner) => {
    setEditingCourier(courier.id);
    setIsEditDialogOpen(true);
  };
  
  const openExpressConfigDialog = (courierId: string) => {
    setExpressConfigCourier(courierId);
    setIsExpressConfigDialogOpen(true);
  };

  const selectedCourier = expressConfigCourier 
    ? couriers.find(c => c.id === expressConfigCourier) || null
    : null;

  const editCourier = editingCourier
    ? couriers.find(c => c.id === editingCourier) || null
    : null;

  return (
    <PageLayout title="Courier Partner Management" userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Courier Partners</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search couriers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-courier-600 hover:bg-courier-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Courier
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <CourierForm onSubmit={handleAddCourier} title="Add New Courier Partner" />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <CourierList 
                couriers={couriers}
                searchTerm={searchTerm}
                onEditCourier={openEditDialog}
                onDeleteCourier={handleDeleteCourier}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Courier Dialog */}
      {editCourier && (
        <Dialog 
          open={isEditDialogOpen && editingCourier === editCourier.id} 
          onOpenChange={setIsEditDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <CourierForm
              onSubmit={handleEditCourier}
              initialData={{
                name: editCourier.name,
                prefix: editCourier.prefix,
                startingTrackingNumber: editCourier.startingTrackingNumber,
                currentTrackingNumber: editCourier.currentTrackingNumber,
                endTrackingNumber: editCourier.endTrackingNumber,
                charges: {
                  air: editCourier.charges.air,
                  surface: editCourier.charges.surface,
                },
                expressPrefix: editCourier.expressPrefix,
                expressStartingTrackingNumber: editCourier.expressStartingTrackingNumber,
                expressCurrentTrackingNumber: editCourier.expressCurrentTrackingNumber,
                expressEndTrackingNumber: editCourier.expressEndTrackingNumber,
                expressCharges: editCourier.expressCharges,
                isExpressMasterToggle: editCourier.isExpressMasterToggle,
              }}
              title="Edit Courier Partner"
              isExpressCourier={editCourier.isExpressMasterToggle}
            />
            
            {/* Add Express Config Button inside Edit Dialog */}
            {isExpressModeActive && !editCourier.isExpressMasterToggle && (
              <div className="pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    openExpressConfigDialog(editCourier.id);
                  }}
                  className="w-full"
                >
                  Configure Express Mode
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      
      {/* Express Config Dialog */}
      <ExpressConfigDialog
        isOpen={isExpressConfigDialogOpen}
        onOpenChange={setIsExpressConfigDialogOpen}
        courier={selectedCourier}
        couriers={couriers}
        onSubmit={handleExpressConfig}
      />
    </PageLayout>
  );
};

export default Couriers;
