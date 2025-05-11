
import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole } from '@/types/models';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { syncUserPermissions, setUserRole } from '@/integrations/supabase/insertCouriers';
import UserForm from '@/components/users/UserForm';
import UserList from '@/components/users/UserList';
import { defaultPermissions } from '@/components/users/PermissionGroups';

const UserManagement = () => {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Load users from mock data initially, but in a real app this would fetch from Supabase
  useEffect(() => {
    // For demo purposes, we're using mock data
    // In a real app with Supabase auth, you would fetch users here
    setUsers([
      {
        id: '1',
        username: 'admin',
        email: 'admin@trackflow.com',
        role: 'admin',
        permissions: {
          viewCustomerDatabase: true,
          editCustomerDatabase: true,
          downloadReports: true,
          manageUsers: true,
          generateSlips: true,
          viewLogs: true,
          viewBoxWeights: true,
          editBoxWeights: true,
          editCompletedBoxWeights: true,
          cancelSlips: true,
          printSlips: true,
          reprintSlips: true,
          // New permissions
          deleteCustomers: true,
          viewReports: true,
          viewCouriers: true,
          editCouriers: true,
          viewSenders: true,
          editSenders: true,
          useExpressMode: true,
          manageExpressMode: true
        },
      },
      {
        id: '2',
        username: 'user',
        email: 'user@trackflow.com',
        role: 'user',
        permissions: {
          viewCustomerDatabase: true,
          editCustomerDatabase: false,
          downloadReports: false,
          manageUsers: false,
          generateSlips: true,
          viewLogs: false,
          viewBoxWeights: true,
          editBoxWeights: true,
          editCompletedBoxWeights: false,
          cancelSlips: false,
          printSlips: true,
          reprintSlips: false,
          // New permissions
          deleteCustomers: false,
          viewReports: true,
          viewCouriers: true,
          editCouriers: false,
          viewSenders: true,
          editSenders: false,
          useExpressMode: true,
          manageExpressMode: false
        },
      }
    ]);
    setLoading(false);
  }, []);

  const handleAddUser = async (data: { 
    username: string; 
    email: string; 
    role: UserRole;
    permissions: User['permissions'];
  }) => {
    // In a real app, this would create a Supabase auth user
    // and then set up their permissions

    const newUser: User = {
      id: Date.now().toString(),
      ...data,
    };
    
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    
    // This is where we would sync with Supabase in a real app:
    // await syncUserPermissions(newUser.id, newUser.permissions);
    // await setUserRole(newUser.id, newUser.role);
    
    toast({
      title: 'Success',
      description: 'User added successfully.',
    });
  };

  const handleEditUser = async (data: { 
    username: string; 
    email: string; 
    role: UserRole;
    permissions: User['permissions'];
  }) => {
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser ? { ...u, ...data } : u
        )
      );
      setEditingUser(null);
      setIsEditDialogOpen(false);
      
      // This is where we would sync with Supabase in a real app:
      // await syncUserPermissions(editingUser, data.permissions);
      // await setUserRole(editingUser, data.role);
      
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
    }
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      toast({
        title: 'Error',
        description: 'You cannot delete your own account.',
        variant: 'destructive',
      });
      return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id));
      
      // In a real app, you'd delete the user from Supabase Auth
      // and their related permissions/roles
      
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user.id);
    setIsEditDialogOpen(true);
  };

  return (
    <PageLayout title="User Management" userRole={currentUser?.role} onLogout={logout}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-courier-600 hover:bg-courier-700">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <UserForm 
                onSubmit={handleAddUser} 
                title="Add New User" 
                initialData={{ 
                  username: '', 
                  email: '', 
                  role: 'user' as UserRole,
                  permissions: { ...defaultPermissions }
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <UserList 
          users={users} 
          currentUserId={currentUser?.id || ''}
          loading={loading}
          onEdit={openEditDialog}
          onDelete={handleDeleteUser}
        />

        {/* Edit User Dialog */}
        {editingUser && (
          <Dialog 
            open={isEditDialogOpen && !!editingUser} 
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) setEditingUser(null);
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <UserForm
                onSubmit={handleEditUser}
                initialData={{
                  username: users.find(u => u.id === editingUser)?.username || '',
                  email: users.find(u => u.id === editingUser)?.email || '',
                  role: users.find(u => u.id === editingUser)?.role || 'user',
                  permissions: users.find(u => u.id === editingUser)?.permissions || { ...defaultPermissions }
                }}
                title="Edit User"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageLayout>
  );
};

export default UserManagement;
