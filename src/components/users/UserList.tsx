
import React from 'react';
import { User } from '@/types/models';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserListItem } from './UserListItem';

interface UserListProps {
  users: User[];
  currentUserId: string;
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  loading,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center">Loading user data...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <UserListItem
                      key={user.id}
                      user={user}
                      currentUserId={currentUserId}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserList;
