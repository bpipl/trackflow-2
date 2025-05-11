
import React, { useState } from 'react';
import { User, UserRole } from '@/types/models';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { permissionGroups, defaultPermissions } from './PermissionGroups';

interface UserFormProps {
  onSubmit: (data: { 
    username: string; 
    email: string; 
    role: UserRole;
    permissions: User['permissions'];
  }) => void;
  initialData: { 
    username: string; 
    email: string; 
    role: UserRole;
    permissions: User['permissions'];
  };
  title: string;
}

export const UserForm: React.FC<UserFormProps> = ({ 
  onSubmit, 
  initialData, 
  title 
}) => {
  const [formData, setFormData] = useState(initialData);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username) {
      toast({
        title: 'Error',
        description: 'Username is required.',
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (value: string) => {
    // Create all permissions set to true for admin
    let permissions = { ...formData.permissions };
    
    if (value === 'admin') {
      Object.keys(permissions).forEach(key => {
        permissions[key as keyof User['permissions']] = true;
      });
    }
    
    setFormData({ 
      ...formData, 
      role: value as UserRole,
      permissions
    });
  };

  const handlePermissionChange = (permission: keyof User['permissions'], checked: boolean) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: checked,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="username">Username*</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={handleRoleChange}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4 mt-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {formData.role === 'admin' && (
            <div className="bg-yellow-50 p-4 rounded-md mb-4 text-sm text-yellow-800">
              Admin users automatically have all permissions. Permission changes will have no effect.
            </div>
          )}
          
          <div className="space-y-6">
            {Object.entries(permissionGroups).map(([groupKey, group]) => (
              <div key={groupKey} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{group.title}</h4>
                  <Separator className="flex-1 mx-2" />
                </div>
                <div className="space-y-2 rounded-md border border-gray-200 p-4">
                  {group.permissions.map(({ key, label, new: isNew }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={key} className="cursor-pointer">
                          {label}
                        </Label>
                        {isNew && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">New</Badge>
                        )}
                      </div>
                      <Switch
                        id={key}
                        checked={formData.permissions[key as keyof User['permissions']] || false}
                        onCheckedChange={(checked) => handlePermissionChange(key as keyof User['permissions'], checked)}
                        disabled={formData.role === 'admin'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" className="bg-courier-600 hover:bg-courier-700">
          Save User
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
