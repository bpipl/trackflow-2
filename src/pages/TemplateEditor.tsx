import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useTemplates } from '@/contexts/TemplateContext';
import TemplateEditor from '@/components/editor/TemplateEditor';
import { PlusCircle, Copy, Trash } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the Template Editor Page component
const TemplateEditorPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { 
    templates, 
    activeTemplate, 
    setActiveTemplate, 
    saveTemplate, 
    deleteTemplate 
  } = useTemplates();
  
  // State for the new template dialog
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCourierType, setNewTemplateCourierType] = useState('generic');
  const [templateToCopy, setTemplateToCopy] = useState<string | null>(null);
  
  // Handlers
  const handleSaveTemplate = (html: string, css: string, json: any) => {
    if (!activeTemplate) return;
    
    saveTemplate({
      id: activeTemplate.id,
      html,
      css,
      json
    });
    
    toast({
      title: 'Template Saved',
      description: `"${activeTemplate.name}" has been updated successfully.`,
    });
  };
  
  const handleCreateNewTemplate = () => {
    // Validate inputs
    if (!newTemplateName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a template name.',
        variant: 'destructive',
      });
      return;
    }
    
    let initialHtml = '';
    let initialCss = '';
    let initialJson = null;
    
    // If copying from another template
    if (templateToCopy) {
      const sourceTpl = templates.find(t => t.id === templateToCopy);
      if (sourceTpl) {
        initialHtml = sourceTpl.html;
        initialCss = sourceTpl.css;
        initialJson = sourceTpl.json;
      }
    }
    
    // Create the new template
    saveTemplate({
      name: newTemplateName,
      courierType: newTemplateCourierType,
      html: initialHtml,
      css: initialCss,
      json: initialJson
    });
    
    // Reset form and close dialog
    setNewTemplateName('');
    setNewTemplateCourierType('generic');
    setTemplateToCopy(null);
    setIsNewTemplateDialogOpen(false);
    
    toast({
      title: 'Template Created',
      description: `"${newTemplateName}" has been created successfully.`,
    });
  };
  
  const handleDeleteTemplate = () => {
    if (!activeTemplate) return;
    
    // Don't allow deletion of default templates
    if (activeTemplate.isDefault) {
      toast({
        title: 'Cannot Delete',
        description: 'Default templates cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }
    
    const templateName = activeTemplate.name;
    deleteTemplate(activeTemplate.id);
    
    toast({
      title: 'Template Deleted',
      description: `"${templateName}" has been deleted.`,
    });
  };
  
  const handleTemplateSelect = (templateId: string) => {
    const selected = templates.find(t => t.id === templateId);
    if (selected) {
      setActiveTemplate(selected);
    }
  };
  
  // Page content
  return (
    <PageLayout 
      title="Template Editor" 
      userRole={user?.role} 
      onLogout={logout}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Courier Slip Templates</h2>
            <p className="text-muted-foreground">
              Customize how your courier slips look using the visual editor.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Dialog 
              open={isNewTemplateDialogOpen} 
              onOpenChange={setIsNewTemplateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Create a new courier slip template. You can start from scratch or copy an existing template.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input 
                      id="name" 
                      value={newTemplateName} 
                      onChange={(e) => setNewTemplateName(e.target.value)} 
                      placeholder="My Custom Template"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="courierType">Courier Type</Label>
                    <Select 
                      value={newTemplateCourierType} 
                      onValueChange={setNewTemplateCourierType}
                    >
                      <SelectTrigger id="courierType">
                        <SelectValue placeholder="Select courier type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generic">Generic</SelectItem>
                        <SelectItem value="trackon">Trackon</SelectItem>
                        <SelectItem value="steel">Steel Cargo</SelectItem>
                        <SelectItem value="globalprimex">Global Primex</SelectItem>
                        <SelectItem value="shree">Shree Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="copyFrom">Copy From (Optional)</Label>
                    <Select 
                      value={templateToCopy || ''} 
                      onValueChange={setTemplateToCopy}
                    >
                      <SelectTrigger id="copyFrom">
                        <SelectValue placeholder="Start from scratch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Start from scratch</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} {template.isDefault ? '(Default)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsNewTemplateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNewTemplate}>Create Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {activeTemplate && !activeTemplate.isDefault && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteTemplate}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Template
              </Button>
            )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Template Selection</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`w-64 cursor-pointer hover:border-primary transition-colors ${
                    activeTemplate?.id === template.id ? 'border-2 border-primary' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{template.name}</span>
                      {template.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">
                      Type: {template.courierType?.charAt(0).toUpperCase() || ''}
                      {template.courierType?.slice(1) || ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {activeTemplate ? (
          <TemplateEditor 
            initialTemplate={activeTemplate.html}
            onSave={handleSaveTemplate}
            templates={templates}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No template selected. Please select a template from above or create a new one.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsNewTemplateDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default TemplateEditorPage;
