export type Role = "patient" | "doctor";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: Role;
  public_id: string;
}

export interface UserProfile {
  public_id: string;
  email: string;
  full_name: string;
  role: Role;
  specialty?: string | null;
  license_number?: string | null;
}

export interface ChatSummary {
  id: string;
  title: string | null;
  updated_at: string;
}

export interface MessageOut {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  language: string;
  approval_status: "n/a" | "pending_review" | "approved" | "rejected";
  created_at: string;
}

export interface ChatDetail {
  id: string;
  title: string | null;
  messages: MessageOut[];
}

export interface JobStatusOut {
  id: string;
  status: "pending" | "processing" | "done" | "failed";
  error_message: string | null;
  result_message_id: string | null;
}

export interface ApprovalOut {
  id: string;
  message_id: string;
  message_content: string;
  patient_id: string;
  status: string;
  edited_content: string | null;
  created_at: string;
}

export interface PatientHistoryChat {
  id: string;
  title: string | null;
  messages: MessageOut[];
}

export interface PatientHistoryOut {
  patient_public_id: string;
  full_name: string;
  chats: PatientHistoryChat[];
}

export interface AppointmentOut {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  requested_time: string;
  reason: string | null;
  status: string;
}
