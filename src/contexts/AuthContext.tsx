import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';

// Enhanced static users for pharmaceutical rejection log system
const staticUsers: User[] = [
  // Production Team (5 users)
  { id: '1', username: 'prod1', password: 'prod123', role: 'production', name: 'John Smith', department: 'Production Line A' },
  { id: '2', username: 'prod2', password: 'prod123', role: 'production', name: 'Jane Wilson', department: 'Production Line B' },
  { id: '3', username: 'prod3', password: 'prod123', role: 'production', name: 'Mike Johnson', department: 'Production Line C' },
  { id: '4', username: 'prod4', password: 'prod123', role: 'production', name: 'Sarah Davis', department: 'Production Line A' },
  { id: '5', username: 'prod5', password: 'prod123', role: 'production', name: 'Tom Brown', department: 'Production Line B' },
  
  // Stores Team (4 users)
  { id: '6', username: 'store1', password: 'store123', role: 'stores', name: 'Lisa Anderson', department: 'Stores & Inventory' },
  { id: '7', username: 'store2', password: 'store123', role: 'stores', name: 'David Miller', department: 'Stores & Inventory' },
  { id: '8', username: 'store3', password: 'store123', role: 'stores', name: 'Emma Taylor', department: 'Stores & Inventory' },
  { id: '9', username: 'store4', password: 'store123', role: 'stores', name: 'Chris Wilson', department: 'Stores & Inventory' },
  
  // QA Team (4 users)
  { id: '10', username: 'qa1', password: 'qa123', role: 'qa', name: 'Dr. Sarah QA Lead', department: 'Quality Assurance' },
  { id: '11', username: 'qa2', password: 'qa123', role: 'qa', name: 'Dr. David QA Senior', department: 'Quality Assurance' },
  { id: '12', username: 'qa3', password: 'qa123', role: 'qa', name: 'Maria QA Analyst', department: 'Quality Assurance' },
  { id: '13', username: 'qa4', password: 'qa123', role: 'qa', name: 'James QA Inspector', department: 'Quality Assurance' },
  
  // HOD/Plant Head (1 user)
  { id: '14', username: 'hod1', password: 'hod123', role: 'hod', name: 'Robert Plant Head', department: 'Management' },
  { id: '16', username: 'hod2', password: 'hod123', role: 'hod', name: 'Paul Plant Head', department: 'Management' },
  
  // Admin (1 user)
  { id: '15', username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator', department: 'IT' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = staticUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Check for stored user on component mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getStaticUsers = () => staticUsers;