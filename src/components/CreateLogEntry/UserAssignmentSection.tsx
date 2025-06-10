import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, getStaticUsers } from '@/contexts/AuthContext';

interface UserAssignmentSectionProps {
  assignedProductionUser: string;
  assignedStoresUser: string;
  onProductionUserChange: (userId: string) => void;
  onStoresUserChange: (userId: string) => void;
}

const UserAssignmentSection = ({
  assignedProductionUser,
  assignedStoresUser,
  onProductionUserChange,
  onStoresUserChange,
}: UserAssignmentSectionProps) => {
  const { user } = useAuth();
  const staticUsers = getStaticUsers();
  const productionUsers = staticUsers.filter(u => u.role === 'production');
  const storesUsers = staticUsers.filter(u => u.role === 'stores');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Team Assignment</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {user?.role === 'hod' && (
          <div className="space-y-2">
            <Label htmlFor="productionUser">Production Team User</Label>
            <Select value={assignedProductionUser} onValueChange={onProductionUserChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select production user" />
              </SelectTrigger>
              <SelectContent>
                {productionUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-gray-500">{user.department}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="storesUser">Stores Team User</Label>
          <Select value={assignedStoresUser} onValueChange={onStoresUserChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select stores user" />
            </SelectTrigger>
            <SelectContent>
              {storesUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-gray-500">{user.department}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default UserAssignmentSection;