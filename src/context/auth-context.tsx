import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { loginAPI } from "../app/(auth)/login/services/api";

export interface TUserProfile {
  id: string | number;
  username: string;
  fullName: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: TUserProfile | null;
  login: (token: string, user: TUserProfile) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<TUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async () => {
    try {
    } catch (error) {
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user_info");

    if (token) {
      setIsAuthenticated(true);

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        fetchMe();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userInfo: TUserProfile) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_info", JSON.stringify(userInfo));

    setIsAuthenticated(true);
    setUser(userInfo);
  };

  const logout = async () => {
    const token = localStorage.getItem("access_token");

    try {
      if (token) {
        await loginAPI.logout(token);
      }
    } catch (error) {
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");

      setIsAuthenticated(false);
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
