import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useWhatsAppSettings } from '@/contexts/WhatsAppSettingsContext';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Save, RefreshCw } from 'lucide-react';

const placeholderVariables = [
  "{{customer_name}}",
  "{{tracking_id}}",
  "{{courier_name}}",
  "{{date}}",
  "{{box_count}}",
  "{{weight}}"
];

// Schema for form validation
const formSchema = z.object({
  enableAutoSend: z.boolean().default(false),
  autoSendDelay: z.number().min(0).max(72),
  messageTemplate: z.string().min(10, {
    message: "Message template must be at least 10 characters.",
  }),
  startSendingTime: z.string(),
  sendDelayBetweenCustomers: z.number().min(0).max(300),
  allowManualOverride: z.boolean().default(true),
  enableBatchSummary: z.boolean().default(true),
});

type WhatsAppSettingsFormValues = z.infer<typeof formSchema>;

export default function WhatsAppSettings() {
  const { user } = useAuth();
  const { settings, updateSettings, saveSettings, hasChanges, resetChanges } = useWhatsAppSettings();
  const { toast } = useToast();
  
  const form = useForm<WhatsAppSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableAutoSend: settings.enableAutoSend,
      autoSendDelay: settings.autoSendDelay,
      messageTemplate: settings.messageTemplate,
      startSendingTime: settings.startSendingTime,
      sendDelayBetweenCustomers: settings.sendDelayBetweenCustomers,
      allowManualOverride: settings.allowManualOverride,
      enableBatchSummary: settings.enableBatchSummary,
    },
  });
  
  const onSubmit = (data: WhatsAppSettingsFormValues) => {
    updateSettings(data);
    saveSettings();
    toast({
      title: "Settings saved",
      description: "Your WhatsApp settings have been updated successfully.",
    });
  };
  
  const handleInsertPlaceholder = (placeholder: string) => {
    const templateField = form.getValues('messageTemplate');
    const cursorPos = (document.getElementById('messageTemplate') as HTMLTextAreaElement)?.selectionStart || templateField.length;
    
    const newTemplate = 
      templateField.substring(0, cursorPos) +
      placeholder +
      templateField.substring(cursorPos);
      
    form.setValue('messageTemplate', newTemplate, { shouldValidate: true });
  };
  
  const handleReset = () => {
    resetChanges();
    form.reset({
      enableAutoSend: settings.enableAutoSend,
      autoSendDelay: settings.autoSendDelay,
      messageTemplate: settings.messageTemplate,
      startSendingTime: settings.startSendingTime,
      sendDelayBetweenCustomers: settings.sendDelayBetweenCustomers,
      allowManualOverride: settings.allowManualOverride,
      enableBatchSummary: settings.enableBatchSummary,
    });
    toast({
      title: "Changes discarded",
      description: "Your changes have been reset to the last saved settings.",
    });
  };

  // Make sure form values are synced with context when settings change
  React.useEffect(() => {
    form.reset({
      enableAutoSend: settings.enableAutoSend,
      autoSendDelay: settings.autoSendDelay,
      messageTemplate: settings.messageTemplate,
      startSendingTime: settings.startSendingTime,
      sendDelayBetweenCustomers: settings.sendDelayBetweenCustomers,
      allowManualOverride: settings.allowManualOverride,
      enableBatchSummary: settings.enableBatchSummary,
    });
  }, [settings, form]);

  return (
    <PageLayout title="WhatsApp Settings" userRole={user?.role}>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            WhatsApp Notification Settings
          </CardTitle>
          <CardDescription>
            Configure automatic WhatsApp notifications for shipping slips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Enable Auto Send */}
              <FormField
                control={form.control}
                name="enableAutoSend"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Automatic Sending</FormLabel>
                      <FormDescription>
                        Automatically send WhatsApp notifications based on settings below
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Auto Send Delay */}
              <FormField
                control={form.control}
                name="autoSendDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send Automatically After (Hours)</FormLabel>
                    <FormDescription>
                      Number of hours after slip creation to send notification
                    </FormDescription>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={72} 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Start Sending Time */}
              <FormField
                control={form.control}
                name="startSendingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Sending Time</FormLabel>
                    <FormDescription>
                      Only send notifications after this time of day
                    </FormDescription>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Message Template */}
              <FormField
                control={form.control}
                name="messageTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Message Template</FormLabel>
                    <FormDescription>
                      Template for WhatsApp messages with placeholders
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        rows={4}
                        id="messageTemplate"
                        {...field} 
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {placeholderVariables.map((placeholder) => (
                        <Button 
                          key={placeholder}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInsertPlaceholder(placeholder)}
                        >
                          {placeholder}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Send Delay Between Customers */}
              <FormField
                control={form.control}
                name="sendDelayBetweenCustomers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send Delay Between Messages (seconds)</FormLabel>
                    <FormDescription>
                      Pause between consecutive messages to avoid rate limiting
                    </FormDescription>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={300} 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Allow Manual Override */}
              <FormField
                control={form.control}
                name="allowManualOverride"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Manual Override Per Slip</FormLabel>
                      <FormDescription>
                        Enable checkbox in Reports list to override auto-send for specific slips
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Batch Summary */}
              <FormField
                control={form.control}
                name="enableBatchSummary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Send Daily Batch Summary</FormLabel>
                      <FormDescription>
                        Send end-of-day summary with total messages sent, failures, and customer details
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Form buttons */}
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={!hasChanges}
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Reset Changes
                </Button>
                <Button 
                  type="submit"
                  disabled={!hasChanges}
                >
                  <Save className="mr-2 h-3 w-3" />
                  Save Settings
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
