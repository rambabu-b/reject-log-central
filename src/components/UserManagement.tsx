
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStaticUsers } from '@/contexts/AuthContext';

const UserManagement = () => {
  const users = getStaticUsers();

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      production: { variant: 'default' as const, label: 'Production' },
      stores: { variant: 'secondary' as const, label: 'Stores' },
      qa: { variant: 'outline' as const, label: 'QA' },
      hod: { variant: 'destructive' as const, label: 'HOD' },
      admin: { variant: 'default' as const, label: 'Admin' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.production;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Password</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="font-mono text-sm">{user.password}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
