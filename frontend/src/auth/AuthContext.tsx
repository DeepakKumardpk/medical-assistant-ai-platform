import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "../api/types";

interface AuthState {
  token: string | null;
  role: Role | null;
  publicId: string | null;
  fullName: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, role: Role, publicId: string, fullName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readInitialState(): AuthState {
  return {
    token: sessionStorage.getItem("access_token"),
    role: (sessionStorage.getItem("role") as Role | null) ?? null,
    publicId: sessionStorage.getItem("public_id"),
    fullName: sessionStorage.getItem("full_name"),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readInitialState);

  function login(token: string, role: Role, publicId: string, fullName: string) {
    sessionStorage.setItem("access_token", token);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("public_id", publicId);
    sessionStorage.setItem("full_name", fullName);
    setState({ token, role, publicId, fullName });
  }

  function logout() {
    sessionStorage.clear();
    setState({ token: null, role: null, publicId: null, fullName: null });
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
