
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';

// Static users as per requirements
const staticUsers: User[] = [
  // Production Team
  { id: '1', username: 'prod1', password: 'prod123', role: 'production', name: 'John Production' },
  { id: '2', username: 'prod2', password: 'prod123', role: 'production', name: 'Jane Production' },
  
  // Stores Team
  { id: '3', username: 'store1', password: 'store123', role: 'stores', name: 'Mike Stores' },
  { id: '4', username: 'store2', password: 'store123', role: 'stores', name: 'Lisa Stores' },
  
  // QA Team
  { id: '5', username: 'qa1', password: 'qa123', role: 'qa', name: 'Sarah QA' },
  { id: '6', username: 'qa2', password: 'qa123', role: 'qa', name: 'David QA' },
  
  // HOD/Plant Head
  { id: '7', username: 'hod1', password: 'hod123', role: 'hod', name: 'Robert HOD' },
  
  // Admin
  { id: '8', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
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
