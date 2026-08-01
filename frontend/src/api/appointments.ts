import { apiFetch } from "./client";
import type { AppointmentOut } from "./types";

export function requestAppointment(requested_time: string, reason: string) {
  return apiFetch<AppointmentOut>("/appointments", {
    method: "POST",
    body: { requested_time, reason },
  });
}

export function approveAppointment(id: string) {
  return apiFetch<AppointmentOut>(`/appointments/${id}/approve`, { method: "POST" });
}

export function rejectAppointment(id: string) {
  return apiFetch<AppointmentOut>(`/appointments/${id}/reject`, { method: "POST" });
}
