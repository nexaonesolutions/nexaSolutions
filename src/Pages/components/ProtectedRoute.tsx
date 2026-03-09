import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  adminOnly?: boolean;
  clientOnly?: boolean;
  allowGuest?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly, clientOnly, allowGuest }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nexa-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nexa-primary"></div>
      </div>
    );
  }

  // Se o usuário não está logado
  if (!user) {
    // Se a rota permite visitantes (ex: Home), mostra o conteúdo
    if (allowGuest) return children;
    // Caso contrário, exige login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário está logado e é admin tentando acessar área de cliente
  if (clientOnly && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Se é área restrita ao admin e o usuário não é admin
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;