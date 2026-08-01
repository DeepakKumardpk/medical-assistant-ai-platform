import { useRef, useState } from "react";
import { getJob, uploadDocument } from "../api/chats";

export function FileUploader({
  chatId,
  onDone,
}: {
  chatId: string;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (inputRef.current) inputRef.current.value = "";

    setStatus("uploading…");
    try {
      const job = await uploadDocument(chatId, file);
      setStatus("processing…");
      await pollJob(job.id);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "upload failed");
    }
  }

  async function pollJob(jobId: string) {
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));
      const job = await getJob(jobId);
      if (job.status === "done") {
        setStatus(null);
        onDone();
        return;
      }
      if (job.status === "failed") {
        setStatus(`extraction failed: ${job.error_message ?? "unknown error"}`);
        return;
      }
    }
    setStatus("still processing — check back in a moment");
  }

  return (
    <div className="file-uploader">
      <label className="file-uploader__button" title="Attach a file">
        📎
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          hidden
        />
      </label>
      {status && <span className="file-uploader__status">{status}</span>}
    </div>
  );
}
