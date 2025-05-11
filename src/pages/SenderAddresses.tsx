
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { SenderAddress } from '@/types/models';
import { Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Phone number is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, { 
    message: "Please enter a valid 10-digit Indian mobile number." 
  }).optional(),
  mobile2: z.string().regex(/^[6-9]\d{9}$/, { 
    message: "Please enter a valid 10-digit Indian mobile number." 
  }).optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  address: z.object({
    addressLine1: z.string().min(5, { message: "Address must be at least 5 characters." }),
    addressLine2: z.string().optional().or(z.literal('')),
    landmark: z.string().optional().or(z.literal('')),
    city: z.string().min(2, { message: "City is required." }),
    district: z.string().optional().or(z.literal('')),
    state: z.string().min(2, { message: "State is required." }),
    pincode: z.string().regex(/^\d{6}$/, { message: "Please enter a valid 6-digit pincode." })
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to format address object to string for display
const formatAddressToString = (address: SenderAddress['address']): string => {
  return [
    address.addressLine1,
    address.addressLine2,
    address.landmark ? `Near ${address.landmark}` : '',
    `${address.city}, ${address.district ? address.district + ', ' : ''}${address.state}`,
    address.pincode
  ].filter(Boolean).join(', ');
};

const SenderAddresses = () => {
  const { user, logout } = useAuth();
  const { senderAddresses, addSenderAddress, updateSenderAddress, deleteSenderAddress } = useData();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SenderAddress | null>(null);

  // Initialize form with proper structure
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      mobile: '',
      mobile2: '',
      email: '',
      gstNumber: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      }
    },
  });

  const handleAddNew = () => {
    setEditingAddress(null);
    form.reset({
      name: '',
      phone: '',
      mobile: '',
      mobile2: '',
      email: '',
      gstNumber: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      }
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (address: SenderAddress) => {
    setEditingAddress(address);
    form.reset({
      name: address.name,
      phone: address.phone,
      mobile: address.mobile || '',
      mobile2: address.mobile2 || '',
      email: address.email || '',
      gstNumber: address.gstNumber || '',
      address: {
        addressLine1: address.address.addressLine1,
        addressLine2: address.address.addressLine2 || '',
        landmark: address.address.landmark || '',
        city: address.address.city,
        district: address.address.district || '',
        state: address.address.state,
        pincode: address.address.pincode
      }
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteSenderAddress(id);
    toast({
      title: 'Sender Address Deleted',
      description: 'The sender address has been removed.',
    });
  };

  const onSubmit = (values: FormValues) => {
    // Ensure required fields are always present
    const finalAddress: Omit<SenderAddress, 'id'> = {
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      mobile: values.mobile || undefined,
      mobile2: values.mobile2 || undefined,
      gstNumber: values.gstNumber || undefined,
      address: {
        addressLine1: values.address.addressLine1,
        addressLine2: values.address.addressLine2 || undefined,
        landmark: values.address.landmark || undefined,
        city: values.address.city,
        district: values.address.district || undefined,
        state: values.address.state,
        pincode: values.address.pincode
      }
    };

    if (editingAddress) {
      updateSenderAddress(editingAddress.id, finalAddress);
      toast({
        title: 'Sender Address Updated',
        description: 'The sender address has been updated successfully.',
      });
    } else {
      // Create new sender address with the new structure
      addSenderAddress(finalAddress);
      
      toast({
        title: 'Sender Address Added',
        description: 'New sender address has been added successfully.',
      });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <PageLayout title="Sender Addresses" userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Manage Sender Addresses</h2>
          <Button onClick={handleAddNew}>Add New Address</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sender Addresses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senderAddresses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No sender addresses found. Please add a new one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    senderAddresses.map((address) => (
                      <TableRow key={address.id}>
                        <TableCell className="font-medium">{address.name}</TableCell>
                        <TableCell>
                          {address.address ? 
                            formatAddressToString(address.address) : 
                            "No address information"}
                        </TableCell>
                        <TableCell>
                          {address.phone}
                          {address.mobile && <div className="text-xs">Mobile: {address.mobile}</div>}
                          {address.email && <div className="text-xs">Email: {address.email}</div>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => handleEdit(address)} size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleDelete(address.id)} 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              disabled={senderAddresses.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Sender Address' : 'Add New Sender Address'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name / Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Landline/Office" {...field} />
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
                        <FormLabel>Mobile (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit mobile" {...field} maxLength={10} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="mobile2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternate Mobile (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Alternate number" {...field} maxLength={10} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
              </div>

              {/* Address Section */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">Address Information</h3>

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

              <DialogFooter>
                <Button type="submit">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default SenderAddresses;
