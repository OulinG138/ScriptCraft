"use client";
import { createContext, useState, ReactNode, useEffect } from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  avatarId: number;
  isAdmin: boolean;
};

type Auth = {
  user?: User;
  accessToken?: string;
};

type AuthData = {
  auth: Auth;
  setAuth: React.Dispatch<React.SetStateAction<Auth>>;
};

const AuthContext = createContext<AuthData>({
  auth: {},
  setAuth: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<Auth>(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      return {
        accessToken: storedToken || undefined,
        user: storedUser ? JSON.parse(storedUser) : undefined,
      };
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (auth.accessToken) {
        localStorage.setItem("accessToken", auth.accessToken);
      } else {
        localStorage.removeItem("accessToken");
      }

      if (auth.user) {
        localStorage.setItem("user", JSON.stringify(auth.user));
      } else {
        localStorage.removeItem("user");
      }
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
