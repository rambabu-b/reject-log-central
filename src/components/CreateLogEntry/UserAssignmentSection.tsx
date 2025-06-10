
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
        {/* HOD can assign production user, Production users auto-assigned to themselves */}
        {user?.role === 'hod' && (
          <div className="space-y-2">
            <Label htmlFor="productionUser">Select Production Team User</Label>
            <p className="text-sm text-gray-600">Who will fill the production details</p>
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

        {/* Both HOD and Production users can assign stores user */}
        {(user?.role === 'hod' || user?.role === 'production') && (
          <div className="space-y-2">
            <Label htmlFor="storesUser">Select Stores Team User</Label>
            <p className="text-sm text-gray-600">Who will fill the stores details after production sign-off</p>
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
        )}
      </div>
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          📋 <strong>Workflow:</strong> Once created, the log entry will be visible to the assigned production team member, stores team members, and all QA team members. After production sign-off, stores team members will be notified to fill their details.
        </p>
      </div>
    </div>
  );
};

export default UserAssignmentSection;
