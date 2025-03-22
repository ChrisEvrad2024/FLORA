// src/components/guards/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Afficher un spinner de chargement pendant la vérification
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Chargement...</div>
    </div>;
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // Vérifier les rôles si nécessaire
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!roles.includes(user.role)) {
      // Rediriger vers la page d'accueil si l'utilisateur n'a pas le rôle requis
      return <Navigate to="/" replace />;
    }
  }

  // Si tout est OK, afficher le contenu protégé
  return <>{children}</>;
};

export default AuthGuard;