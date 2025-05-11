
import React, { createContext, useContext, useState, useEffect } from 'react';
import { whatsAppSettingsAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

// Types for WhatsApp settings
type WhatsAppSettings = {
  autoSendDelay: number;
  enableAutoSend: boolean;
  messageTemplate: string;
  startSendingTime: string;
  sendDelayBetweenCustomers: number;
  allowManualOverride: boolean;
  enableBatchSummary: boolean;
};

// API response structure
interface ApiWhatsAppSettings {
  id: string;
  auto_send_delay: number;
  enable_auto_send: boolean;
  message_template: string;
  start_sending_time: string;
  send_delay_between_customers: number;
  allow_manual_override: boolean;
  enable_batch_summary: boolean;
  created_at: string;
  updated_at: string;
}

// Default settings to use while loading or if API fails
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
  saveSettings: () => Promise<void>;
  hasChanges: boolean;
  resetChanges: () => void;
  isLoading: boolean;
};

// Convert API format to UI format
const apiToUiFormat = (apiSettings: ApiWhatsAppSettings): WhatsAppSettings => {
  return {
    autoSendDelay: apiSettings.auto_send_delay,
    enableAutoSend: apiSettings.enable_auto_send,
    messageTemplate: apiSettings.message_template,
    startSendingTime: apiSettings.start_sending_time,
    sendDelayBetweenCustomers: apiSettings.send_delay_between_customers,
    allowManualOverride: apiSettings.allow_manual_override,
    enableBatchSummary: apiSettings.enable_batch_summary,
  };
};

// Convert UI format to API format
const uiToApiFormat = (uiSettings: WhatsAppSettings): Partial<ApiWhatsAppSettings> => {
  return {
    auto_send_delay: uiSettings.autoSendDelay,
    enable_auto_send: uiSettings.enableAutoSend,
    message_template: uiSettings.messageTemplate,
    start_sending_time: uiSettings.startSendingTime,
    send_delay_between_customers: uiSettings.sendDelayBetweenCustomers,
    allow_manual_override: uiSettings.allowManualOverride,
    enable_batch_summary: uiSettings.enableBatchSummary,
  };
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load settings from API on first render
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const apiSettings = await whatsAppSettingsAPI.get() as ApiWhatsAppSettings;
        const formattedSettings = apiToUiFormat(apiSettings);
        setSettings(formattedSettings);
        setSavedSettings(formattedSettings);
      } catch (error) {
        console.error('Error fetching WhatsApp settings from API', error);
        toast({
          title: "Error loading settings",
          description: "Using default settings. Changes may not be saved.",
          variant: "destructive"
        });
        // Fallback to defaults if API call fails
        setSettings(defaultSettings);
        setSavedSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);
  
  // Check for unsaved changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings));
  }, [settings, savedSettings]);

  const updateSettings = (newSettings: Partial<WhatsAppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  const saveSettings = async () => {
    try {
      setIsLoading(true);
      const apiFormattedSettings = uiToApiFormat(settings);
      const updatedSettings = await whatsAppSettingsAPI.update(apiFormattedSettings) as ApiWhatsAppSettings;
      const formattedSettings = apiToUiFormat(updatedSettings);
      
      setSavedSettings(formattedSettings);
      setSettings(formattedSettings);
      setHasChanges(false);
      
      toast({
        title: "Settings saved",
        description: "Your WhatsApp settings have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving WhatsApp settings to API', error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
      resetChanges,
      isLoading
    }}>
      {children}
    </WhatsAppSettingsContext.Provider>
  );
};
