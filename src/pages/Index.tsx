
import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';

const AppContent = () => {
  const { user } = useAuth();
  
  return user ? <Dashboard /> : <LoginForm />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
