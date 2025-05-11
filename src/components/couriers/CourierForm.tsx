import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CourierFormProps {
  onSubmit: (data: {
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
  }) => void;
  initialData?: {
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
  };
  title: string;
  isExpressCourier?: boolean;
  isExpressConfigMode?: boolean; // New prop to identify if this form is for express config only
}

const CourierForm: React.FC<CourierFormProps> = ({ 
  onSubmit,
  initialData = {
    name: '',
    prefix: '',
    startingTrackingNumber: 1000,
    currentTrackingNumber: 1000,
    endTrackingNumber: 9999,
    charges: { air: 100, surface: 60 },
    expressPrefix: '',
    expressStartingTrackingNumber: 1000,
    expressCurrentTrackingNumber: 1000,
    expressEndTrackingNumber: 9999,
    expressCharges: { air: 100, surface: 60 },
  },
  title,
  isExpressCourier = false,
  isExpressConfigMode = false // Default to false
}) => {
  const [formData, setFormData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<string>("standard");
  const { toast } = useToast();
  const { isExpressModeActive, setExpressModeActive } = useData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    // If this is an express config form, don't include standard mode fields
    if (isExpressConfigMode) {
      // Fix: Include all required fields from the parent component's onSubmit type definition
      const expressData = {
        name: formData.name,
        prefix: formData.prefix,
        // Keep standard tracking numbers unchanged
        startingTrackingNumber: formData.startingTrackingNumber,
        currentTrackingNumber: formData.currentTrackingNumber,
        endTrackingNumber: formData.endTrackingNumber,
        charges: formData.charges,
        // Add express-specific data
        expressPrefix: formData.expressPrefix,
        expressStartingTrackingNumber: formData.expressStartingTrackingNumber,
        expressCurrentTrackingNumber: formData.expressCurrentTrackingNumber,
        expressEndTrackingNumber: formData.expressEndTrackingNumber,
        expressCharges: formData.expressCharges,
      };
      onSubmit(expressData);
    } else {
      // Standard behavior for regular courier form
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'airCharge' || name === 'surfaceCharge') {
      const numValue = parseFloat(value) || 0;
      setFormData({
        ...formData,
        charges: {
          ...formData.charges,
          [name === 'airCharge' ? 'air' : 'surface']: numValue,
        },
      });
    } else if (name === 'expressAirCharge' || name === 'expressSurfaceCharge') {
      const numValue = parseFloat(value) || 0;
      setFormData({
        ...formData,
        expressCharges: {
          ...formData.expressCharges,
          [name === 'expressAirCharge' ? 'air' : 'surface']: numValue,
        },
      });
    } else if (name === 'currentTrackingNumber' || name === 'startingTrackingNumber' || name === 'endTrackingNumber' ||
               name === 'expressCurrentTrackingNumber' || name === 'expressStartingTrackingNumber' || name === 'expressEndTrackingNumber') {
      setFormData({ ...formData, [name]: parseInt(value, 10) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleToggleExpressMode = () => {
    const newValue = !isExpressModeActive;
    setExpressModeActive(newValue);
    
    setFormData({
      ...formData,
      isExpressMasterToggle: newValue
    });
  };

  // If it's Express Config Mode, only show express-related fields
  if (isExpressConfigMode) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-bold">{title}</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="expressPrefix" className="block text-sm font-medium text-gray-700">
              Express Tracking ID Prefix
            </label>
            <Input
              id="expressPrefix"
              name="expressPrefix"
              value={formData.expressPrefix}
              onChange={handleChange}
              placeholder="e.g., EX-SS for Express SpeedyShip"
              maxLength={7}
            />
            <p className="mt-1 text-xs text-gray-500">Express mode uses a separate tracking prefix</p>
          </div>
          
          <div>
            <label htmlFor="expressStartingTrackingNumber" className="block text-sm font-medium text-gray-700">
              Express Starting Tracking Number
            </label>
            <Input
              id="expressStartingTrackingNumber"
              name="expressStartingTrackingNumber"
              type="number"
              value={formData.expressStartingTrackingNumber}
              onChange={handleChange}
              placeholder="Express starting number"
              min={0}
            />
          </div>
          <div>
            <label htmlFor="expressCurrentTrackingNumber" className="block text-sm font-medium text-gray-700">
              Express Current Tracking Number
            </label>
            <Input
              id="expressCurrentTrackingNumber"
              name="expressCurrentTrackingNumber"
              type="number"
              value={formData.expressCurrentTrackingNumber}
              onChange={handleChange}
              placeholder="Express current number"
              min={0}
            />
          </div>
          <div>
            <label htmlFor="expressEndTrackingNumber" className="block text-sm font-medium text-gray-700">
              Express End Tracking Number
            </label>
            <Input
              id="expressEndTrackingNumber"
              name="expressEndTrackingNumber"
              type="number"
              value={formData.expressEndTrackingNumber}
              onChange={handleChange}
              placeholder="Express end number"
              min={0}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="expressAirCharge" className="block text-sm font-medium text-gray-700">
                Express Air Shipment Charge (₹)
              </label>
              <Input
                id="expressAirCharge"
                name="expressAirCharge"
                type="number"
                value={formData.expressCharges?.air || 0}
                onChange={handleChange}
                placeholder="Express air charge"
                min={0}
              />
            </div>
            <div>
              <label htmlFor="expressSurfaceCharge" className="block text-sm font-medium text-gray-700">
                Express Surface Shipment Charge (₹)
              </label>
              <Input
                id="expressSurfaceCharge"
                name="expressSurfaceCharge"
                type="number"
                value={formData.expressCharges?.surface || 0}
                onChange={handleChange}
                placeholder="Express surface charge"
                min={0}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end pt-4 border-t">
          <Button type="submit" className="bg-courier-600 hover:bg-courier-700">
            Save Express Configuration
          </Button>
        </div>
      </form>
    );
  }

  // Standard Courier Form (original functionality)
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold">{title}</h2>
      
      {isExpressCourier ? (
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Courier Name*
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter courier name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="prefix" className="block text-sm font-medium text-gray-700">
                Tracking ID Prefix (Optional)
              </label>
              <Input
                id="prefix"
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                placeholder="e.g., EX for Express"
                maxLength={4}
              />
            </div>
            
            <div>
              <label htmlFor="startingTrackingNumber" className="block text-sm font-medium text-gray-700">
                Starting Tracking Number
              </label>
              <Input
                id="startingTrackingNumber"
                name="startingTrackingNumber"
                type="number"
                value={formData.startingTrackingNumber}
                onChange={handleChange}
                placeholder="Starting number"
                min={0}
              />
            </div>
            <div>
              <label htmlFor="currentTrackingNumber" className="block text-sm font-medium text-gray-700">
                Current Tracking Number
              </label>
              <Input
                id="currentTrackingNumber"
                name="currentTrackingNumber"
                type="number"
                value={formData.currentTrackingNumber}
                onChange={handleChange}
                placeholder="Current number"
                min={0}
              />
            </div>
            <div>
              <label htmlFor="endTrackingNumber" className="block text-sm font-medium text-gray-700">
                End Tracking Number
              </label>
              <Input
                id="endTrackingNumber"
                name="endTrackingNumber"
                type="number"
                value={formData.endTrackingNumber}
                onChange={handleChange}
                placeholder="End number"
                min={0}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="airCharge" className="block text-sm font-medium text-gray-700">
                  Air Shipment Charge (₹)
                </label>
                <Input
                  id="airCharge"
                  name="airCharge"
                  type="number"
                  value={formData.charges.air}
                  onChange={handleChange}
                  placeholder="Default air charge"
                  min={0}
                />
              </div>
              <div>
                <label htmlFor="surfaceCharge" className="block text-sm font-medium text-gray-700">
                  Surface Shipment Charge (₹)
                </label>
                <Input
                  id="surfaceCharge"
                  name="surfaceCharge"
                  type="number"
                  value={formData.charges.surface}
                  onChange={handleChange}
                  placeholder="Default surface charge"
                  min={0}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={isExpressModeActive} 
                onCheckedChange={handleToggleExpressMode}
                id="express-mode-toggle"
              />
              <label htmlFor="express-mode-toggle" className="ml-2 text-sm font-medium">
                Express Mode {isExpressModeActive ? "On" : "Off"}
              </label>
            </div>
            
            <Button type="submit" className="bg-courier-600 hover:bg-courier-700">
              Save Courier
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Courier Name*
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter courier name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="prefix" className="block text-sm font-medium text-gray-700">
                Tracking ID Prefix (Optional)
              </label>
              <Input
                id="prefix"
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                placeholder="e.g., SS for SpeedyShip"
                maxLength={4}
              />
              <p className="mt-1 text-xs text-gray-500">Leave blank if no prefix is needed</p>
            </div>
            <div>
              <label htmlFor="startingTrackingNumber" className="block text-sm font-medium text-gray-700">
                Starting Tracking Number
              </label>
              <Input
                id="startingTrackingNumber"
                name="startingTrackingNumber"
                type="number"
                value={formData.startingTrackingNumber}
                onChange={handleChange}
                placeholder="Starting number"
                min={0}
              />
            </div>
            <div>
              <label htmlFor="currentTrackingNumber" className="block text-sm font-medium text-gray-700">
                Current Tracking Number
              </label>
              <Input
                id="currentTrackingNumber"
                name="currentTrackingNumber"
                type="number"
                value={formData.currentTrackingNumber}
                onChange={handleChange}
                placeholder="Current number"
                min={0}
              />
            </div>
            <div>
              <label htmlFor="endTrackingNumber" className="block text-sm font-medium text-gray-700">
                End Tracking Number
              </label>
              <Input
                id="endTrackingNumber"
                name="endTrackingNumber"
                type="number"
                value={formData.endTrackingNumber}
                onChange={handleChange}
                placeholder="End number"
                min={0}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="airCharge" className="block text-sm font-medium text-gray-700">
                  Air Shipment Charge (₹)
                </label>
                <Input
                  id="airCharge"
                  name="airCharge"
                  type="number"
                  value={formData.charges.air}
                  onChange={handleChange}
                  placeholder="Default air charge"
                  min={0}
                />
              </div>
              <div>
                <label htmlFor="surfaceCharge" className="block text-sm font-medium text-gray-700">
                  Surface Shipment Charge (₹)
                </label>
                <Input
                  id="surfaceCharge"
                  name="surfaceCharge"
                  type="number"
                  value={formData.charges.surface}
                  onChange={handleChange}
                  placeholder="Default surface charge"
                  min={0}
                />
              </div>
            </div>
            
            {/* Hidden Express Mode settings but keep them for data structure */}
            <div className="hidden">
              <input 
                type="text"
                name="expressPrefix"
                value={formData.expressPrefix || `EX-${formData.prefix}`}
                onChange={handleChange}
              />
              <input 
                type="number"
                name="expressStartingTrackingNumber"
                value={formData.expressStartingTrackingNumber || 1000}
                onChange={handleChange}
              />
              <input 
                type="number"
                name="expressCurrentTrackingNumber"
                value={formData.expressCurrentTrackingNumber || 1000}
                onChange={handleChange}
              />
              <input 
                type="number"
                name="expressEndTrackingNumber"
                value={formData.expressEndTrackingNumber || 9999}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Express Mode Toggle at the bottom */}
          <div className="flex items-center justify-between pt-4 border-t">
            {isExpressCourier && (
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isExpressModeActive} 
                  onCheckedChange={handleToggleExpressMode}
                  id="express-mode-toggle"
                />
                <label htmlFor="express-mode-toggle" className="ml-2 text-sm font-medium">
                  Express Mode {isExpressModeActive ? "On" : "Off"}
                </label>
              </div>
            )}
            <Button type="submit" className="bg-courier-600 hover:bg-courier-700 ml-auto">
              Save Courier
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default CourierForm;
