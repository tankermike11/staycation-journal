import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, Button } from "@/components/ui";
import { formatDateLongUTC } from "@/lib/date";

export default async function AdminEvent({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) return <p className="text-sm text-red-600">Event not found.</p>;

  const { data: days } = await supabase
    .from("days")
    .select("*")
    .eq("event_id", params.id)
    .order("sort_index", { ascending: true });

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{event.title}</h1>
          <p className="mt-2 text-sm text-gray-600">Manage days and upload photos.</p>
        </div>
        <Link href={`/events/${event.id}`}>
          <Button variant="secondary">View Event</Button>
        </Link>
      </div>

      <div className="grid gap-3">
        {(days ?? []).map((d) => (
          <Card key={d.id} className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-extrabold">{formatDateLongUTC(d.date)}</div>
              <div className="text-xs text-gray-600">{d.title ?? "No title yet"}</div>
            </div>
            <Link href={`/admin/days/${d.id}`}>
              <Button>Manage Day</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}