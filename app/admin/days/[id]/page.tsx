"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, TextArea } from "@/components/ui";
import { formatDateLongUTC } from "@/lib/date";

type DayDTO = {
  id: string;
  date: string;
  title: string | null;
  locations_text: string | null;
  notes: string | null;
};

type ImgDTO = {
  id: string;
  caption: string | null;
  sort_index: number;
};

export default function AdminDay({ params }: { params: { id: string } }) {
  const dayId = params.id;

  const [day, setDay] = useState<DayDTO | null>(null);
  const [images, setImages] = useState<ImgDTO[]>([]);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<FileList | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // upload progress state
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);

  async function refresh() {
    const resp = await fetch(`/api/admin/day?dayId=${encodeURIComponent(dayId)}`);
    const out = await resp.json();
    if (resp.ok) {
      setDay(out.day);
      setImages(out.images ?? []);

      const drafts: Record<string, string> = {};
      (out.images ?? []).forEach((img: ImgDTO) => {
        drafts[img.id] = img.caption ?? "";
      });
      setCaptionDrafts(drafts);
    } else {
      setMsg(out.error ?? "Failed to load day.");
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveDay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const resp = await fetch("/api/admin/update-day", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dayId,
          title: day?.title ?? "",
          locations_text: day?.locations_text ?? "",
          notes: day?.notes ?? ""
        })
      });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Failed to save.");
      setMsg("Day saved.");
      refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Error saving.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) return;

    // Upload one-by-one to avoid Vercel body size limits (413 on multi-file)
    setBusy(true);
    setUploading(true);
    setMsg(null);

    const list = Array.from(files);
    setUploadTotal(list.length);
    setUploadDone(0);

    let ok = 0;
    let failed = 0;

    try {
      for (const f of list) {
        const fd = new FormData();
        fd.append("dayId", dayId);
        fd.append("files", f);

        const resp = await fetch("/api/upload", { method: "POST", body: fd });

        // Don't assume JSON on error (could be text/HTML)
        const text = await resp.text();
        let out: any = null;
        try {
          out = JSON.parse(text);
        } catch {
          out = { error: text };
        }

        if (!resp.ok) {
          failed++;
          console.error("Upload failed:", out?.error ?? text);
        } else {
          ok++;
        }

        setUploadDone((n) => n + 1);
      }

      if (failed === 0) setMsg(`Uploaded ${ok} photo(s).`);
      else setMsg(`Uploaded ${ok} photo(s). ${failed} failed (see console).`);

      setFiles(null);
      // NOTE: we intentionally avoid using ref={...} on <Input />
      // because your custom Input component likely does not forwardRef.
      refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Upload error.");
    } finally {
      setUploading(false);
      setBusy(false);
    }
  }

  async function saveCaption(imageId: string) {
    setBusy(true);
    setMsg(null);
    try {
      const resp = await fetch("/api/admin/update-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageId, caption: captionDrafts[imageId] ?? "" })
      });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Failed to save caption.");
      setMsg("Caption saved.");
      refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Caption save error.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePhoto(imageId: string) {
    const ok = window.confirm("Delete this photo? This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    setMsg(null);
    try {
      const resp = await fetch("/api/admin/delete-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageId })
      });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Failed to delete photo.");
      setMsg("Photo deleted.");
      refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Delete error.");
    } finally {
      setBusy(false);
    }
  }

  async function move(imageId: string, direction: "up" | "down") {
    setBusy(true);
    try {
      const resp = await fetch("/api/admin/reorder-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageId, direction })
      });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Reorder failed.");
      refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Reorder error.");
    } finally {
      setBusy(false);
    }
  }

  if (!day) return <p className="text-sm text-gray-600">Loading…</p>;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Day</h1>
        <p className="mt-2 text-sm text-gray-600">{formatDateLongUTC(day.date)}</p>
      </div>

      <Card className="p-6">
        <form onSubmit={saveDay} className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Title</label>
            <Input value={day.title ?? ""} onChange={(e) => setDay({ ...day, title: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-semibold">Locations</label>
            <Input
              value={day.locations_text ?? ""}
              onChange={(e) => setDay({ ...day, locations_text: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Notes</label>
            <TextArea
              rows={3}
              value={day.notes ?? ""}
              onChange={(e) => setDay({ ...day, notes: e.target.value })}
            />
          </div>

          <Button disabled={busy}>{busy ? "Saving…" : "Save Day"}</Button>
        </form>
      </Card>

      <Card className="p-6">
        <form onSubmit={upload} className="grid gap-3">
          <div className="text-lg font-extrabold tracking-tight">Upload photos</div>

          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(e.target.files)}
          />

          {uploading ? (
            <div className="text-sm text-gray-600">
              Uploading {uploadDone}/{uploadTotal}…
            </div>
          ) : null}

          <Button disabled={busy || !files || files.length === 0}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>

          <p className="text-xs text-gray-500">Tip: uploads are sent one-at-a-time to avoid server limits.</p>
        </form>
      </Card>

      <Card className="p-6">
        <div className="text-lg font-extrabold tracking-tight">Reorder / Edit Photos</div>

        <div className="mt-4 grid gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="grid gap-3 rounded-xl border border-gray-200 p-3 sm:grid-cols-[auto,1fr,auto]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`/api/img/${img.id}?size=thumb`}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                />
                <div>
                  <div className="text-sm font-bold">#{img.sort_index}</div>
                </div>
              </div>

              <div className="grid gap-2">
                <Input
                  value={captionDrafts[img.id] ?? ""}
                  onChange={(e) =>
                    setCaptionDrafts({
                      ...captionDrafts,
                      [img.id]: e.target.value
                    })
                  }
                  placeholder="Optional caption"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" type="button" disabled={busy} onClick={() => saveCaption(img.id)}>
                    Save caption
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={busy}
                    onClick={() => deletePhoto(img.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={busy || idx === 0}
                  onClick={() => move(img.id, "up")}
                  type="button"
                >
                  Up
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy || idx === images.length - 1}
                  onClick={() => move(img.id, "down")}
                  type="button"
                >
                  Down
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}