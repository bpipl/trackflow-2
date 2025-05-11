
import React, { createContext, useContext, useState, useEffect } from 'react';

type WhatsAppSettings = {
  autoSendDelay: number;
  enableAutoSend: boolean;
  messageTemplate: string;
  startSendingTime: string;
  sendDelayBetweenCustomers: number;
  allowManualOverride: boolean;
  enableBatchSummary: boolean;
};

const defaultSettings: WhatsAppSettings = {
  autoSendDelay: 3, // 3 hours after slip is created
  enableAutoSend: false,
  messageTemplate: "Hello {{customer_name}}, your shipment with tracking ID {{tracking_id}} has been sent via {{courier_name}} on {{date}}. Your package consists of {{box_count}} boxes with a total weight of {{weight}} kg.",
  startSendingTime: "10:00",
  sendDelayBetweenCustomers: 60, // 60 seconds between messages
  allowManualOverride: true,
  enableBatchSummary: true,
};

type WhatsAppSettingsContextType = {
  settings: WhatsAppSettings;
  updateSettings: (newSettings: Partial<WhatsAppSettings>) => void;
  saveSettings: () => void;
  hasChanges: boolean;
  resetChanges: () => void;
};

const WhatsAppSettingsContext = createContext<WhatsAppSettingsContextType | null>(null);

export const useWhatsAppSettings = () => {
  const context = useContext(WhatsAppSettingsContext);
  if (!context) {
    throw new Error('useWhatsAppSettings must be used within a WhatsAppSettingsProvider');
  }
  return context;
};

export const WhatsAppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WhatsAppSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<WhatsAppSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Load settings from localStorage on first render
  useEffect(() => {
    const storedSettings = localStorage.getItem('whatsapp-settings');
    
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        setSavedSettings(parsedSettings);
      } catch (e) {
        console.error('Error parsing stored WhatsApp settings', e);
      }
    }
  }, []);
  
  // Check for unsaved changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings));
  }, [settings, savedSettings]);

  const updateSettings = (newSettings: Partial<WhatsAppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  const saveSettings = () => {
    localStorage.setItem('whatsapp-settings', JSON.stringify(settings));
    setSavedSettings({...settings});
    setHasChanges(false);
  };
  
  const resetChanges = () => {
    setSettings({...savedSettings});
    setHasChanges(false);
  };

  return (
    <WhatsAppSettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      saveSettings,
      hasChanges,
      resetChanges
    }}>
      {children}
    </WhatsAppSettingsContext.Provider>
  );
};
