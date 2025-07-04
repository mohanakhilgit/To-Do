import { useContext } from 'react';
import { AuthContext, type AppAuthContextType } from './AuthContext';

export const useAuth = (): AppAuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
