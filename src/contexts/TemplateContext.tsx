import React, { createContext, useContext, useState, useEffect } from 'react';
import { templatesAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

// UI Template interface
interface Template {
  id: string;
  name: string;
  html: string;
  css: string;
  json?: any;
  courierType?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Template interface
interface ApiTemplate {
  id: string;
  name: string;
  html: string;
  css: string;
  json?: any;
  courier_type: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateContextType {
  templates: Template[];
  activeTemplate: Template | null;
  setActiveTemplate: (template: Template) => void;
  saveTemplate: (template: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplatesByCourierType: (courierType: string) => Template[];
  isLoading: boolean;
  initializeTemplates: () => Promise<void>;
}

// Convert API template to UI format
const apiToUiFormat = (apiTemplate: ApiTemplate): Template => {
  return {
    id: apiTemplate.id,
    name: apiTemplate.name,
    html: apiTemplate.html,
    css: apiTemplate.css,
    json: apiTemplate.json,
    courierType: apiTemplate.courier_type,
    isDefault: apiTemplate.is_default,
    createdAt: apiTemplate.created_at,
    updatedAt: apiTemplate.updated_at
  };
};

// Convert UI template to API format
const uiToApiFormat = (uiTemplate: Partial<Template>): Partial<ApiTemplate> => {
  const apiTemplate: Partial<ApiTemplate> = {};
  
  if (uiTemplate.name !== undefined) apiTemplate.name = uiTemplate.name;
  if (uiTemplate.html !== undefined) apiTemplate.html = uiTemplate.html;
  if (uiTemplate.css !== undefined) apiTemplate.css = uiTemplate.css;
  if (uiTemplate.json !== undefined) apiTemplate.json = uiTemplate.json;
  if (uiTemplate.courierType !== undefined) apiTemplate.courier_type = uiTemplate.courierType;
  if (uiTemplate.isDefault !== undefined) apiTemplate.is_default = uiTemplate.isDefault;
  
  return apiTemplate;
};

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load templates from API on mount
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const apiTemplates = await templatesAPI.getAll() as ApiTemplate[];
      
      if (apiTemplates.length === 0) {
        // If no templates exist, initialize defaults
        await initializeTemplates();
        return;
      }
      
      const formattedTemplates = apiTemplates.map(apiToUiFormat);
      setTemplates(formattedTemplates);
      
      // Set the first default template as active if no active template
      if (!activeTemplate && formattedTemplates.length > 0) {
        const defaultTemplate = formattedTemplates.find(t => t.isDefault);
        if (defaultTemplate) {
          setActiveTemplate(defaultTemplate);
        } else if (formattedTemplates.length > 0) {
          setActiveTemplate(formattedTemplates[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error loading templates",
        description: "Could not load templates from the server.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize with default templates
  const initializeTemplates = async () => {
    try {
      setIsLoading(true);
      await templatesAPI.initDefaults();
      
      // Fetch again after initialization
      const apiTemplates = await templatesAPI.getAll() as ApiTemplate[];
      const formattedTemplates = apiTemplates.map(apiToUiFormat);
      
      setTemplates(formattedTemplates);
      
      if (formattedTemplates.length > 0) {
        const defaultTemplate = formattedTemplates.find(t => t.isDefault);
        setActiveTemplate(defaultTemplate || formattedTemplates[0]);
      }
      
      toast({
        title: "Templates initialized",
        description: "Default templates have been created successfully."
      });
    } catch (error) {
      console.error('Error initializing templates:', error);
      toast({
        title: "Initialization failed",
        description: "Failed to create default templates.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save or update a template
  const saveTemplate = async (templateData: Partial<Template>) => {
    try {
      setIsLoading(true);
      const apiData = uiToApiFormat(templateData);
      
      let savedTemplate: ApiTemplate;
      
      if (templateData.id) {
        // Update existing template
        savedTemplate = await templatesAPI.update(templateData.id, apiData) as ApiTemplate;
      } else {
        // Create new template
        savedTemplate = await templatesAPI.create(apiData) as ApiTemplate;
      }
      
      const formattedTemplate = apiToUiFormat(savedTemplate);
      
      // Update templates list
      setTemplates(prevTemplates => {
        const existingIndex = prevTemplates.findIndex(t => t.id === formattedTemplate.id);
        
        if (existingIndex >= 0) {
          // Replace existing template
          return prevTemplates.map((template, index) => 
            index === existingIndex ? formattedTemplate : template
          );
        } else {
          // Add new template
          return [...prevTemplates, formattedTemplate];
        }
      });
      
      // Update active template if it's the one being edited
      if (activeTemplate && activeTemplate.id === formattedTemplate.id) {
        setActiveTemplate(formattedTemplate);
      } else if (!templateData.id) {
        // Set new template as active
        setActiveTemplate(formattedTemplate);
      }
      
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Save failed",
        description: "Failed to save template changes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a template
  const deleteTemplate = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Don't allow deletion of default templates
      const templateToDelete = templates.find(t => t.id === id);
      if (templateToDelete?.isDefault) {
        toast({
          title: "Cannot delete default template",
          description: "Default templates cannot be deleted.",
          variant: "destructive"
        });
        return;
      }
      
      await templatesAPI.delete(id);
      
      setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== id));
      
      // If the active template is being deleted, set another one as active
      if (activeTemplate && activeTemplate.id === id) {
        const remainingTemplates = templates.filter(template => template.id !== id);
        if (remainingTemplates.length > 0) {
          setActiveTemplate(remainingTemplates[0]);
        } else {
          setActiveTemplate(null);
        }
      }
      
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete template.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get templates filtered by courier type
  const getTemplatesByCourierType = (courierType: string): Template[] => {
    return templates.filter(template => template.courierType === courierType);
  };
  
  const value = {
    templates,
    activeTemplate,
    setActiveTemplate,
    saveTemplate,
    deleteTemplate,
    getTemplatesByCourierType,
    isLoading,
    initializeTemplates
  };
  
  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

export default TemplateProvider;
