"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function InlineDayUploader({
  dayId,
  compact
}: {
  dayId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function doUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setBusy(true);
    setMsg(null);

    try {
      const fd = new FormData();
      fd.append("dayId", dayId);
      Array.from(files).forEach((f) => fd.append("files", f));

      const resp = await fetch("/api/upload", { method: "POST", body: fd });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Upload failed.");

      setMsg(`Uploaded ${out.count ?? files.length} photo(s).`);
      router.refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "Upload error.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => doUpload(e.target.files)}
      />

      <Button
        type="button"
        variant={compact ? "secondary" : "secondary"}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading…" : "+ Add photos"}
      </Button>

      {msg ? <div className="text-xs text-gray-600">{msg}</div> : null}
    </div>
  );
}