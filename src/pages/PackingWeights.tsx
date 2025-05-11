import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DateRangeSelector } from '@/components/ui/date-range-selector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Printer, 
  Pencil, 
  CheckSquare, 
  Save,
  Loader2
} from 'lucide-react';
import { BoxWeightEntry, CourierSlip } from '@/types/models';
import { endOfDay, formatISO, parseISO, startOfDay } from 'date-fns';
import PackingInstructionReceipt from '@/components/slips/PackingInstructionReceipt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import SteelCargoSlip from '@/components/slips/SteelCargoSlip';
import TrackonSlip from '@/components/slips/TrackonSlip';

const PackingWeights = () => {
  const { user, logout } = useAuth();
  const { slips, updateSlip, addLog } = useData();
  const { toast } = useToast();

  // States for date range selection
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('pending');

  // Selected slip for editing
  const [selectedSlip, setSelectedSlip] = useState<CourierSlip | null>(null);
  const [boxWeights, setBoxWeights] = useState<number[]>([]);
  const [printTypeForSelectedSlip, setPrintTypeForSelectedSlip] = useState<'full' | 'packing'>('full');

  // Filtered slips based on search and date range
  const [filteredSlips, setFilteredSlips] = useState<CourierSlip[]>([]);

  // Update filtered slips when dependencies change
  useEffect(() => {
    filterSlips();
  }, [slips, searchTerm, startDate, endDate, activeTab]);

  const filterSlips = () => {
    setIsLoading(true);
    
    // Filter by date range
    const startDateISO = formatISO(startOfDay(startDate));
    const endDateISO = formatISO(endOfDay(endDate));
    
    let filtered = slips.filter(slip => {
      const slipDate = parseISO(slip.generatedAt);
      return slipDate >= parseISO(startDateISO) && slipDate <= parseISO(endDateISO);
    });
    
    // Filter by tab (pending/completed)
    filtered = filtered.filter(slip => {
      if (activeTab === 'pending') return !slip.isPacked;
      return slip.isPacked;
    });
    
    // Filter by search term (if provided)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(slip => 
        slip.trackingId.toLowerCase().includes(term) || 
        slip.customerName.toLowerCase().includes(term)
      );
    }
    
    setFilteredSlips(filtered);
    setIsLoading(false);
  };

  const handleBoxWeightsChange = (index: number, value: string) => {
    const newWeights = [...boxWeights];
    newWeights[index] = parseFloat(value) || 0;
    setBoxWeights(newWeights);
  };

  const handleSelectSlip = (slip: CourierSlip) => {
    setSelectedSlip(slip);
    
    // Initialize box weights
    const numberOfBoxes = slip.numberOfBoxes || 1;
    const initialWeights = slip.boxWeights || Array(numberOfBoxes).fill(0);
    setBoxWeights(initialWeights);
    
    // Set default print type based on courier preferences or default to full
    const printType = slip.isPacked ? 'full' : 'packing';
    setPrintTypeForSelectedSlip(printType);
  };

  const handleSaveBoxWeights = () => {
    if (!selectedSlip) return;
    
    // Calculate total weight
    const totalWeight = boxWeights.reduce((sum, weight) => sum + weight, 0);
    
    // Update slip with weight information
    const updatedSlip: CourierSlip = {
      ...selectedSlip,
      weight: totalWeight,
      boxWeights: boxWeights,
      isPacked: true,
      packedAt: new Date().toISOString(),
      packedBy: user?.username || 'unknown',
    };
    
    updateSlip(updatedSlip.id, updatedSlip);
    
    // Add log entry
    addLog({
      timestamp: new Date().toISOString(),
      userId: user?.id || 'unknown',
      username: user?.username || 'unknown',
      action: 'BOX_WEIGHTS_UPDATED',
      details: {
        slipId: selectedSlip.id,
        trackingId: selectedSlip.trackingId,
        totalWeight,
        boxWeights,
      },
    });
    
    toast({
      title: "Success",
      description: `Box weights saved for tracking ID: ${selectedSlip.trackingId}`,
    });
    
    // Reset states
    setSelectedSlip(null);
    setBoxWeights([]);
    filterSlips();
  };

  const handlePrintSlip = () => {
    if (!selectedSlip) return;
    
    toast({
      title: "Print Requested",
      description: "Sending to printer...",
    });
    
    // In a real implementation, this would connect to the printer
    window.print();
  };

  // Helper function to get the appropriate slip component
  const getSlipComponent = (slip: CourierSlip) => {
    if (printTypeForSelectedSlip === 'packing') {
      return <PackingInstructionReceipt slip={slip} />;
    }
    
    const courierName = slip.courierName.toLowerCase();
    
    if (courierName.includes('steel')) {
      return <SteelCargoSlip slip={slip} />;
    } else if (courierName.includes('trackon')) {
      return <TrackonSlip slip={slip} />;
    } else {
      // Default slip format for other couriers
      return (
        <div className="space-y-6">
          {/* Barcode */}
          <div className="flex flex-col items-center">
            <svg id="barcode" className="w-64 h-20"></svg>
            <div className="text-lg font-bold mt-2">{slip.trackingId}</div>
          </div>

          {/* Sender Details */}
          <div>
            <h3 className="mb-2 text-lg font-semibold">Sender Details</h3>
            <div className="rounded-md border border-gray-200 p-3">
              <p className="font-medium">{slip.senderName}</p>
              <p>{slip.senderAddress}</p>
            </div>
          </div>

          {/* Receiver Details */}
          <div>
            <h3 className="mb-2 text-lg font-semibold">Receiver Details</h3>
            <div className="rounded-md border border-gray-200 p-3">
              <p className="font-medium">{slip.customerName}</p>
              <p>{slip.customerAddress}</p>
              <p>Phone: {slip.customerMobile}</p>
              {slip.isToPayShipping && (
                <div className="mt-2 bg-yellow-100 p-1 text-sm rounded font-bold text-center">
                  TO PAY
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  // Check if user has permissions
  const canViewBoxWeights = user?.permissions?.viewBoxWeights;
  const canEditBoxWeights = user?.permissions?.editBoxWeights;
  const canEditCompletedBoxWeights = user?.permissions?.editCompletedBoxWeights;
  const canPrintSlips = user?.permissions?.printSlips;

  if (!canViewBoxWeights) {
    return (
      <PageLayout title="Packing & Weights" userRole={user?.role} onLogout={logout}>
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to view this page.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Packing & Weights" userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Packing & Weights</h2>
          
          {/* Date Range Selector */}
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by tracking ID or customer name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              <Package className="mr-2 h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckSquare className="mr-2 h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredSlips.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSlips.map((slip) => (
                  <Card 
                    key={slip.id} 
                    className="cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => canEditBoxWeights && handleSelectSlip(slip)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="flex justify-between items-center">
                        <span className="text-base font-medium truncate">
                          {slip.trackingId}
                        </span>
                        <span className="text-sm font-normal text-gray-500">
                          {new Date(slip.generatedAt).toLocaleDateString()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p><strong>Customer:</strong> {slip.customerName}</p>
                      <p><strong>Courier:</strong> {slip.courierName}</p>
                      <p><strong>Boxes:</strong> {slip.numberOfBoxes || 1}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending slips found.
              </div>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredSlips.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSlips.map((slip) => (
                  <Card 
                    key={slip.id} 
                    className="cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => 
                      (canEditCompletedBoxWeights || canPrintSlips) && 
                      handleSelectSlip(slip)
                    }
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="flex justify-between items-center">
                        <span className="text-base font-medium truncate">
                          {slip.trackingId}
                        </span>
                        <span className="text-sm font-normal text-gray-500">
                          {slip.packedAt ? new Date(slip.packedAt).toLocaleDateString() : '-'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p><strong>Customer:</strong> {slip.customerName}</p>
                      <p><strong>Courier:</strong> {slip.courierName}</p>
                      <p><strong>Weight:</strong> {slip.weight ? `${slip.weight} kg` : 'Not weighed'}</p>
                      <p><strong>Boxes:</strong> {slip.numberOfBoxes || 1}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No completed slips found.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail View - When a slip is selected */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-white z-10 border-b">
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedSlip.isPacked ? 'View Packed Slip' : 'Update Box Weights'}: {selectedSlip.trackingId}
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedSlip(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Slip Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Slip Details</h3>
                  <div className="space-y-2">
                    <p><strong>Customer:</strong> {selectedSlip.customerName}</p>
                    <p><strong>Courier:</strong> {selectedSlip.courierName}</p>
                    <p><strong>Generated By:</strong> {selectedSlip.generatedBy}</p>
                    <p><strong>Generated On:</strong> {new Date(selectedSlip.generatedAt).toLocaleString()}</p>
                    {selectedSlip.packedAt && (
                      <>
                        <p><strong>Packed By:</strong> {selectedSlip.packedBy}</p>
                        <p><strong>Packed On:</strong> {new Date(selectedSlip.packedAt).toLocaleString()}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Box Weights Entry */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Box Weights</h3>
                  
                  {(!selectedSlip.isPacked || canEditCompletedBoxWeights) ? (
                    <div className="space-y-4">
                      {Array.from({ length: selectedSlip.numberOfBoxes || 1 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-24">Box {index + 1}:</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Weight in kg"
                            value={boxWeights[index] || ''}
                            onChange={(e) => handleBoxWeightsChange(index, e.target.value)}
                            className="max-w-[120px]"
                          />
                          <span>kg</span>
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <span className="w-24 font-bold">Total:</span>
                        <span className="font-bold">
                          {boxWeights.reduce((sum, w) => sum + w, 0).toFixed(2)} kg
                        </span>
                      </div>
                      
                      {/* Save Button */}
                      {(canEditBoxWeights && !selectedSlip.isPacked) || 
                       (canEditCompletedBoxWeights && selectedSlip.isPacked) ? (
                        <Button 
                          onClick={handleSaveBoxWeights} 
                          className="mt-4 w-full"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Box Weights
                        </Button>
                       ) : null}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSlip.boxWeights?.map((weight, index) => (
                        <p key={index}>
                          <strong>Box {index + 1}:</strong> {weight} kg
                        </p>
                      )) || (
                        <p>No box weights recorded</p>
                      )}
                      
                      {selectedSlip.weight && (
                        <p className="pt-2 border-t font-bold">
                          Total: {selectedSlip.weight} kg
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Print Options */}
              {canPrintSlips && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Print Options</h3>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <Button
                      variant={printTypeForSelectedSlip === 'full' ? 'default' : 'outline'}
                      onClick={() => setPrintTypeForSelectedSlip('full')}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Full Courier Slip
                    </Button>
                    
                    <Button
                      variant={printTypeForSelectedSlip === 'packing' ? 'default' : 'outline'}
                      onClick={() => setPrintTypeForSelectedSlip('packing')}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Packing Instruction
                    </Button>
                  </div>

                  <div className="border rounded-md p-4 print:border-0 print:p-0">
                    <div className="flex justify-end mb-4 print:hidden">
                      <Button onClick={handlePrintSlip}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                    </div>
                    
                    <div className="print:m-0">
                      {getSlipComponent(selectedSlip)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default PackingWeights;
