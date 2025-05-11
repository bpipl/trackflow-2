import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface TemplateContextType {
  templates: Template[];
  activeTemplate: Template | null;
  setActiveTemplate: (template: Template) => void;
  saveTemplate: (template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  getTemplatesByCourierType: (courierType: string) => Template[];
}

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
  
  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('courierTemplates');
    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates);
        setTemplates(parsedTemplates);
        
        // Set the first default template as active if no active template
        if (!activeTemplate && parsedTemplates.length > 0) {
          const defaultTemplate = parsedTemplates.find((t: Template) => t.isDefault);
          if (defaultTemplate) {
            setActiveTemplate(defaultTemplate);
          } else if (parsedTemplates.length > 0) {
            setActiveTemplate(parsedTemplates[0]);
          }
        }
      } catch (error) {
        console.error('Error parsing saved templates:', error);
      }
    } else {
      // Initialize with default templates if none exist
      initializeDefaultTemplates();
    }
  }, []);
  
  // Save templates to localStorage whenever they change
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('courierTemplates', JSON.stringify(templates));
    }
  }, [templates]);
  
  // Initialize with default templates for different courier types
  const initializeDefaultTemplates = () => {
    const defaultTemplates: Template[] = [
      {
        id: 'default-trackon',
        name: 'Default Trackon Template',
        html: '', // This would normally contain the HTML for Trackon slips
        css: '', // This would normally contain the CSS for Trackon slips
        courierType: 'trackon',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default-steel',
        name: 'Default Steel Cargo Template',
        html: '', // This would normally contain the HTML for Steel Cargo slips
        css: '', // This would normally contain the CSS for Steel Cargo slips
        courierType: 'steel',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default-globalprimex',
        name: 'Default Global Primex Template',
        html: '', // This would normally contain the HTML for Global Primex slips
        css: '', // This would normally contain the CSS for Global Primex slips
        courierType: 'globalprimex',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default-shree',
        name: 'Default Shree Courier Template',
        html: '', // This would normally contain the HTML for Shree Courier slips
        css: '', // This would normally contain the CSS for Shree Courier slips
        courierType: 'shree',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setTemplates(defaultTemplates);
    setActiveTemplate(defaultTemplates[0]);
  };
  
  // Save or update a template
  const saveTemplate = (templateData: Partial<Template>) => {
    const now = new Date().toISOString();
    
    if (templateData.id) {
      // Update existing template
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === templateData.id 
            ? { 
                ...template, 
                ...templateData, 
                updatedAt: now 
              } 
            : template
        )
      );
      
      // Update active template if it's the one being edited
      if (activeTemplate && activeTemplate.id === templateData.id) {
        setActiveTemplate(prev => prev ? { ...prev, ...templateData, updatedAt: now } : null);
      }
    } else {
      // Create new template
      const newTemplate: Template = {
        id: `template-${Date.now()}`,
        name: templateData.name || 'Untitled Template',
        html: templateData.html || '',
        css: templateData.css || '',
        json: templateData.json || null,
        courierType: templateData.courierType || 'generic',
        isDefault: false,
        createdAt: now,
        updatedAt: now
      };
      
      setTemplates(prevTemplates => [...prevTemplates, newTemplate]);
      setActiveTemplate(newTemplate);
    }
  };
  
  // Delete a template
  const deleteTemplate = (id: string) => {
    // Don't allow deletion of default templates
    const templateToDelete = templates.find(t => t.id === id);
    if (templateToDelete?.isDefault) {
      console.error('Cannot delete default templates');
      return;
    }
    
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
    getTemplatesByCourierType
  };
  
  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

export default TemplateProvider;
