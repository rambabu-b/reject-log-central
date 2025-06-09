
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {user?.role === 'hod' && (
        <div>
          <Label htmlFor="productionUser">Production Team User</Label>
          <Select value={assignedProductionUser} onValueChange={onProductionUserChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select production user" />
            </SelectTrigger>
            <SelectContent>
              {productionUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="storesUser">Stores Team User</Label>
        <Select value={assignedStoresUser} onValueChange={onStoresUserChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select stores user" />
          </SelectTrigger>
          <SelectContent>
            {storesUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UserAssignmentSection;
