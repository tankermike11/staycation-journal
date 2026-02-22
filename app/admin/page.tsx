import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, Button } from "@/components/ui";
import { formatDateUTC } from "@/lib/date";

export default async function AdminHome() {
  const supabase = supabaseServer();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Failed to load events: {error.message}</p>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-gray-600">Create, edit, and delete events.</p>
        </div>
        <Link href="/admin/events/new">
          <Button>Create Event</Button>
        </Link>
      </div>

      <div className="grid gap-3">
        {(events ?? []).map((e) => (
          <Card key={e.id} className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-extrabold">{e.title}</div>
              <div className="text-xs text-gray-600">
                {formatDateUTC(e.start_date)} → {formatDateUTC(e.end_date)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/events/${e.id}`}>
                <Button variant="secondary">Manage</Button>
              </Link>
              <Link href={`/admin/events/${e.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Link href={`/admin/events/${e.id}/delete`}>
                <Button variant="ghost" className="text-red-600 hover:bg-red-50">
                  Delete
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}