
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Check } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Customer, CourierPartner } from '@/types/models';
import { ThankYouScreen } from './ThankYouScreen';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  mobile: z.string()
    .regex(/^[6-9]\d{9}$/, { 
      message: "Please enter a valid 10-digit Indian mobile number." 
    }),
  gstNumber: z.string().optional(),
  preferredCourier: z.string().optional(),
  address: z.object({
    addressLine1: z.string().min(5, { message: "Address must be at least 5 characters." }),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(2, { message: "City is required." }),
    district: z.string().optional(),
    state: z.string().min(2, { message: "State is required." }),
    pincode: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pincode." })
  }),
  whatsappConsent: z.boolean().refine(val => val === true, {
    message: "You must agree to receive updates via WhatsApp."
  })
});

type FormValues = z.infer<typeof formSchema>;

// Component for phone number input with country code
const PhoneInput = React.forwardRef<HTMLInputElement, 
  React.ComponentPropsWithoutRef<'input'> & { onBlur?: () => void }
>(({ className, ...props }, ref) => {
  return (
    <div className="flex">
      <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-input rounded-l-md">
        +91
      </div>
      <Input
        type="tel"
        className="rounded-l-none"
        maxLength={10}
        ref={ref}
        {...props}
      />
    </div>
  );
});
PhoneInput.displayName = "PhoneInput";

export const CustomerOnboardingForm = () => {
  const { couriers, addCustomer } = useData();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWhatsappIndicator, setShowWhatsappIndicator] = useState(false);
  
  // For this demo, we'll assume all valid numbers are on WhatsApp
  const [isOnWhatsapp, setIsOnWhatsapp] = useState(true);

  // Filter out the express master toggle courier
  const filteredCouriers = couriers.filter(courier => !courier.isExpressMasterToggle);

  // Show courier selection field to customers - would typically come from settings
  // In future this could be loaded from settings context
  const [showCourierField] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      mobile: '',
      gstNumber: '',
      preferredCourier: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      },
      whatsappConsent: false
    }
  });

  // Rate limiting for form submissions - simple implementation
  // In production, this would be server-side
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    
    // Update the form with sanitized value
    form.setValue('mobile', sanitizedValue);
    
    // Show WhatsApp indicator only after 10 digits are entered
    if (sanitizedValue.length === 10) {
      setShowWhatsappIndicator(true);
      
      // In a real app, this would be an API call to check WhatsApp status
      // For demo purposes, we'll simulate a random result
      setIsOnWhatsapp(Math.random() > 0.2); // 80% chance of being on WhatsApp
    } else {
      setShowWhatsappIndicator(false);
    }
  };

  // List of Indian states for the dropdown
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const onSubmit = async (data: FormValues) => {
    // Simple rate limiting check
    const now = Date.now();
    if (submissionCount > 5 && (now - lastSubmissionTime) < 60000) {
      toast({
        title: "Too many submissions",
        description: "Please wait a moment before trying again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionCount(prev => prev + 1);
    setLastSubmissionTime(now);
    
    try {
      // Format the customer data
      const customerData: Omit<Customer, 'id'> = {
        name: data.name,
        mobile: data.mobile,
        email: undefined,
        address: {
          addressLine1: data.address.addressLine1,
          addressLine2: data.address.addressLine2,
          landmark: data.address.landmark,
          city: data.address.city,
          district: data.address.district,
          state: data.address.state,
          pincode: data.address.pincode
        },
        preferredCourier: data.preferredCourier
      };
      
      // Save to DataContext
      addCustomer(customerData);
      
      // Show success toast
      toast({
        title: "Success",
        description: "Your information has been submitted successfully!"
      });
      
      // Show thank you screen
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <ThankYouScreen />;
  }

  return (
    <div className="flex justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-center mb-6">Customer Registration</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer / Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile / WhatsApp Number</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <PhoneInput 
                          placeholder="10-digit number" 
                          {...field} 
                          onChange={handleMobileChange}
                        />
                      </FormControl>
                      {showWhatsappIndicator && (
                        <div className="flex items-center mt-1 text-xs">
                          <MessageSquare size={16} className="mr-1 text-green-500" />
                          <span className={isOnWhatsapp ? "text-green-600" : "text-red-600"}>
                            {isOnWhatsapp ? "Appears to be on WhatsApp" : "Not on WhatsApp"}
                          </span>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GST number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Format: 22AAAAA0000A1Z5
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCourierField && (
                <FormField
                  control={form.control}
                  name="preferredCourier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Courier</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preferred courier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {filteredCouriers.map((courier: CourierPartner) => (
                            <SelectItem key={courier.id} value={courier.id}>
                              {courier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-4 border p-4 rounded-md">
                <h2 className="font-semibold">Address Information</h2>
                
                <FormField
                  control={form.control}
                  name="address.addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartment, suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.landmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landmark (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nearby landmark" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="District" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {indianStates.map(state => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Code</FormLabel>
                        <FormControl>
                          <Input placeholder="6-digit PIN Code" {...field} maxLength={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="whatsappConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to receive updates and promotions via WhatsApp
                      </FormLabel>
                      <FormDescription>
                        We'll only send you relevant information about your orders and offers.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-courier-600 hover:bg-courier-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
