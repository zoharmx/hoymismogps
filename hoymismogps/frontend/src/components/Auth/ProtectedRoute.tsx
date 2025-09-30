// ruta: hoymismogps/frontend/src/components/Auth/ProtectedRoute.tsx

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;