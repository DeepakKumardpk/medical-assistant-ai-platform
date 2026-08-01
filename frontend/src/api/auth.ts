import { apiFetch } from "./client";
import type { TokenResponse, UserProfile } from "./types";

export function loginRequest(email: string, password: string) {
  return apiFetch<TokenResponse>("/auth/login", { method: "POST", body: { email, password } });
}

export function registerPatient(email: string, password: string, full_name: string) {
  return apiFetch<TokenResponse>("/auth/register/patient", {
    method: "POST",
    body: { email, password, full_name },
  });
}

export function registerDoctor(
  email: string,
  password: string,
  full_name: string,
  specialty: string,
  license_number: string
) {
  return apiFetch<TokenResponse>("/auth/register/doctor", {
    method: "POST",
    body: { email, password, full_name, specialty, license_number },
  });
}

export function getMe() {
  return apiFetch<UserProfile>("/auth/me");
}
