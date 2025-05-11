import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import type { Editor } from 'grapesjs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Add necessary CSS
import 'grapesjs/dist/css/grapes.min.css';

// Types
interface TemplateEditorProps {
  initialTemplate?: string;
  onSave?: (html: string, css: string, json: any) => void;
  templates?: Array<{ id: string; name: string; }>;
}

const DEFAULT_TEMPLATE = `
<div class="courier-slip">
  <div class="slip-header">
    <div class="tracking-number">
      <div class="label">Tracking Number</div>
      <div class="barcode-placeholder">{{trackingId}}</div>
    </div>
    <div class="courier-info">
      <div class="name">{{courierName}}</div>
      <div class="slogan">Swift. Safe. Sure.</div>
    </div>
    <div class="destination">
      <div class="label">Destination</div>
      <div class="city">{{destination}}</div>
    </div>
  </div>
  <div class="slip-body">
    <div class="sender-info">
      <div class="label">From (Sender)</div>
      <div class="name">{{senderName}}</div>
      <div class="address">{{senderAddress}}</div>
      <div class="phone">Phone: {{senderPhone}}</div>
    </div>
    <div class="receiver-info">
      <div class="label">To (Receiver)</div>
      <div class="name">{{customerName}}</div>
      <div class="address">{{customerAddress}}</div>
      <div class="phone">Phone: {{customerPhone}}</div>
    </div>
  </div>
  <div class="slip-footer">
    <div class="signature-area">
      <div class="signature-box">Signature</div>
    </div>
    <div class="shipment-details">
      <div class="pieces">
        <div class="label">Pieces</div>
        <div class="value">{{numberOfBoxes}}</div>
      </div>
      <div class="weight">
        <div class="label">Weight</div>
        <div class="value">{{weight}} kg</div>
      </div>
      <div class="method">
        <div class="label">Method</div>
        <div class="value">{{method}}</div>
      </div>
    </div>
  </div>
</div>
`;

const DEFAULT_CSS = `
.courier-slip {
  font-family: Arial, sans-serif;
  border: 2px solid #000;
  margin: 10px;
  padding: 10px;
  max-width: 800px;
}
.slip-header, .slip-body, .slip-footer {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px;
  border-bottom: 1px solid #ddd;
}
.label {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
}
.barcode-placeholder {
  height: 60px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.courier-info {
  text-align: center;
}
.courier-info .name {
  font-weight: bold;
  font-size: 18px;
  color: #ff6600;
}
.courier-info .slogan {
  font-style: italic;
  color: #ff6600;
  font-size: 12px;
}
.destination .city {
  font-weight: bold;
  font-size: 18px;
  text-align: center;
}
.sender-info, .receiver-info {
  width: 48%;
  border: 1px solid #ddd;
  padding: 10px;
}
.sender-info .name, .receiver-info .name {
  font-weight: bold;
  font-size: 14px;
}
.signature-area {
  width: 60%;
}
.signature-box {
  height: 60px;
  border: 1px dashed #999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
.shipment-details {
  width: 35%;
  display: flex;
  justify-content: space-between;
}
.pieces, .weight, .method {
  text-align: center;
  padding: 5px;
}
.pieces .value, .weight .value, .method .value {
  font-weight: bold;
  font-size: 16px; /* Bigger font size for these values */
}
`;

const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  initialTemplate, 
  onSave,
  templates = []
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const { toast } = useToast();
  
  // Initialize GrapesJS editor
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Clean up any existing editor
    if (editor) {
      editor.destroy();
    }
    
    // Initialize GrapesJS
    const grapesEditor = grapesjs.init({
      container: editorRef.current,
      height: '70vh',
      width: 'auto',
      storageManager: false,
      plugins: [],
      panels: { defaults: [] },
      blockManager: {
        appendTo: '#blocks-container',
        blocks: [
          {
            id: 'section',
            label: 'Section',
            category: 'Basic',
            content: '<div class="section-block"><div data-gjs-type="text">Section content</div></div>',
            attributes: { class: 'gjs-block-section' }
          },
          {
            id: 'text',
            label: 'Text',
            category: 'Basic',
            content: '<div data-gjs-type="text">Insert your text here</div>',
          },
          {
            id: 'image',
            label: 'Image',
            category: 'Basic',
            content: '<img src="https://via.placeholder.com/150" alt="image"/>',
          },
          {
            id: 'barcode',
            label: 'Barcode',
            category: 'Courier Elements',
            content: `<div class="barcode-placeholder">Barcode: {{trackingId}}</div>`,
          },
          {
            id: 'sender',
            label: 'Sender Info',
            category: 'Courier Elements',
            content: `<div class="sender-info">
              <div class="label">From (Sender)</div>
              <div class="name">{{senderName}}</div>
              <div class="address">{{senderAddress}}</div>
              <div class="phone">Phone: {{senderPhone}}</div>
            </div>`,
          },
          {
            id: 'receiver',
            label: 'Receiver Info',
            category: 'Courier Elements',
            content: `<div class="receiver-info">
              <div class="label">To (Receiver)</div>
              <div class="name">{{customerName}}</div>
              <div class="address">{{customerAddress}}</div>
              <div class="phone">Phone: {{customerPhone}}</div>
            </div>`,
          },
          {
            id: 'shipment',
            label: 'Shipment Details',
            category: 'Courier Elements',
            content: `<div class="shipment-details">
              <div class="pieces">
                <div class="label">Pieces</div>
                <div class="value">{{numberOfBoxes}}</div>
              </div>
              <div class="weight">
                <div class="label">Weight</div>
                <div class="value">{{weight}} kg</div>
              </div>
              <div class="method">
                <div class="label">Method</div>
                <div class="value">{{method}}</div>
              </div>
            </div>`,
          }
        ]
      },
      styleManager: {
        appendTo: '#styles-container',
        sectors: [
          {
            name: 'Dimension',
            open: false,
            properties: ['width', 'height', 'padding', 'margin']
          },
          {
            name: 'Typography',
            open: false,
            properties: [
              'font-family', 
              'font-size', 
              'font-weight', 
              'text-align', 
              'color', 
              'text-shadow'
            ]
          },
          {
            name: 'Decorations',
            open: false,
            properties: [
              'background-color', 
              'border', 
              'border-radius', 
              'box-shadow'
            ]
          },
          {
            name: 'Extra',
            open: false,
            properties: ['opacity', 'transition']
          }
        ]
      },
      layerManager: {
        appendTo: '#layers-container'
      },
      // Add custom CSS for the editor
      canvas: {
        styles: [DEFAULT_CSS],
        scripts: []
      }
    });

    // Set default template content
    grapesEditor.setComponents(initialTemplate || DEFAULT_TEMPLATE);
    grapesEditor.setStyle(DEFAULT_CSS);

    // Update code view when editor changes
    grapesEditor.on('component:update', () => {
      setHtmlCode(grapesEditor.getHtml());
      setCssCode(grapesEditor.getCss());
    });

    grapesEditor.on('load', () => {
      setHtmlCode(grapesEditor.getHtml());
      setCssCode(grapesEditor.getCss());
    });

    setEditor(grapesEditor);

    return () => {
      // Clean up editor on component unmount
      grapesEditor.destroy();
    };
  }, [initialTemplate]);

  // Handle saving the template
  const handleSave = () => {
    if (!editor) return;
    
    const html = editor.getHtml();
    const css = editor.getCss();
    const json = editor.getComponents();
    
    if (onSave) {
      onSave(html, css, json);
    }
    
    toast({
      title: "Template Saved",
      description: "Your template has been saved successfully.",
    });
  };

  // Handle code view changes
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlCode(e.target.value);
  };

  const handleCssChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCssCode(e.target.value);
  };

  // Apply changes from code view
  const handleApplyCode = () => {
    if (!editor) return;
    
    editor.setComponents(htmlCode);
    editor.setStyle(cssCode);
    
    toast({
      title: "Code Applied",
      description: "Your code changes have been applied to the template.",
    });
  };

  // Template selection handler
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    // Here you would load the selected template
    // This is placeholder logic - in a real implementation, you'd load from your templates list
    toast({
      title: "Template Changed",
      description: `Switched to template: ${value}`,
    });
  };

  return (
    <div className="template-editor">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Courier Slip Template Editor</CardTitle>
            <div className="flex space-x-2">
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Template</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSave}>Save Template</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="visual">Visual Editor</TabsTrigger>
              <TabsTrigger value="code">Code View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="mt-0">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 bg-gray-50 p-4 rounded">
                  <h3 className="font-bold mb-2">Blocks</h3>
                  <div id="blocks-container" className="overflow-y-auto h-[60vh]"></div>
                </div>
                <div className="col-span-6">
                  <div ref={editorRef} className="border rounded"></div>
                </div>
                <div className="col-span-3 bg-gray-50 p-4 rounded">
                  <div className="mb-6">
                    <h3 className="font-bold mb-2">Styles</h3>
                    <div id="styles-container" className="overflow-y-auto max-h-[30vh]"></div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Layers</h3>
                    <div id="layers-container" className="overflow-y-auto max-h-[30vh]"></div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">HTML</h3>
                  <textarea
                    value={htmlCode}
                    onChange={handleHtmlChange}
                    className="w-full h-[60vh] font-mono p-2 text-sm border rounded"
                  ></textarea>
                </div>
                <div>
                  <h3 className="font-bold mb-2">CSS</h3>
                  <textarea
                    value={cssCode}
                    onChange={handleCssChange}
                    className="w-full h-[60vh] font-mono p-2 text-sm border rounded"
                  ></textarea>
                </div>
              </div>
              <div className="mt-4 text-right">
                <Button onClick={handleApplyCode}>Apply Code Changes</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Template Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded p-4 bg-white">
            <div dangerouslySetInnerHTML={{ __html: htmlCode }}></div>
            <style>{cssCode}</style>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} variant="default">
            Save Template
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TemplateEditor;
