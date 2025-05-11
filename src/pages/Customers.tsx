
import React, { useState, useRef } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash, Upload, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/types/models';
import Papa from 'papaparse';

// Create a component for the customer form with Indian address fields
const CustomerForm = ({ 
  onSubmit, 
  initialData = { 
    name: '', 
    email: '', 
    mobile: '', 
    address: {
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    }, 
    preferredCourier: '' 
  }, 
  couriers,
  title
}: { 
  onSubmit: (data: Omit<Customer, 'id'>) => void;
  initialData?: {
    name: string;
    email?: string;
    mobile: string;
    address: {
      addressLine1: string;
      addressLine2?: string;
      landmark?: string;
      city: string;
      district?: string;
      state: string;
      pincode: string;
    };
    preferredCourier?: string;
  };
  couriers: { id: string; name: string }[];
  title: string;
}) => {
  const [formData, setFormData] = useState(initialData);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobile || !formData.address.addressLine1 || 
        !formData.address.city || !formData.address.state || !formData.address.pincode) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({ 
        ...formData, 
        address: { 
          ...formData.address, 
          [addressField]: value 
        } 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, preferredCourier: value });
  };

  const handleStateChange = (value: string) => {
    setFormData({ 
      ...formData, 
      address: { 
        ...formData.address, 
        state: value 
      } 
    });
  };

  // List of Indian states
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Customer Name*
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
            Mobile Number*
          </label>
          <Input
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
            required
          />
        </div>
        
        {/* Indian Address Fields */}
        <div className="border p-4 rounded-md">
          <h3 className="text-md font-medium mb-2">Address Details</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="address.addressLine1" className="block text-sm font-medium text-gray-700">
                Address Line 1*
              </label>
              <Input
                id="address.addressLine1"
                name="address.addressLine1"
                value={formData.address.addressLine1}
                onChange={handleChange}
                placeholder="House/Flat No., Building Name, Street"
                required
              />
            </div>
            <div>
              <label htmlFor="address.addressLine2" className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <Input
                id="address.addressLine2"
                name="address.addressLine2"
                value={formData.address.addressLine2 || ''}
                onChange={handleChange}
                placeholder="Area, Colony, Sector"
              />
            </div>
            <div>
              <label htmlFor="address.landmark" className="block text-sm font-medium text-gray-700">
                Landmark
              </label>
              <Input
                id="address.landmark"
                name="address.landmark"
                value={formData.address.landmark || ''}
                onChange={handleChange}
                placeholder="Near Railway Station, Temple, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                  City/Town/Village*
                </label>
                <Input
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </div>
              <div>
                <label htmlFor="address.district" className="block text-sm font-medium text-gray-700">
                  District
                </label>
                <Input
                  id="address.district"
                  name="address.district"
                  value={formData.address.district || ''}
                  onChange={handleChange}
                  placeholder="Enter district"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State*
                </label>
                <Select 
                  value={formData.address.state} 
                  onValueChange={handleStateChange}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">
                  PIN Code*
                </label>
                <Input
                  id="address.pincode"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  title="6-digit PIN code"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="preferredCourier" className="block text-sm font-medium text-gray-700">
            Preferred Courier
          </label>
          <Select 
            value={formData.preferredCourier || ''} 
            onValueChange={handleSelectChange}
          >
            <SelectTrigger id="preferredCourier">
              <SelectValue placeholder="Select a courier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {couriers.map((courier) => (
                <SelectItem key={courier.id} value={courier.id}>
                  {courier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" className="bg-courier-600 hover:bg-courier-700">
          Save Customer
        </Button>
      </div>
    </form>
  );
};

// CSV Import Component
const CSVImport = ({ onImport, couriers }: { onImport: (customers: Omit<Customer, 'id'>[]) => void, couriers: { id: string; name: string }[] }) => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const importedCustomers = results.data.map((row: any) => {
            // Find courier by name if provided
            let preferredCourierId = '';
            if (row.preferredCourier) {
              const courier = couriers.find(c => c.name.toLowerCase() === row.preferredCourier.toLowerCase());
              if (courier) {
                preferredCourierId = courier.id;
              }
            }

            return {
              name: row.name || '',
              email: row.email || '',
              mobile: row.mobile || '',
              address: {
                addressLine1: row.addressLine1 || '',
                addressLine2: row.addressLine2 || '',
                landmark: row.landmark || '',
                city: row.city || '',
                district: row.district || '',
                state: row.state || '',
                pincode: row.pincode || ''
              },
              preferredCourier: preferredCourierId
            };
          }).filter((customer: Omit<Customer, 'id'>) => 
            customer.name && 
            customer.mobile && 
            customer.address.addressLine1 && 
            customer.address.city && 
            customer.address.state && 
            customer.address.pincode
          );
          
          onImport(importedCustomers);
          toast({
            title: 'Import Successful',
            description: `Imported ${importedCustomers.length} customers.`,
          });
          
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          toast({
            title: 'Import Failed',
            description: 'Failed to parse the CSV file. Please check the format.',
            variant: 'destructive',
          });
        } finally {
          setIsImporting(false);
        }
      },
      error: () => {
        toast({
          title: 'Import Failed',
          description: 'Failed to parse the CSV file. Please check the format.',
          variant: 'destructive',
        });
        setIsImporting(false);
      }
    });
  };

  const downloadTemplate = () => {
    // Create CSV template string
    const headers = "name,email,mobile,addressLine1,addressLine2,landmark,city,district,state,pincode,preferredCourier";
    const exampleRow = "John Doe,john@example.com,9876543210,123 Main St,Apartment 4B,Near Central Park,Mumbai,,Maharashtra,400001,SpeedyShip";
    const csvContent = `${headers}\n${exampleRow}`;
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'customer_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700">
          Import Customers from CSV
        </label>
        <Input 
          id="csvFile" 
          ref={fileInputRef} 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          disabled={isImporting}
        />
      </div>
      <div className="text-sm text-gray-500">
        Upload a CSV file with customer data. The file should contain columns for name, email, mobile, 
        and address fields (addressLine1, city, state, pincode).
      </div>
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={downloadTemplate}
          className="text-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
        
        <div className="text-sm text-gray-500">
          {isImporting ? 'Importing...' : ''}
        </div>
      </div>
    </div>
  );
};

const Customers = () => {
  const { user, logout } = useAuth();
  const { customers, addCustomer, updateCustomer, deleteCustomer, couriers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.address.addressLine1 + ' ' + 
       (customer.address.addressLine2 || '') + ' ' + 
       customer.address.city + ' ' + 
       customer.address.state + ' ' + 
       customer.address.pincode).toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.includes(searchTerm)
  );

  const handleAddCustomer = (data: Omit<Customer, 'id'>) => {
    addCustomer(data);
    setIsAddDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Customer added successfully.',
    });
  };

  const handleEditCustomer = (data: Omit<Customer, 'id'>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer, data);
      setEditingCustomer(null);
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Customer updated successfully.',
      });
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
      toast({
        title: 'Success',
        description: 'Customer deleted successfully.',
      });
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer.id);
    setIsEditDialogOpen(true);
  };

  const handleImportCustomers = (importedCustomers: Omit<Customer, 'id'>[]) => {
    importedCustomers.forEach(customer => {
      addCustomer(customer);
    });
    setIsImportDialogOpen(false);
  };

  const formatAddress = (address: Customer['address']) => {
    return [
      address.addressLine1,
      address.addressLine2,
      address.landmark ? `Near ${address.landmark}` : '',
      `${address.city}, ${address.district ? address.district + ',' : ''} ${address.state}`,
      address.pincode
    ].filter(Boolean).join(', ');
  };

  return (
    <PageLayout title="Customer Management" userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Import Customers</DialogTitle>
                </DialogHeader>
                <CSVImport 
                  onImport={handleImportCustomers}
                  couriers={couriers}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-courier-600 hover:bg-courier-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <CustomerForm 
                  onSubmit={handleAddCustomer} 
                  couriers={couriers}
                  title="Add New Customer"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Address</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Preferred Courier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const preferredCourier = couriers.find(
                        (c) => c.id === customer.preferredCourier
                      );
                      
                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatAddress(customer.address)}
                          </TableCell>
                          <TableCell>{customer.mobile}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {customer.email || '-'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {preferredCourier?.name || 'None'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Dialog open={isEditDialogOpen && editingCustomer === customer.id} onOpenChange={setIsEditDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(customer)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only md:not-sr-only md:ml-2">
                                      Edit
                                    </span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <CustomerForm
                                    onSubmit={handleEditCustomer}
                                    initialData={{
                                      name: customer.name,
                                      email: customer.email,
                                      mobile: customer.mobile,
                                      address: customer.address,
                                      preferredCourier: customer.preferredCourier || '',
                                    }}
                                    couriers={couriers}
                                    title="Edit Customer"
                                  />
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCustomer(customer.id)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">
                                  Delete
                                </span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Customers;
