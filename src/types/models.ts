
// User model
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  permissions: {
    viewCustomerDatabase: boolean;
    editCustomerDatabase: boolean;
    downloadReports: boolean;
    manageUsers: boolean;
    generateSlips: boolean;
    viewLogs: boolean;
    viewBoxWeights: boolean;
    editBoxWeights: boolean;
    editCompletedBoxWeights: boolean;
    cancelSlips: boolean;
    printSlips: boolean;
    reprintSlips: boolean;
    // New permissions added
    deleteCustomers: boolean;
    viewReports: boolean;
    viewCouriers: boolean;
    editCouriers: boolean;
    viewSenders: boolean;
    editSenders: boolean;
    useExpressMode: boolean;
    manageExpressMode: boolean;
  };
}

// Customer model with detailed Indian address fields
export interface Customer {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  mobile2?: string; // Added secondary mobile number
  address: {
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
  };
  preferredCourier?: string;
  defaultToPayShipping?: boolean;
  notes?: string; // Added notes field for customer
  preferredShipmentMethod?: 'air' | 'surface'; // Added preferred shipment method
  preferredPrintType?: 'full' | 'packing'; // Added preferred print type
}

// Courier Partner model, extended with express mode capabilities
export interface CourierPartner {
  id: string;
  name: string;
  prefix: string; // Can be empty string
  startingTrackingNumber: number;
  currentTrackingNumber: number;
  endTrackingNumber: number; // Added end tracking number
  charges: {
    air: number;
    surface: number;
  };
  isCustomCourier?: boolean; // Flag for customer demanded courier
  defaultShipmentMethod?: 'air' | 'surface'; // Added default shipment method
  defaultPrintType?: 'full' | 'packing'; // Added default print type
  // Express mode fields
  expressPrefix?: string; // Prefix for express mode tracking numbers
  expressStartingTrackingNumber?: number;
  expressCurrentTrackingNumber?: number;
  expressEndTrackingNumber?: number;
  expressCharges?: {
    air: number;
    surface: number;
  };
  isExpressMasterToggle?: boolean; // Flag for the special Express Courier entry
}

// Sender Address model (updated to match Customer structure)
export interface SenderAddress {
  id: string;
  name: string;
  email?: string;
  phone: string;
  mobile?: string;
  mobile2?: string;
  gstNumber?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
  };
  isDefault?: boolean;
}

// Courier Slip model
export interface CourierSlip {
  id: string;
  trackingId: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerMobile: string;
  courierId: string;
  courierName: string;
  senderAddressId: string;
  senderName: string;
  senderAddress: string;
  method: 'air' | 'surface';
  weight?: number;
  numberOfBoxes?: number;
  boxWeights?: number[]; // Added to track individual box weights
  weighedAt?: string;
  weighedBy?: string;
  generatedBy: string;
  generatedAt: string;
  charges: number;
  emailSent: boolean;
  isCancelled?: boolean;
  isToPayShipping?: boolean;
  isPacked?: boolean;
  packedAt?: string;
  packedBy?: string;
  isExpressMode?: boolean; // Flag to indicate if this slip is from Express Mode
}

// Audit Log model
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  details: Record<string, any>;
}

// Report filters
export interface ReportFilters {
  startDate: string;
  endDate: string;
  courierId?: string;
}

// Added new interface for report display options
export interface ReportDisplayOptions {
  showCharges: boolean;
}

// Added new interface for Box Weight Entry
export interface BoxWeightEntry {
  slipId: string;
  trackingId: string;
  customerName: string;
  courierName: string;
  numberOfBoxes: number;
  boxWeights: number[];
  generatedAt: string;
  isPending: boolean;
}

// Packing instruction receipt
export interface PackingInstruction {
  slipId: string;
  trackingId: string;
  customerName: string;
  customerLocation: string; // City, State
  generatedAt: string;
  generatedBy: string;
  numberOfBoxes: number;
}
