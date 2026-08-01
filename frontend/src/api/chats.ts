import { apiFetch } from "./client";
import type { ChatDetail, ChatSummary, JobStatusOut, MessageOut } from "./types";

export function createChat() {
  return apiFetch<ChatSummary>("/chats", { method: "POST" });
}

export function listChats() {
  return apiFetch<ChatSummary[]>("/chats");
}

export function getChat(chatId: string) {
  return apiFetch<ChatDetail>(`/chats/${chatId}`);
}

export function postMessage(chatId: string, content: string, language: string) {
  return apiFetch<MessageOut>(`/chats/${chatId}/messages`, {
    method: "POST",
    body: { content, language },
  });
}

export function uploadDocument(chatId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<JobStatusOut>(`/chats/${chatId}/uploads`, {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export function getJob(jobId: string) {
  return apiFetch<JobStatusOut>(`/jobs/${jobId}`);
}
