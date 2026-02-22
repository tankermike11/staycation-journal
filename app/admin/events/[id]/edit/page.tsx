"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, TextArea } from "@/components/ui";

type EventDTO = {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  summary: string | null;
  tags: string[] | null;
};

export default function EditEventPage({ params }: { params: { id: string } }) {
  const eventId = params.id;

  const [event, setEvent] = useState<EventDTO | null>(null);
  const [tagsText, setTagsText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setMsg(null);
    const resp = await fetch(`/api/admin/event?eventId=${encodeURIComponent(eventId)}`);
    const out = await resp.json();
    if (!resp.ok) {
      setMsg(out.error ?? "Failed to load event.");
      return;
    }
    setEvent(out.event);
    setTagsText((out.event.tags ?? []).join(", "));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;

    setBusy(true);
    setMsg(null);

    try {
      const resp = await fetch("/api/admin/update-event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId,
          title: event.title,
          start_date: event.start_date,
          end_date: event.end_date,
          summary: event.summary ?? "",
          tags: tagsText
        })
      });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Failed to save event.");
      setMsg("Event saved.");
    } catch (err: any) {
      setMsg(err?.message ?? "Save error.");
    } finally {
      setBusy(false);
      load();
    }
  }

  if (!event) return <p className="text-sm text-gray-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl grid gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Event</h1>
        <p className="mt-2 text-sm text-gray-600">Update title and dates. Days will be regenerated if the date range changes.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={save} className="grid gap-4">
          <div>
            <label className="text-sm font-semibold">Title</label>
            <Input value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Start date</label>
              <Input
                type="date"
                value={event.start_date}
                onChange={(e) => setEvent({ ...event, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">End date</label>
              <Input
                type="date"
                value={event.end_date}
                onChange={(e) => setEvent({ ...event, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Summary</label>
            <TextArea rows={3} value={event.summary ?? ""} onChange={(e) => setEvent({ ...event, summary: e.target.value })} />
          </div>

          <div>
            <label className="text-sm font-semibold">Tags (comma-separated)</label>
            <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Disney, Cruise, Food & Wine" />
          </div>

          {msg ? <p className="text-sm text-gray-600">{msg}</p> : null}

          <div className="flex gap-2">
            <Button disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
            <Button type="button" variant="secondary" onClick={() => (window.location.href = "/admin")}>
              Back
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}