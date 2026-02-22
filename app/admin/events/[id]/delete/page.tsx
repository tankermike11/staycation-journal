"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";

export default function DeleteEventPage({ params }: { params: { id: string } }) {
  const eventId = params.id;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function doDelete() {
    const ok = window.confirm("Delete this event? This will delete all days and photos for the event. This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    setMsg(null);
    try {
      const resp = await fetch("/api/admin/delete-event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId })
      });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error ?? "Failed to delete event.");
      window.location.href = "/admin";
    } catch (err: any) {
      setMsg(err?.message ?? "Delete error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl grid gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-red-600">Delete Event</h1>
        <p className="mt-2 text-sm text-gray-600">This action deletes the event, all days, and all images in R2.</p>
      </div>

      <Card className="p-6 grid gap-3">
        {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
        <div className="flex gap-2">
          <Button disabled={busy} onClick={doDelete} className="bg-red-600 hover:bg-red-700">
            {busy ? "Deleting…" : "Delete event"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => (window.location.href = "/admin")}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}