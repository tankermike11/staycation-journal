"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

/**
 * Keep each upload comfortably under ~3MB.
 * (multipart/form-data adds overhead, so target slightly below 3MB)
 */
const TARGET_MAX_BYTES = 2_900_000;
const MAX_DIM = 2600;
const JPEG_QUALITY = 0.86;

// ---- client-side resize/compress helpers (to avoid 413 on Vercel) ----
async function fileToBitmap(file: File): Promise<ImageBitmap> {
  // Respect EXIF orientation when supported
  // @ts-ignore
  return await createImageBitmap(file, { imageOrientation: "from-image" });
}

function fitWithin(w: number, h: number, maxDim: number) {
  if (w <= maxDim && h <= maxDim) return { w, h };
  const scale = maxDim / Math.max(w, h);
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= TARGET_MAX_BYTES) return file;

  const bmp = await fileToBitmap(file);
  const { w, h } = fitWithin(bmp.width, bmp.height, MAX_DIM);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bmp, 0, 0, w, h);

  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", JPEG_QUALITY);
  });

  if (!(blob instanceof Blob)) return file;
  if (blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

async function readApiResponse(resp: Response) {
  const ct = resp.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return await resp.json();
  const text = await resp.text();
  return { error: text };
}

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
  const [stage, setStage] = useState<"" | "compressing" | "uploading">("");
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  async function doUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setBusy(true);
    setMsg(null);

    const list = Array.from(files);
    setTotal(list.length);
    setDone(0);

    let ok = 0;
    let failed = 0;

    try {
      // Upload one-by-one + compress large files to avoid 413
      for (const raw of list) {
        setStage("compressing");
        const f = await compressImageFile(raw);

        setStage("uploading");
        const fd = new FormData();
        fd.append("dayId", dayId);
        fd.append("files", f);

        const resp = await fetch("/api/upload", { method: "POST", body: fd });
        const out: any = await readApiResponse(resp);

        if (!resp.ok) {
          failed++;
          if (resp.status === 413) {
            setMsg(
              "A photo is still too large for upload. Try a different photo, or take a screenshot and upload the screenshot."
            );
          } else {
            setMsg(out?.error ?? "Upload failed.");
          }
          console.error("Upload failed:", resp.status, out?.error ?? out);
        } else {
          ok++;
        }

        setDone((n) => n + 1);
      }

      if (failed === 0) {
        setMsg(`Uploaded ${ok} photo(s).`);
      } else if (!msg) {
        setMsg(`Uploaded ${ok} photo(s). ${failed} failed (see console).`);
      }

      router.refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "Upload error.");
    } finally {
      setStage("");
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
        variant="secondary"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (stage === "compressing" ? "Compressing…" : "Uploading…") : "+ Add photos"}
      </Button>

      {busy ? (
        <div className="text-xs text-gray-600">
          {stage === "compressing" ? "Compressing…" : "Uploading…"} {done}/{total}
        </div>
      ) : null}

      {msg ? <div className="text-xs text-gray-600">{msg}</div> : null}
    </div>
  );
}