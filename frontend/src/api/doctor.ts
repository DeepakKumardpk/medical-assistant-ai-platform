import { apiFetch } from "./client";
import type { ApprovalOut, PatientHistoryOut } from "./types";

export function listApprovals() {
  return apiFetch<ApprovalOut[]>("/doctor/approvals");
}

export function decideApproval(
  approvalId: string,
  decision: "approve" | "edit" | "reject",
  editedContent?: string
) {
  return apiFetch<ApprovalOut>(`/doctor/approvals/${approvalId}/decision`, {
    method: "POST",
    body: { decision, edited_content: editedContent },
  });
}

export function getPatientHistory(patientPublicId: string) {
  return apiFetch<PatientHistoryOut>(`/doctor/patients/${patientPublicId}/history`);
}

export function checkDrugInteractions(drugNames: string[]) {
  return apiFetch<{ summary: string }>("/doctor/tools/drug-interaction", {
    method: "POST",
    body: { drug_names: drugNames },
  });
}
