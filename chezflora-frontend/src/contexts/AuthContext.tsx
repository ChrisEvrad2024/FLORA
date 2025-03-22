// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import authService from "@/services/auth.service";
import cartService from "@/services/cart.service";
import wishlistService from "@/services/wishlist.service";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthState = () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);

      // Sync local cart and wishlist with server
      await cartService.syncCart();
      await wishlistService.syncWishlist();

      toast.success("Connexion réussie", {
        description: "Bienvenue sur votre compte ChezFlora",
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Échec de la connexion", {
        description: "Vérifiez vos identifiants et réessayez",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);

      // Sync local cart and wishlist with server
      await cartService.syncCart();
      await wishlistService.syncWishlist();

      toast.success("Compte créé avec succès", {
        description: "Bienvenue sur ChezFlora !",
      });

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Échec de la création du compte", {
        description: "Veuillez réessayer ultérieurement",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Déconnexion réussie");
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// How to use:
/*
import { useAuth } from '@/contexts/AuthContext';

// In your component
const { user, isAuthenticated, login, logout } = useAuth();

// For protected routes
if (!isAuthenticated && !isLoading) {
  return <Navigate to="/auth/login" />;
}

// For login form
const handleLogin = async (data) => {
  const success = await login(data.email, data.password);
  if (success) {
    navigate('/');
  }
};
*/
