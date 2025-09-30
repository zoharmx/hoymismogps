// src/components/Auth/ProtectedRoute.tsx

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  // --- CAMBIO AQUÍ ---
  children: React.ReactNode; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se necesita un pequeño ajuste aquí para que funcione con ReactNode
  return <>{children}</>;
};

export default ProtectedRoute;