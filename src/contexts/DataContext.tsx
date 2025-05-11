import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, CourierPartner, CourierSlip, AuditLog, SenderAddress } from '@/types/models';

// Mock data
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    mobile: '555-123-4567',
    address: {
      addressLine1: '123 Main St',
      addressLine2: 'Floor 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
    preferredCourier: '1',
    defaultToPayShipping: false,
    notes: 'Premium customer, handle with care',
  },
  {
    id: '2',
    name: 'Globex Industries',
    email: 'info@globex.com',
    mobile: '555-987-6543',
    mobile2: '555-456-7890', // Added secondary mobile
    address: {
      addressLine1: '456 Park Ave',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
    preferredCourier: '2',
    defaultToPayShipping: true,
  },
  {
    id: '3',
    name: 'Wayne Enterprises',
    mobile: '555-555-5555',
    address: {
      addressLine1: '789 Gotham Rd',
      landmark: 'Near City Park',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
    },
    preferredCourier: '3',
    defaultToPayShipping: false,
    notes: 'Requires signature on delivery',
  },
  {
    id: '4',
    name: 'Star Tech Solutions',
    email: 'orders@startech.com',
    mobile: '555-111-2222',
    address: {
      addressLine1: '42 Innovation Hub',
      addressLine2: 'Tech Park',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
    },
    preferredCourier: '4',
    defaultToPayShipping: true,
    notes: 'Regular weekly shipments on Mondays',
  },
  {
    id: '5',
    name: 'Omega Electronics',
    email: 'sales@omega-electronics.com',
    mobile: '555-333-4444',
    mobile2: '555-444-5555',
    address: {
      addressLine1: '789 Circuit Board Lane',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600042',
      landmark: 'Opposite Central Mall',
    },
    preferredCourier: '1',
    defaultToPayShipping: false,
  },
  {
    id: '6',
    name: 'Pinnacle Pharmaceuticals',
    email: 'shipping@pinnaclepharma.com',
    mobile: '555-666-7777',
    address: {
      addressLine1: '123 Health Avenue',
      addressLine2: 'Building 4, Floor 3',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411006',
    },
    preferredCourier: '3',
    defaultToPayShipping: false,
    notes: 'Temperature-controlled items. Handle with care.',
  },
  {
    id: '7',
    name: 'Evergreen Textiles',
    email: 'orders@evergreentextiles.com',
    mobile: '555-888-9999',
    address: {
      addressLine1: '45 Cotton Mill Road',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395003',
      landmark: 'Near Industrial Zone',
    },
    preferredCourier: '2',
    defaultToPayShipping: true,
    notes: 'Bulk orders - multiple packages typically',
  }
];

const initialCouriers: CourierPartner[] = [
  {
    id: '1',
    name: 'SpeedyShip',
    prefix: 'SS',
    startingTrackingNumber: 1000,
    currentTrackingNumber: 1000,
    endTrackingNumber: 2000,
    charges: {
      air: 100,
      surface: 60,
    },
  },
  {
    id: '2',
    name: 'Global Express',
    prefix: 'GE',
    startingTrackingNumber: 500,
    currentTrackingNumber: 500,
    endTrackingNumber: 1000,
    charges: {
      air: 120,
      surface: 70,
    },
  },
  {
    id: '3',
    name: 'Steel Courier & Cargo',
    prefix: 'SC',
    startingTrackingNumber: 5000,
    currentTrackingNumber: 5000,
    endTrackingNumber: 6000,
    charges: {
      air: 150,
      surface: 90,
    },
  },
  {
    id: '4',
    name: 'Trackon',
    prefix: 'TC',  // Added prefix for Trackon
    startingTrackingNumber: 10000,
    currentTrackingNumber: 10000,
    endTrackingNumber: 11000,
    charges: {
      air: 180,
      surface: 110,
    },
  },
  {
    id: '7',
    name: 'Shree Courier Services',
    prefix: 'SH',
    startingTrackingNumber: 3000,
    currentTrackingNumber: 3000,
    endTrackingNumber: 4000,
    charges: {
      air: 140,
      surface: 85,
    },
  },
  {
    id: '5',
    name: 'Custom Courier',
    prefix: '',
    startingTrackingNumber: 1,
    currentTrackingNumber: 1,
    endTrackingNumber: 9999999,
    charges: {
      air: 0,
      surface: 0,
    },
    isCustomCourier: true,
  },
  {
    id: '6',
    name: 'Express Courier',
    prefix: 'EX',
    startingTrackingNumber: 1,
    currentTrackingNumber: 1,
    endTrackingNumber: 1,
    charges: {
      air: 0,
      surface: 0,
    },
    isExpressMasterToggle: true,
  },
];

// Initial sender addresses
const initialSenderAddresses: SenderAddress[] = [
  {
    id: '1',
    name: 'Your Company Name',
    phone: '555-123-4567',
    email: 'contact@yourcompany.com',
    address: {
      addressLine1: '123 Your Company Address',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
    isDefault: true,
  }
];

const initialSlips: CourierSlip[] = [
  {
    id: '1',
    trackingId: 'SS1001',
    customerId: '1',
    customerName: 'Acme Corporation',
    customerAddress: '123 Main St, Floor 2, Mumbai, Maharashtra, 400001',
    customerMobile: '555-123-4567',
    courierId: '1',
    courierName: 'SpeedyShip',
    senderAddressId: '1',
    senderName: 'Your Company Name',
    senderAddress: '123 Your Company Address, Mumbai, Maharashtra, 400001',
    method: 'air',
    weight: 2.5,
    numberOfBoxes: 1,
    generatedBy: 'admin',
    generatedAt: '2025-05-05T10:30:00Z',
    charges: 100,
    emailSent: false,
    isCancelled: false,
    isToPayShipping: false,
    isPacked: false,
  },
  {
    id: '2',
    trackingId: 'SC5001',
    customerId: '2',
    customerName: 'Globex Industries',
    customerAddress: '456 Park Ave, Bangalore, Karnataka, 560001',
    customerMobile: '555-987-6543',
    courierId: '3',
    courierName: 'Steel Courier & Cargo',
    senderAddressId: '1',
    senderName: 'Your Company Name',
    senderAddress: '123 Your Company Address, Mumbai, Maharashtra, 400001',
    method: 'surface',
    weight: 1.5,
    numberOfBoxes: 2,
    generatedBy: 'admin',
    generatedAt: '2025-05-06T14:30:00Z',
    charges: 90,
    emailSent: false,
    isCancelled: false,
    isToPayShipping: true,
    isPacked: false,
  },
  {
    id: '3',
    trackingId: 'TC1002',
    customerId: '4',
    customerName: 'Star Tech Solutions',
    customerAddress: '42 Innovation Hub, Tech Park, Hyderabad, Telangana, 500081',
    customerMobile: '555-111-2222',
    courierId: '4',
    courierName: 'Trackon',
    senderAddressId: '1',
    senderName: 'Your Company Name',
    senderAddress: '123 Your Company Address, Mumbai, Maharashtra, 400001',
    method: 'air',
    weight: 3.2,
    numberOfBoxes: 1,
    generatedBy: 'admin',
    generatedAt: '2025-05-07T09:15:00Z',
    charges: 180,
    emailSent: true,
    isCancelled: false,
    isToPayShipping: true,
    isPacked: true,
    packedAt: '2025-05-07T11:30:00Z',
    packedBy: 'admin',
    boxWeights: [3.2],
  },
  {
    id: '4',
    trackingId: 'SS1002',
    customerId: '5',
    customerName: 'Omega Electronics',
    customerAddress: '789 Circuit Board Lane, Chennai, Tamil Nadu, 600042',
    customerMobile: '555-333-4444',
    courierId: '1',
    courierName: 'SpeedyShip',
    senderAddressId: '1',
    senderName: 'Your Company Name',
    senderAddress: '123 Your Company Address, Mumbai, Maharashtra, 400001',
    method: 'surface',
    weight: 1.8,
    numberOfBoxes: 3,
    generatedBy: 'staff',
    generatedAt: '2025-05-08T13:45:00Z',
    charges: 60,
    emailSent: true,
    isCancelled: false,
    isToPayShipping: false,
    isPacked: true,
    packedAt: '2025-05-08T15:20:00Z',
    packedBy: 'staff',
    boxWeights: [0.6, 0.7, 0.5],
  },
  {
    id: '5',
    trackingId: 'SC5002',
    customerId: '6',
    customerName: 'Pinnacle Pharmaceuticals',
    customerAddress: '123 Health Avenue, Building 4, Floor 3, Pune, Maharashtra, 411006',
    customerMobile: '555-666-7777',
    courierId: '3',
    courierName: 'Steel Courier & Cargo',
    senderAddressId: '1',
    senderName: 'Your Company Name',
    senderAddress: '123 Your Company Address, Mumbai, Maharashtra, 400001',
    method: 'air',
    weight: 4.5,
    numberOfBoxes: 2,
    generatedBy: 'admin',
    generatedAt: '2025-05-09T10:00:00Z',
    charges: 150,
    emailSent: false,
    isCancelled: false,
    isToPayShipping: false,
    isPacked: false,
  },
  {
    id: '6',
    trackingId: 'GE501',
    customerId: '7',
    customerName: 'Evergreen Textiles',
    customerAddress: '45 Cotton Mill Road, Surat, Gujarat, 395003',
    customerMobile: '555-888-9999',
    courierId: '2',
    courierName: 'Global Express',
    senderAddressId: '1',
    senderName: 'Your Company Name',
    senderAddress: '123 Your Company Address, Mumbai, Maharashtra, 400001',
    method: 'surface',
    weight: 8.2,
    numberOfBoxes: 4,
    generatedBy: 'admin',
    generatedAt: '2025-05-10T11:30:00Z',
    charges: 280,
    emailSent: true,
    isCancelled: false,
    isToPayShipping: true,
    isPacked: false,
  },
  {
    id: '7',
    trackingId: 'SS1003',
    customerId: '3',
    customerName: 'Wayne Enterprises',
    customerAddress: '789 Gotham Rd, Near City Park, Delhi, Delhi, 110001',
    customerMobile: '555-555-5555',
    courierId: '1',
    courierName: 'SpeedyShip',
    senderAddressId: '1',
    senderName: 'Your Company Name',
    senderAddress: '123 Your Company Address, Mumbai, Maharashtra, 400001',
    method: 'air',
    weight: 1.2,
    numberOfBoxes: 1,
    generatedBy: 'staff',
    generatedAt: '2025-05-11T09:45:00Z',
    charges: 100,
    emailSent: false,
    isCancelled: true,
    isToPayShipping: false,
    isPacked: false,
  }
];

const initialLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2025-05-05T10:30:00Z',
    userId: '1',
    username: 'admin',
    action: 'SLIP_GENERATED',
    details: {
      slipId: '1',
      trackingId: 'SS1001',
      customerName: 'Acme Corporation',
      courierName: 'SpeedyShip',
      numberOfBoxes: 1,
    },
  },
];

// Initial express slips (empty array)
const initialExpressSlips: CourierSlip[] = [];

interface DataContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  couriers: CourierPartner[];
  addCourier: (courier: Omit<CourierPartner, 'id'>) => void;
  updateCourier: (id: string, courier: Partial<CourierPartner>) => void;
  deleteCourier: (id: string) => void;
  incrementTrackingNumber: (id: string, isExpressMode?: boolean) => { 
    newNumber: number; 
    remainingCount: number;
    isLow: boolean;
  };
  
  senderAddresses: SenderAddress[];
  addSenderAddress: (address: Omit<SenderAddress, 'id'>) => void;
  updateSenderAddress: (id: string, address: Partial<SenderAddress>) => void;
  deleteSenderAddress: (id: string) => void;
  
  slips: CourierSlip[];
  expressSlips: CourierSlip[];
  addSlip: (slip: Omit<CourierSlip, 'id'>) => void;
  updateSlip: (id: string, slip: Partial<CourierSlip>) => void;
  markSlipAsPacked: (id: string, username: string) => void;
  
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id'>) => void;

  getPendingPackingSlips: () => CourierSlip[];
  getCompletedPackingSlips: () => CourierSlip[];
  
  // Express mode specific functions
  isExpressModeActive: boolean;
  setExpressModeActive: (active: boolean) => void;
  getActiveSlips: () => CourierSlip[]; // Returns either standard or express based on mode
  getExpressCourier: () => CourierPartner | undefined;
}

const DataContext = createContext<DataContextType>({
  customers: [],
  addCustomer: () => {},
  updateCustomer: () => {},
  deleteCustomer: () => {},
  
  couriers: [],
  addCourier: () => {},
  updateCourier: () => {},
  deleteCourier: () => {},
  incrementTrackingNumber: () => ({ newNumber: 0, remainingCount: 0, isLow: false }),
  
  senderAddresses: [],
  addSenderAddress: () => {},
  updateSenderAddress: () => {},
  deleteSenderAddress: () => {},
  
  slips: [],
  expressSlips: [],
  addSlip: () => {},
  updateSlip: () => {},
  markSlipAsPacked: () => {},
  
  logs: [],
  addLog: () => {},

  getPendingPackingSlips: () => [],
  getCompletedPackingSlips: () => [],
  
  isExpressModeActive: false,
  setExpressModeActive: () => {},
  getActiveSlips: () => [],
  getExpressCourier: () => undefined,
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [couriers, setCouriers] = useState<CourierPartner[]>(initialCouriers);
  const [senderAddresses, setSenderAddresses] = useState<SenderAddress[]>(initialSenderAddresses);
  const [slips, setSlips] = useState<CourierSlip[]>(initialSlips);
  const [expressSlips, setExpressSlips] = useState<CourierSlip[]>(initialExpressSlips);
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  
  // Persist Express Mode state in localStorage
  const [isExpressModeActive, setIsExpressModeActive] = useState(() => {
    // Try to get the state from localStorage
    const savedState = localStorage.getItem('expressMode');
    return savedState ? JSON.parse(savedState) : false;
  });
  
  // Update localStorage when Express Mode changes
  useEffect(() => {
    localStorage.setItem('expressMode', JSON.stringify(isExpressModeActive));
  }, [isExpressModeActive]);

  // Customer functions
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(
      customers.map((c) => (c.id === id ? { ...c, ...customer } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  // Courier functions
  const addCourier = (courier: Omit<CourierPartner, 'id'>) => {
    const newCourier = {
      ...courier,
      id: Date.now().toString(),
    };
    setCouriers([...couriers, newCourier]);
  };

  const updateCourier = (id: string, courier: Partial<CourierPartner>) => {
    setCouriers(
      couriers.map((c) => {
        if (c.id === id) {
          // If this is the Express Courier and we're updating the isExpressMasterToggle,
          // also update the global Express Mode state
          if (c.isExpressMasterToggle && courier.isExpressMasterToggle !== undefined) {
            setIsExpressModeActive(courier.isExpressMasterToggle);
          }
          
          // Create an updated courier object
          const updatedCourier = { ...c };
          
          // Update standard tracking fields (if provided)
          if (courier.prefix !== undefined) updatedCourier.prefix = courier.prefix;
          if (courier.startingTrackingNumber !== undefined) updatedCourier.startingTrackingNumber = courier.startingTrackingNumber;
          if (courier.currentTrackingNumber !== undefined) updatedCourier.currentTrackingNumber = courier.currentTrackingNumber;
          if (courier.endTrackingNumber !== undefined) updatedCourier.endTrackingNumber = courier.endTrackingNumber;
          if (courier.charges !== undefined) updatedCourier.charges = courier.charges;
          
          // Update express tracking fields (if provided) without affecting standard fields
          if (courier.expressPrefix !== undefined) updatedCourier.expressPrefix = courier.expressPrefix;
          if (courier.expressStartingTrackingNumber !== undefined) updatedCourier.expressStartingTrackingNumber = courier.expressStartingTrackingNumber;
          if (courier.expressCurrentTrackingNumber !== undefined) updatedCourier.expressCurrentTrackingNumber = courier.expressCurrentTrackingNumber;
          if (courier.expressEndTrackingNumber !== undefined) updatedCourier.expressEndTrackingNumber = courier.expressEndTrackingNumber;
          if (courier.expressCharges !== undefined) updatedCourier.expressCharges = courier.expressCharges;
          
          // Update other fields if provided
          if (courier.name !== undefined) updatedCourier.name = courier.name;
          if (courier.isExpressMasterToggle !== undefined) updatedCourier.isExpressMasterToggle = courier.isExpressMasterToggle;
          
          return updatedCourier;
        }
        return c;
      })
    );
  };

  const deleteCourier = (id: string) => {
    // Check if this is the Express Courier - if so, disable Express Mode
    const courierToDelete = couriers.find(c => c.id === id);
    if (courierToDelete && courierToDelete.isExpressMasterToggle) {
      setIsExpressModeActive(false);
    }
    setCouriers(couriers.filter((c) => c.id !== id));
  };

  const incrementTrackingNumber = (id: string, isExpressMode = false) => {
    let newNumber = 0;
    let remainingCount = 0;
    let isLow = false;
    
    setCouriers(
      couriers.map((c) => {
        if (c.id === id) {
          if (isExpressMode && c.expressCurrentTrackingNumber !== undefined) {
            // Express mode tracking number
            newNumber = (c.expressCurrentTrackingNumber || 0) + 1;
            remainingCount = (c.expressEndTrackingNumber || 9999) - newNumber;
            isLow = remainingCount <= 10;
            
            return { 
              ...c, 
              expressCurrentTrackingNumber: newNumber 
            };
          } else {
            // Standard mode tracking number
            newNumber = c.currentTrackingNumber + 1;
            remainingCount = c.endTrackingNumber - newNumber;
            isLow = remainingCount <= 10;
            
            return { ...c, currentTrackingNumber: newNumber };
          }
        }
        return c;
      })
    );
    
    return { newNumber, remainingCount, isLow };
  };

  // Sender Address functions
  const addSenderAddress = (address: Omit<SenderAddress, 'id'>) => {
    const newAddress = {
      ...address,
      id: Date.now().toString(),
      isDefault: senderAddresses.length === 0 // Make it default if it's the first one
    };
    setSenderAddresses([...senderAddresses, newAddress]);
  };

  const updateSenderAddress = (id: string, address: Partial<SenderAddress>) => {
    setSenderAddresses(
      senderAddresses.map((a) => (a.id === id ? { ...a, ...address } : a))
    );
  };

  const deleteSenderAddress = (id: string) => {
    // Prevent deleting if it's the last address
    if (senderAddresses.length <= 1) return;
    
    const isDefault = senderAddresses.find(a => a.id === id)?.isDefault;
    setSenderAddresses(prev => {
      const filtered = prev.filter((a) => a.id !== id);
      
      // If we deleted the default, make the first one the new default
      if (isDefault && filtered.length > 0) {
        return filtered.map((a, index) => 
          index === 0 ? { ...a, isDefault: true } : a
        );
      }
      
      return filtered;
    });
  };

  // Slip functions
  const addSlip = (slip: Omit<CourierSlip, 'id'>) => {
    const newSlip = {
      ...slip,
      id: Date.now().toString(),
    };
    
    // Store in the appropriate collection based on Express Mode
    if (slip.isExpressMode) {
      setExpressSlips([...expressSlips, newSlip]);
    } else {
      setSlips([...slips, newSlip]);
    }
  };

  // Function to update a slip
  const updateSlip = (id: string, slip: Partial<CourierSlip>) => {
    // Check if this is an express slip
    const isExpress = expressSlips.some(s => s.id === id);
    const existingSlip = isExpress 
      ? expressSlips.find(s => s.id === id)
      : slips.find(s => s.id === id);
    
    if (isExpress) {
      setExpressSlips(
        expressSlips.map((s) => (s.id === id ? { ...s, ...slip } : s))
      );
    } else {
      setSlips(
        slips.map((s) => (s.id === id ? { ...s, ...slip } : s))
      );
    }
    
    // Add log for weight update if boxWeights is being updated
    if (slip.boxWeights) {
      const updatedSlip = isExpress
        ? expressSlips.find(s => s.id === id)
        : slips.find(s => s.id === id);
      
      if (updatedSlip) {
        addLog({
          timestamp: new Date().toISOString(),
          userId: '1', // This should come from authentication context in a real app
          username: slip.weighedBy || 'system',
          action: 'BOX_WEIGHTS_UPDATED',
          details: {
            slipId: id,
            trackingId: updatedSlip.trackingId,
            boxWeights: slip.boxWeights,
            numberOfBoxes: updatedSlip.numberOfBoxes,
            isExpressMode: isExpress,
          },
        });
      }
    }
    
    // Add log for box count update if numberOfBoxes changed
    if (slip.numberOfBoxes !== undefined && existingSlip && existingSlip.numberOfBoxes !== slip.numberOfBoxes) {
      addLog({
        timestamp: new Date().toISOString(),
        userId: '1', // This should come from authentication context in a real app
        username: 'system',
        action: 'BOX_COUNT_UPDATED',
        details: {
          slipId: id,
          trackingId: existingSlip.trackingId,
          previousBoxCount: existingSlip.numberOfBoxes,
          newBoxCount: slip.numberOfBoxes,
          isExpressMode: isExpress,
        },
      });
    }

    // Add log for cancellation if isCancelled is true
    if (slip.isCancelled) {
      const cancelledSlip = isExpress
        ? expressSlips.find(s => s.id === id)
        : slips.find(s => s.id === id);
        
      if (cancelledSlip) {
        addLog({
          timestamp: new Date().toISOString(),
          userId: '1', // This should come from authentication context in a real app
          username: 'system',
          action: 'SLIP_CANCELLED',
          details: {
            slipId: id,
            trackingId: cancelledSlip.trackingId,
            customerName: cancelledSlip.customerName,
            courierName: cancelledSlip.courierName,
            isExpressMode: isExpress,
          },
        });
      }
    }
    
    // Add log for TO PAY status change if isToPayShipping is changed
    if (slip.isToPayShipping !== undefined && existingSlip && existingSlip.isToPayShipping !== slip.isToPayShipping) {
      addLog({
        timestamp: new Date().toISOString(),
        userId: '1',
        username: 'system',
        action: 'TO_PAY_STATUS_CHANGED',
        details: {
          slipId: id,
          trackingId: existingSlip.trackingId,
          previousToPayStatus: existingSlip.isToPayShipping,
          newToPayStatus: slip.isToPayShipping,
          isExpressMode: isExpress,
        },
      });
    }
  };

  // Function to mark slip as packed
  const markSlipAsPacked = (id: string, username: string) => {
    // Check if this is an express slip
    const isExpress = expressSlips.some(s => s.id === id);
    
    updateSlip(id, {
      isPacked: true,
      packedAt: new Date().toISOString(),
      packedBy: username
    });
    
    const packedSlip = isExpress
      ? expressSlips.find(s => s.id === id)
      : slips.find(s => s.id === id);
      
    if (packedSlip) {
      addLog({
        timestamp: new Date().toISOString(),
        userId: '1',
        username,
        action: 'SLIP_PACKED',
        details: {
          slipId: id,
          trackingId: packedSlip.trackingId,
          customerName: packedSlip.customerName,
          isExpressMode: isExpress,
        },
      });
    }
  };

  // Log functions
  const addLog = (log: Omit<AuditLog, 'id'>) => {
    const newLog = {
      ...log,
      id: Date.now().toString(),
    };
    setLogs([...logs, newLog]);
  };

  // Filter functions for packing slips
  const getPendingPackingSlips = () => {
    const standardSlips = slips.filter(slip => !slip.isPacked && !slip.isCancelled);
    const expressSlipsData = expressSlips.filter(slip => !slip.isPacked && !slip.isCancelled);
    
    return isExpressModeActive
      ? [...standardSlips, ...expressSlipsData]
      : standardSlips;
  };
  
  const getCompletedPackingSlips = () => {
    const standardSlips = slips.filter(slip => slip.isPacked && !slip.isCancelled);
    const expressSlipsData = expressSlips.filter(slip => slip.isPacked && !slip.isCancelled);
    
    return isExpressModeActive
      ? [...standardSlips, ...expressSlipsData]
      : standardSlips;
  };
  
  // Express mode specific functions
  const setExpressModeActive = (active: boolean) => {
    setIsExpressModeActive(active);
    
    // Also update the Express Courier's toggle state
    setCouriers(couriers.map(courier => {
      if (courier.isExpressMasterToggle) {
        return { ...courier, isExpressMasterToggle: active };
      }
      return courier;
    }));
  };
  
  const getActiveSlips = () => {
    return isExpressModeActive ? [...slips, ...expressSlips] : slips;
  };
  
  const getExpressCourier = () => {
    return couriers.find(c => c.isExpressMasterToggle);
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        couriers,
        addCourier,
        updateCourier,
        deleteCourier,
        incrementTrackingNumber,
        senderAddresses,
        addSenderAddress,
        updateSenderAddress,
        deleteSenderAddress,
        slips,
        expressSlips,
        addSlip,
        updateSlip,
        markSlipAsPacked,
        logs,
        addLog,
        getPendingPackingSlips,
        getCompletedPackingSlips,
        isExpressModeActive,
        setExpressModeActive,
        getActiveSlips,
        getExpressCourier,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
