"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LightboxImg = {
  id: string;
  caption?: string | null;
};

export function Lightbox({
  images,
  initialIndex,
  open,
  onClose,
  onChanged
}: {
  images: LightboxImg[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void; // triggers router.refresh from parent
}) {
  const [idx, setIdx] = useState(initialIndex);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setIdx(initialIndex);
      setEditing(false);
    }
  }, [open, initialIndex]);

  const canPrev = idx > 0;
  const canNext = idx < images.length - 1;

  const prev = useCallback(() => setIdx((v) => (v > 0 ? v - 1 : v)), []);
  const next = useCallback(() => setIdx((v) => (v < images.length - 1 ? v + 1 : v)), []);

  const current = useMemo(() => images[idx], [images, idx]);

  useEffect(() => {
    setDraft(current?.caption ?? "");
  }, [current?.caption, current?.id]);

  // lock scroll behind modal
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // keyboard controls
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, prev, next]);

  async function saveCaption() {
    if (!current?.id) return;
    setSaving(true);
    try {
      const resp = await fetch("/api/admin/update-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageId: current.id, caption: draft })
      });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Failed to save caption.");

      setEditing(false);
      onChanged?.();
    } catch (e: any) {
      // keep it simple; could add toast later
      alert(e?.message ?? "Caption save error.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const downloadUrl = current?.id ? `/api/img/${current.id}?size=original` : "#";
  const webUrl = current?.id ? `/api/img/${current.id}?size=web` : "#";

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStartX.current = t.clientX;
        touchStartY.current = t.clientY;
      }}
      onTouchEnd={(e) => {
        const sx = touchStartX.current;
        const sy = touchStartY.current;
        if (sx == null || sy == null) return;

        const t = e.changedTouches[0];
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
          if (dx > 0) prev();
          else next();
        }
        touchStartX.current = null;
        touchStartY.current = null;
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 text-white">
        <div className="text-sm font-semibold">
          {idx + 1} of {images.length}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
            download
          >
            Download
          </a>
          <button
            className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      {/* image */}
      <div className="relative z-0 flex h-full w-full items-center justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+56px)]">
        <button
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/15 disabled:opacity-30"
          onClick={prev}
          disabled={!canPrev}
          aria-label="Previous"
        >
          ←
        </button>
        <button
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/15 disabled:opacity-30"
          onClick={next}
          disabled={!canNext}
          aria-label="Next"
        >
          →
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={webUrl}
          alt={current?.caption ?? ""}
          className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
          draggable={false}
        />

        {/* caption panel */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-8">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-t from-black/70 to-black/10 px-4 py-3 text-white backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              {!editing ? (
                <div className="text-sm whitespace-pre-wrap">
                  {current?.caption?.trim() ? current.caption : ""}
                </div>
              ) : (
                <textarea
                  className="min-h-[64px] w-full resize-none rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 outline-none ring-1 ring-white/20"
                  placeholder="Add a caption…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              )}

              {!editing ? (
                <button
                  className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              ) : (
                <div className="flex shrink-0 gap-2">
                  <button
                    className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                    onClick={() => {
                      setEditing(false);
                      setDraft(current?.caption ?? "");
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-full bg-white text-gray-900 px-3 py-2 text-sm font-extrabold hover:bg-white/90 disabled:opacity-60"
                    onClick={saveCaption}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}