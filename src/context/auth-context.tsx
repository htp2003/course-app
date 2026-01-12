import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { loginAPI } from "../app/(auth)/login/services/api";
import {
  getToken,
  setToken,
  getUser,
  setUser as setUserStorage,
  clearAllAuth,
} from "../utils/token-storage";

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
    const token = getToken();
    const savedUserJson = getUser();

    if (token) {
      setIsAuthenticated(true);

      if (savedUserJson) {
        try {
          const userInfo = JSON.parse(savedUserJson);
          setUser(userInfo);
        } catch (error) {
          console.error("Lỗi khi parse user info:", error);
          clearAllAuth();
        }
      } else {
        fetchMe();
      }
    }

    setIsLoading(false);
  }, []);

  const login = (token: string, userInfo: TUserProfile) => {
    setToken(token);

    setUserStorage(JSON.stringify(userInfo));

    setIsAuthenticated(true);
    setUser(userInfo);
  };

  const logout = async () => {
    const token = getToken();

    try {
      if (token) {
        await loginAPI.logout(token);
      }
    } catch (error) {
      console.error("Lỗi logout API:", error);
    } finally {
      clearAllAuth();

      setIsAuthenticated(false);
      setUser(null);

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
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
