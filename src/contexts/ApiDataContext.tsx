import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  customersAPI, 
  couriersAPI, 
  slipsAPI, 
  senderAddressesAPI,
  auditLogsAPI
} from '../lib/apiClient';

// Types
import { 
  Customer, 
  CourierPartner, 
  CourierSlip, 
  SenderAddress,
  AuditLog
} from '../types/models';

// Define context shape
interface ApiDataContextType {
  // Customers
  customers: Customer[];
  loadCustomers: () => Promise<void>;
  addCustomer: (customer: Customer) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Couriers
  couriers: CourierPartner[];
  loadCouriers: () => Promise<void>;
  addCourier: (courier: CourierPartner) => Promise<CourierPartner>;
  updateCourier: (id: string, courier: Partial<CourierPartner>) => Promise<CourierPartner>;
  deleteCourier: (id: string) => Promise<void>;
  
  // Slips
  slips: CourierSlip[];
  loadSlips: () => Promise<void>;
  addSlip: (slip: CourierSlip) => Promise<CourierSlip>;
  updateSlip: (id: string, slip: Partial<CourierSlip>) => Promise<CourierSlip>;
  markSlipAsPacked: (id: string, username: string) => Promise<CourierSlip>;
  updateBoxWeights: (id: string, data: { boxWeights: any, weighedBy: string }) => Promise<CourierSlip>;
  
  // Sender Addresses
  senderAddresses: SenderAddress[];
  loadSenderAddresses: () => Promise<void>;
  addSenderAddress: (address: SenderAddress) => Promise<SenderAddress>;
  updateSenderAddress: (id: string, address: Partial<SenderAddress>) => Promise<SenderAddress>;
  deleteSenderAddress: (id: string) => Promise<void>;
  
  // Audit Logs
  auditLogs: AuditLog[];
  loadAuditLogs: () => Promise<void>;
  addAuditLog: (log: AuditLog) => Promise<AuditLog>;
  
  // Loading states
  isLoading: {
    customers: boolean;
    couriers: boolean;
    slips: boolean;
    senderAddresses: boolean;
    auditLogs: boolean;
  };
  
  // Error states
  error: {
    customers: Error | null;
    couriers: Error | null;
    slips: Error | null;
    senderAddresses: Error | null;
    auditLogs: Error | null;
  };
}

// Create context with default values
const ApiDataContext = createContext<ApiDataContextType | null>(null);

// Provider component
export const ApiDataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // State for each data type
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [couriers, setCouriers] = useState<CourierPartner[]>([]);
  const [slips, setSlips] = useState<CourierSlip[]>([]);
  const [senderAddresses, setSenderAddresses] = useState<SenderAddress[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    customers: false,
    couriers: false,
    slips: false,
    senderAddresses: false,
    auditLogs: false
  });
  
  // Error states
  const [error, setError] = useState({
    customers: null as Error | null,
    couriers: null as Error | null,
    slips: null as Error | null,
    senderAddresses: null as Error | null,
    auditLogs: null as Error | null
  });
  
  // Customer handlers
  const loadCustomers = async (): Promise<void> => {
    try {
      setIsLoading(prev => ({ ...prev, customers: true }));
      const data = await customersAPI.getAll();
      setCustomers(data);
      setError(prev => ({ ...prev, customers: null }));
    } catch (err) {
      console.error("Failed to load customers:", err);
      setError(prev => ({ ...prev, customers: err as Error }));
    } finally {
      setIsLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const addCustomer = async (customer: Customer): Promise<Customer> => {
    try {
      const newCustomer = await customersAPI.create(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error("Failed to add customer:", err);
      throw err;
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    try {
      const updatedCustomer = await customersAPI.update(id, customer);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      console.error("Failed to update customer:", err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      await customersAPI.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete customer:", err);
      throw err;
    }
  };

  // Courier handlers
  const loadCouriers = async (): Promise<void> => {
    try {
      setIsLoading(prev => ({ ...prev, couriers: true }));
      const data = await couriersAPI.getAll();
      setCouriers(data);
      setError(prev => ({ ...prev, couriers: null }));
    } catch (err) {
      console.error("Failed to load couriers:", err);
      setError(prev => ({ ...prev, couriers: err as Error }));
    } finally {
      setIsLoading(prev => ({ ...prev, couriers: false }));
    }
  };

  const addCourier = async (courier: CourierPartner): Promise<CourierPartner> => {
    try {
      const newCourier = await couriersAPI.create(courier);
      setCouriers(prev => [...prev, newCourier]);
      return newCourier;
    } catch (err) {
      console.error("Failed to add courier:", err);
      throw err;
    }
  };

  const updateCourier = async (id: string, courier: Partial<CourierPartner>): Promise<CourierPartner> => {
    try {
      const updatedCourier = await couriersAPI.update(id, courier);
      setCouriers(prev => prev.map(c => c.id === id ? updatedCourier : c));
      return updatedCourier;
    } catch (err) {
      console.error("Failed to update courier:", err);
      throw err;
    }
  };

  const deleteCourier = async (id: string): Promise<void> => {
    try {
      await couriersAPI.delete(id);
      setCouriers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete courier:", err);
      throw err;
    }
  };

  // Slip handlers
  const loadSlips = async (): Promise<void> => {
    try {
      setIsLoading(prev => ({ ...prev, slips: true }));
      const data = await slipsAPI.getAll();
      setSlips(data);
      setError(prev => ({ ...prev, slips: null }));
    } catch (err) {
      console.error("Failed to load slips:", err);
      setError(prev => ({ ...prev, slips: err as Error }));
    } finally {
      setIsLoading(prev => ({ ...prev, slips: false }));
    }
  };

  const addSlip = async (slip: CourierSlip): Promise<CourierSlip> => {
    try {
      const newSlip = await slipsAPI.create(slip);
      setSlips(prev => [...prev, newSlip]);
      return newSlip;
    } catch (err) {
      console.error("Failed to add slip:", err);
      throw err;
    }
  };

  const updateSlip = async (id: string, slip: Partial<CourierSlip>): Promise<CourierSlip> => {
    try {
      const updatedSlip = await slipsAPI.update(id, slip);
      setSlips(prev => prev.map(s => s.id === id ? updatedSlip : s));
      return updatedSlip;
    } catch (err) {
      console.error("Failed to update slip:", err);
      throw err;
    }
  };

  const markSlipAsPacked = async (id: string, username: string): Promise<CourierSlip> => {
    try {
      const updatedSlip = await slipsAPI.markAsPacked(id, username);
      setSlips(prev => prev.map(s => s.id === id ? updatedSlip : s));
      return updatedSlip;
    } catch (err) {
      console.error("Failed to mark slip as packed:", err);
      throw err;
    }
  };

  const updateBoxWeights = async (id: string, data: { boxWeights: any, weighedBy: string }): Promise<CourierSlip> => {
    try {
      const updatedSlip = await slipsAPI.updateBoxWeights(id, data);
      setSlips(prev => prev.map(s => s.id === id ? updatedSlip : s));
      return updatedSlip;
    } catch (err) {
      console.error("Failed to update box weights:", err);
      throw err;
    }
  };

  // Sender Address handlers
  const loadSenderAddresses = async (): Promise<void> => {
    try {
      setIsLoading(prev => ({ ...prev, senderAddresses: true }));
      const data = await senderAddressesAPI.getAll();
      setSenderAddresses(data);
      setError(prev => ({ ...prev, senderAddresses: null }));
    } catch (err) {
      console.error("Failed to load sender addresses:", err);
      setError(prev => ({ ...prev, senderAddresses: err as Error }));
    } finally {
      setIsLoading(prev => ({ ...prev, senderAddresses: false }));
    }
  };

  const addSenderAddress = async (address: SenderAddress): Promise<SenderAddress> => {
    try {
      const newAddress = await senderAddressesAPI.create(address);
      setSenderAddresses(prev => [...prev, newAddress]);
      return newAddress;
    } catch (err) {
      console.error("Failed to add sender address:", err);
      throw err;
    }
  };

  const updateSenderAddress = async (id: string, address: Partial<SenderAddress>): Promise<SenderAddress> => {
    try {
      const updatedAddress = await senderAddressesAPI.update(id, address);
      setSenderAddresses(prev => prev.map(a => a.id === id ? updatedAddress : a));
      return updatedAddress;
    } catch (err) {
      console.error("Failed to update sender address:", err);
      throw err;
    }
  };

  const deleteSenderAddress = async (id: string): Promise<void> => {
    try {
      await senderAddressesAPI.delete(id);
      setSenderAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to delete sender address:", err);
      throw err;
    }
  };

  // Audit Log handlers
  const loadAuditLogs = async (): Promise<void> => {
    try {
      setIsLoading(prev => ({ ...prev, auditLogs: true }));
      const data = await auditLogsAPI.getAll();
      setAuditLogs(data);
      setError(prev => ({ ...prev, auditLogs: null }));
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(prev => ({ ...prev, auditLogs: err as Error }));
    } finally {
      setIsLoading(prev => ({ ...prev, auditLogs: false }));
    }
  };

  const addAuditLog = async (log: AuditLog): Promise<AuditLog> => {
    try {
      const newLog = await auditLogsAPI.create(log);
      setAuditLogs(prev => [...prev, newLog]);
      return newLog;
    } catch (err) {
      console.error("Failed to add audit log:", err);
      throw err;
    }
  };

  const contextValue: ApiDataContextType = {
    // Data
    customers,
    couriers,
    slips,
    senderAddresses,
    auditLogs,
    
    // Customers methods
    loadCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Couriers methods
    loadCouriers,
    addCourier,
    updateCourier,
    deleteCourier,
    
    // Slips methods
    loadSlips,
    addSlip,
    updateSlip,
    markSlipAsPacked,
    updateBoxWeights,
    
    // Sender Addresses methods
    loadSenderAddresses,
    addSenderAddress,
    updateSenderAddress,
    deleteSenderAddress,
    
    // Audit Logs methods
    loadAuditLogs,
    addAuditLog,
    
    // Loading and error states
    isLoading,
    error
  };

  return (
    <ApiDataContext.Provider value={contextValue}>
      {children}
    </ApiDataContext.Provider>
  );
};

// Custom hook to use the ApiDataContext
export const useApiData = (): ApiDataContextType => {
  const context = useContext(ApiDataContext);
  
  if (!context) {
    throw new Error('useApiData must be used within an ApiDataProvider');
  }
  
  return context;
};
