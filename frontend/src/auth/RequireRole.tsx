import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import type { Role } from "../api/types";

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { token, role: currentRole } = useAuth();

  if (!token) return <Navigate to={`/login/${role}`} replace />;
  if (currentRole !== role) return <Navigate to={`/login/${role}`} replace />;

  return <>{children}</>;
}
