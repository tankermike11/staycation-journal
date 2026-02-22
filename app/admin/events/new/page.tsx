"use client";

import { useState } from "react";
import { Button, Card, Input, TextArea } from "@/components/ui";

export default function NewEventPage() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      if (!heroFile) throw new Error("Please choose a hero image (thumbnail) for the event.");
      const fd = new FormData();
      fd.append("title", title);
      fd.append("start_date", startDate);
      fd.append("end_date", endDate);
      fd.append("summary", summary);
      fd.append("tags", tags);
      fd.append("hero", heroFile);

      const resp = await fetch("/api/admin/create-event", { method: "POST", body: fd });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Failed to create event.");

      window.location.href = `/admin/events/${out.eventId}`;
    } catch (err: any) {
      setMsg(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Create Event</h1>
      <p className="mt-2 text-sm text-gray-600">
        Events are the top-level “trip / staycation / cruise” units. Days are auto-created from the date range.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Start date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-semibold">End date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Summary (optional)</label>
            <TextArea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
          </div>

          <div>
            <label className="text-sm font-semibold">Tags (comma-separated, optional)</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Disney, Cruise, Food & Wine" />
          </div>

          <div>
            <label className="text-sm font-semibold">Hero image (required)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
              required
            />
            <p className="mt-1 text-xs text-gray-500">Used as the thumbnail on the Events home page.</p>
          </div>

          {msg ? <p className="text-sm text-red-600">{msg}</p> : null}

          <Button disabled={busy}>{busy ? "Creating…" : "Create Event"}</Button>
        </form>
      </Card>
    </div>
  );
}
