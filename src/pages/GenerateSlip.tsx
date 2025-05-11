import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Customer, CourierPartner, CourierSlip, SenderAddress } from '@/types/models';
import { Separator } from '@/components/ui/separator';
import { Package, Printer, AlertTriangle, ClipboardList } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import SteelCargoSlip from '@/components/slips/SteelCargoSlip';
import TrackonSlip from '@/components/slips/TrackonSlip';
import GlobalPrimexSlip from '@/components/slips/GlobalPrimexSlip';
import ShreeCourierSlip from '@/components/slips/ShreeCourierSlip';
import PackingInstructionReceipt from '@/components/slips/PackingInstructionReceipt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExpressToggle } from '@/components/ExpressToggle';
import { 
  generateSteelCargoSlipPDF, 
  generateTrackonSlipPDF, 
  generateGlobalPrimexSlipPDF 
} from '@/lib/pdfGenerator';

// Helper function to format address object to string
const formatAddressToString = (address: Customer['address']): string => {
  return [
    address.addressLine1,
    address.addressLine2,
    address.landmark ? `Near ${address.landmark}` : '',
    `${address.city}, ${address.district ? address.district + ', ' : ''}${address.state}`,
    address.pincode
  ].filter(Boolean).join(', ');
};

// Helper to format mobile numbers
const formatMobileNumbers = (mobile1: string, mobile2?: string): string => {
  if (mobile2) {
    return `${mobile1}/${mobile2}`;
  }
  return mobile1;
};

const GenerateSlip = () => {
  const { user, logout } = useAuth();
  const { customers, couriers, senderAddresses, addSlip, incrementTrackingNumber, addLog, isExpressModeActive } = useData();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [selectedSenderAddressId, setSelectedSenderAddressId] = useState('1'); // Default to first sender
  const [shipmentMethod, setShipmentMethod] = useState<'air' | 'surface'>('air');
  const [weight, setWeight] = useState('');
  const [numberOfBoxes, setNumberOfBoxes] = useState('1');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<CourierPartner | null>(null);
  const [selectedSenderAddress, setSelectedSenderAddress] = useState<SenderAddress | null>(null);
  const [generatedSlip, setGeneratedSlip] = useState<CourierSlip | null>(null);
  const [isToPayShipping, setIsToPayShipping] = useState(false);
  const [trackingIdWarning, setTrackingIdWarning] = useState<{isLow: boolean, remaining: number} | null>(null);
  const [manualTrackingId, setManualTrackingId] = useState('');
  const [printType, setPrintType] = useState<'full' | 'packing'>('full');
  const [isExpressModeEnabled, setIsExpressModeEnabled] = useState(false);

  // Check if the selected courier is Steel Courier & Cargo
  const isSteelCourier = selectedCourier?.name.toLowerCase().includes('steel');
  const isCustomCourier = selectedCourier?.isCustomCourier;

  // Filter customers as user types
  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = customers.filter(
        (customer) => {
          const addressStr = formatAddressToString(customer.address);
          return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 addressStr.toLowerCase().includes(searchTerm.toLowerCase());
        }
      );
      setFilteredCustomers(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setFilteredCustomers([]);
    }
  }, [searchTerm, customers]);

  // Update selected customer when customer ID changes
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      setSelectedCustomer(customer || null);
      
      // Auto-select preferred courier if exists
      if (customer?.preferredCourier) {
        setSelectedCourierId(customer.preferredCourier);
      }
      
      // Set default TO PAY status if available
      if (customer?.defaultToPayShipping !== undefined) {
        setIsToPayShipping(customer.defaultToPayShipping);
      } else {
        setIsToPayShipping(false);
      }
      
      // Set preferred shipment method if available
      if (customer?.preferredShipmentMethod) {
        setShipmentMethod(customer.preferredShipmentMethod);
      }
      
      // Set preferred print type if available
      if (customer?.preferredPrintType) {
        setPrintType(customer.preferredPrintType);
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);

  // Update selected courier when courier ID changes
  useEffect(() => {
    if (selectedCourierId) {
      const courier = couriers.find((c) => c.id === selectedCourierId);
      setSelectedCourier(courier || null);
      
      // Reset manual tracking ID when changing couriers
      setManualTrackingId('');
      setTrackingIdWarning(null);
      
      // Set default shipment method and print type based on courier preference
      if (courier) {
        if (courier.defaultShipmentMethod) {
          setShipmentMethod(courier.defaultShipmentMethod);
        }
        
        if (courier.defaultPrintType) {
          setPrintType(courier.defaultPrintType);
        }
      }
    } else {
      setSelectedCourier(null);
    }
  }, [selectedCourierId, couriers]);

  // Update selected sender address when sender address ID changes
  useEffect(() => {
    if (selectedSenderAddressId) {
      const senderAddress = senderAddresses.find((s) => s.id === selectedSenderAddressId);
      setSelectedSenderAddress(senderAddress || null);
    } else {
      setSelectedSenderAddress(null);
    }
  }, [selectedSenderAddressId, senderAddresses]);

  // Reset Express Mode state when global Express Mode changes
  useEffect(() => {
    if (!isExpressModeActive) {
      setIsExpressModeEnabled(false);
    }
  }, [isExpressModeActive]);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSearchTerm('');
    setFilteredCustomers([]);
  };

  // Determine which slip component to use based on courier name
  const getSlipComponent = (slip: CourierSlip) => {
    if (printType === 'packing') {
      return <PackingInstructionReceipt slip={slip} />;
    }
    
    const courierName = slip.courierName.toLowerCase();
    
    if (courierName.includes('steel')) {
      return <SteelCargoSlip slip={slip} />;
    } else if (courierName.includes('trackon')) {
      return <TrackonSlip slip={slip} />;
    } else if (courierName.includes('global') || courierName.includes('primex')) {
      return <GlobalPrimexSlip slip={slip} />;
    } else if (courierName.includes('shree')) {
      return <ShreeCourierSlip slip={slip} />;
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

  const handleGenerateSlip = () => {
    if (!selectedCustomer || !selectedCourier || !selectedSenderAddress) {
      toast({
        title: 'Error',
        description: 'Please select customer, courier and sender address.',
        variant: 'destructive',
      });
      return;
    }

    // Allow empty weight and box count, but if provided, validate them
    let weightValue = 0;
    if (weight) {
      weightValue = parseFloat(weight);
      if (isNaN(weightValue) || weightValue <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid weight.',
          variant: 'destructive',
        });
        return;
      }
    }

    let boxesValue = 1;
    if (numberOfBoxes) {
      boxesValue = parseInt(numberOfBoxes);
      if (isNaN(boxesValue) || boxesValue <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid number of boxes.',
          variant: 'destructive',
        });
        return;
      }
    }

    let trackingId: string;
    
    // Handle custom courier with manual tracking ID
    if (isCustomCourier) {
      if (!manualTrackingId.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter a tracking ID for the custom courier.',
          variant: 'destructive',
        });
        return;
      }
      trackingId = manualTrackingId.trim();
    } else {
      // Increment the tracking number and get the new value with warnings
      const trackingInfo = incrementTrackingNumber(selectedCourier.id, isExpressModeEnabled);
      
      if (isExpressModeEnabled && selectedCourier.expressPrefix !== undefined) {
        // Use express prefix if available
        trackingId = selectedCourier.expressPrefix 
          ? `${selectedCourier.expressPrefix}${trackingInfo.newNumber}` 
          : `EX-${trackingInfo.newNumber}`;
      } else {
        // Use standard prefix
        trackingId = selectedCourier.prefix 
          ? `${selectedCourier.prefix}${trackingInfo.newNumber}` 
          : `${trackingInfo.newNumber}`;
      }
      
      // Set tracking ID warning if we're running low
      if (trackingInfo.isLow) {
        setTrackingIdWarning({
          isLow: true,
          remaining: trackingInfo.remainingCount
        });
      }
    }
    
    // No longer calculating charges as per requirements
    const charges = 0;
    
    // Generate timestamp
    const generatedAt = new Date().toISOString();
    
      // Format customer address
      const formattedCustomerAddress = formatAddressToString(selectedCustomer.address);
      
      // Format sender address
      const formattedSenderAddress = formatAddressToString(selectedSenderAddress.address);
      
      // Format mobile numbers
      const formattedMobile = formatMobileNumbers(
        selectedCustomer.mobile, 
        selectedCustomer.mobile2
      );
      
      // Create slip object
      const slip: Omit<CourierSlip, 'id'> = {
        trackingId,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerAddress: formattedCustomerAddress,
        customerMobile: formattedMobile,
        courierId: selectedCourier.id,
        courierName: selectedCourier.name,
        senderAddressId: selectedSenderAddress.id,
        senderName: selectedSenderAddress.name,
        senderAddress: formattedSenderAddress,
      method: shipmentMethod,
      weight: weightValue || undefined,
      numberOfBoxes: boxesValue || undefined,
      generatedBy: user?.username || 'unknown',
      generatedAt,
      charges,
      emailSent: false,
      isCancelled: false,
      isToPayShipping,
      isPacked: false,
      isExpressMode: isExpressModeEnabled,
    };
    
    // Add slip to data store
    addSlip(slip);
    
    // Add to audit log
    addLog({
      timestamp: generatedAt,
      userId: user?.id || 'unknown',
      username: user?.username || 'unknown',
      action: 'SLIP_GENERATED',
      details: {
        trackingId,
        customerName: selectedCustomer.name,
        courierName: selectedCourier.name,
        method: shipmentMethod,
        weight: weightValue || 'Not specified',
        numberOfBoxes: boxesValue || 'Not specified',
        isToPayShipping,
        isExpressMode: isExpressModeEnabled,
      },
    });
    
    // Store generated slip for display
    setGeneratedSlip({
      id: Date.now().toString(),
      ...slip,
    });
    
    toast({
      title: 'Success',
      description: `${isExpressModeEnabled ? 'Express' : 'Standard'} slip generated with tracking ID: ${trackingId}`,
    });
  };

  const handlePrintSlip = () => {
    if (!generatedSlip) return;
    
    toast({
      title: 'PDF Generation',
      description: 'Generating PDF for printing...',
    });
    
    // Use the appropriate PDF generator based on courier type
    const courierName = generatedSlip.courierName.toLowerCase();
    
    if (courierName.includes('steel')) {
      generateSteelCargoSlipPDF(generatedSlip);
    } else if (courierName.includes('trackon')) {
      generateTrackonSlipPDF(generatedSlip);
    } else if (courierName.includes('global') || courierName.includes('primex')) {
      generateGlobalPrimexSlipPDF(generatedSlip);
    } else {
      // For other couriers, use Steel Cargo format as the base template
      generateSteelCargoSlipPDF({...generatedSlip, courierName: "Steel Courier & Cargo"});
    }
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setSelectedCourierId('');
    setShipmentMethod('air');
    setWeight('');
    setNumberOfBoxes('1');
    setIsToPayShipping(false);
    setGeneratedSlip(null);
    setManualTrackingId('');
    setTrackingIdWarning(null);
    setPrintType('full');
    setIsExpressModeEnabled(false);
  };

  return (
    <PageLayout title="Generate Courier Slip" userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {!generatedSlip ? (
          <>
            <h2 className="text-2xl font-bold tracking-tight">Generate New Courier Slip</h2>
            
            {trackingIdWarning && trackingIdWarning.isLow && (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Running Low on Tracking Numbers</AlertTitle>
                <AlertDescription>
                  Only {trackingIdWarning.remaining} tracking numbers left for {selectedCourier?.name}.
                  Please contact your courier provider for a new number range.
                </AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Courier Slip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label htmlFor="customerSearch">Customer*</Label>
                  <div className="relative">
                    <Input
                      id="customerSearch"
                      placeholder="Search for a customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={filteredCustomers.length > 0 ? "rounded-b-none" : ""}
                    />
                    {filteredCustomers.length > 0 && (
                      <ul className="absolute z-10 w-full rounded-b-md border border-t-0 border-gray-300 bg-white shadow-lg">
                        {filteredCustomers.map((customer) => (
                          <li
                            key={customer.id}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                            onClick={() => handleCustomerSelect(customer.id)}
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">{formatAddressToString(customer.address)}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {selectedCustomer && (
                    <div className="mt-2 rounded-md bg-gray-50 p-3">
                      <div className="font-medium">{selectedCustomer.name}</div>
                      <div className="text-sm">{formatAddressToString(selectedCustomer.address)}</div>
                      <div className="text-sm">
                        {selectedCustomer.mobile}
                        {selectedCustomer.mobile2 && ` / ${selectedCustomer.mobile2}`}
                      </div>
                      {selectedCustomer.notes && (
                        <div className="mt-2 text-sm italic border-t border-gray-200 pt-1">
                          Notes: {selectedCustomer.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Courier Selection */}
                <div className="space-y-2">
                  <Label htmlFor="courierSelect">Courier Partner*</Label>
                  <Select value={selectedCourierId} onValueChange={setSelectedCourierId}>
                    <SelectTrigger id="courierSelect">
                      <SelectValue placeholder="Select a courier partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {couriers.filter(c => !c.isExpressMasterToggle).map((courier) => (
                        <SelectItem key={courier.id} value={courier.id}>
                          {courier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manual Tracking ID for Custom Courier */}
                {isCustomCourier && (
                  <div className="space-y-2">
                    <Label htmlFor="manualTrackingId">Tracking ID*</Label>
                    <Input
                      id="manualTrackingId"
                      placeholder="Enter tracking ID provided by the courier"
                      value={manualTrackingId}
                      onChange={(e) => setManualTrackingId(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Enter the tracking ID provided by the custom courier service.
                    </p>
                  </div>
                )}

                {/* Sender Address Selection */}
                <div className="space-y-2">
                  <Label htmlFor="senderSelect">Sender Address*</Label>
                  <Select value={selectedSenderAddressId} onValueChange={setSelectedSenderAddressId}>
                    <SelectTrigger id="senderSelect">
                      <SelectValue placeholder="Select sender address" />
                    </SelectTrigger>
                    <SelectContent>
                      {senderAddresses.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          {address.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSenderAddress && (
                    <div className="mt-2 rounded-md bg-gray-50 p-3">
                      <div className="font-medium">{selectedSenderAddress.name}</div>
                      <div className="text-sm">{formatAddressToString(selectedSenderAddress.address)}</div>
                      <div className="text-sm">{selectedSenderAddress.phone}</div>
                    </div>
                  )}
                </div>

                {/* Express Mode Toggle */}
                {isExpressModeActive && (
                  <ExpressToggle 
                    isExpressModeEnabled={isExpressModeEnabled}
                    onChange={setIsExpressModeEnabled}
                  />
                )}

                {/* Shipment Method */}
                <div className="space-y-2">
                  <Label>Shipment Method*</Label>
                  <RadioGroup
                    value={shipmentMethod}
                    onValueChange={(value) => setShipmentMethod(value as 'air' | 'surface')}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="air" id="air" />
                      <Label htmlFor="air">Air</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="surface" id="surface" />
                      <Label htmlFor="surface">Surface</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* TO PAY Option */}
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="toPayShipping" 
                    checked={isToPayShipping} 
                    onCheckedChange={setIsToPayShipping} 
                  />
                  <Label htmlFor="toPayShipping">TO PAY Shipping</Label>
                </div>
                {isToPayShipping && (
                  <div className="rounded-md bg-yellow-50 p-3 text-sm">
                    <strong>Note:</strong> When TO PAY is selected, courier charges will be collected from the recipient.
                  </div>
                )}

                {/* Weight - No longer mandatory */}
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter weight in kg (optional)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                {/* Number of Boxes - No longer mandatory */}
                <div className="space-y-2">
                  <Label htmlFor="boxes">Number of Boxes/Pieces</Label>
                  <Input
                    id="boxes"
                    type="number"
                    min="1"
                    placeholder="Enter number of boxes (optional)"
                    value={numberOfBoxes}
                    onChange={(e) => setNumberOfBoxes(e.target.value)}
                  />
                </div>
                
                {/* Print Type Selection */}
                <div className="space-y-2">
                  <Label>Print Type</Label>
                  <RadioGroup
                    value={printType}
                    onValueChange={(value) => setPrintType(value as 'full' | 'packing')}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="flex items-center">
                        <Printer className="mr-2 h-4 w-4" />
                        Full Courier Slip
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="packing" id="packing" />
                      <Label htmlFor="packing" className="flex items-center">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Packing Instruction (Thermal Receipt)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-courier-600 hover:bg-courier-700"
                  onClick={handleGenerateSlip}
                  disabled={!selectedCustomer || !selectedCourier || !selectedSenderAddressId || (isCustomCourier && !manualTrackingId)}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Generate {isExpressModeEnabled ? "Express" : ""} Slip
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                {isExpressModeEnabled ? (
                  <span className="flex items-center">
                    Express Courier Slip Generated
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      Express Mode
                    </span>
                  </span>
                ) : (
                  "Courier Slip Generated"
                )}
              </h2>
              <Button variant="outline" onClick={resetForm}>
                Create New Slip
              </Button>
            </div>
            
            <Card className={`border-2 ${isExpressModeEnabled ? 'border-blue-500 print:border-0' : 'border-courier-500 print:border-0'}`}>
              <CardHeader className={`border-b ${isExpressModeEnabled ? 'bg-blue-50 print:bg-white' : 'bg-courier-50 print:bg-white'}`}>
                <div className="flex justify-between">
                  <CardTitle>
                    {printType === 'full' ? 'Courier Slip' : 'Packing Instruction'}
                    {isExpressModeEnabled && (
                      <span className="ml-2 text-sm font-normal text-blue-700">(Express Mode)</span>
                    )}
                  </CardTitle>
                  <div className="flex space-x-2">
                    {isSteelCourier && printType === 'full' && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => generatedSlip && generateSteelCargoSlipPDF(generatedSlip)} 
                        className="print:hidden"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print PDF
                      </Button>
                    )}
                    {/* PDF Print buttons for different courier types */}
                    {!isSteelCourier && generatedSlip.courierName.toLowerCase().includes('trackon') && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => generatedSlip && generateTrackonSlipPDF(generatedSlip)} 
                        className="print:hidden"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print PDF
                      </Button>
                    )}
                    {!isSteelCourier && generatedSlip.courierName.toLowerCase().includes('global') && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => generatedSlip && generateGlobalPrimexSlipPDF(generatedSlip)} 
                        className="print:hidden"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print PDF
                      </Button>
                    )}
                    {!isSteelCourier && !generatedSlip.courierName.toLowerCase().includes('trackon') && 
                      !generatedSlip.courierName.toLowerCase().includes('global') && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => generatedSlip && generateSteelCargoSlipPDF({...generatedSlip, courierName: "Steel Courier & Cargo"})} 
                        className="print:hidden"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {getSlipComponent(generatedSlip)}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default GenerateSlip;
