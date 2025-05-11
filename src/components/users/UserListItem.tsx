
import React from 'react';
import { User } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Edit, Trash } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';

interface UserListItemProps {
  user: User;
  currentUserId: string;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  currentUserId,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.username}</TableCell>
      <TableCell>{user.email || '-'}</TableCell>
      <TableCell className="capitalize">
        <div className="flex items-center gap-1">
          <UserCheck className="h-4 w-4 text-gray-500" />
          <span>{user.role}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {user.permissions.manageUsers && (
            <Badge variant="outline" className="text-xs">User Management</Badge>
          )}
          {user.permissions.editCustomerDatabase && (
            <Badge variant="outline" className="text-xs">Edit Customers</Badge>
          )}
          {user.permissions.viewLogs && (
            <Badge variant="outline" className="text-xs">View Logs</Badge>
          )}
          {user.permissions.generateSlips && (
            <Badge variant="outline" className="text-xs">Generate Slips</Badge>
          )}
          {Object.entries(user.permissions).filter(([_, value]) => value).length > 4 && (
            <Badge variant="outline" className="text-xs bg-gray-100">
              +{Object.entries(user.permissions).filter(([_, value]) => value).length - 4} more
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">
              Edit
            </span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(user.id)}
            disabled={user.id === currentUserId || user.id === '1'}
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
};

export default UserListItem;
