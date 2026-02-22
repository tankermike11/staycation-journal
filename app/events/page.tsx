import { supabaseServer } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import { YearAccordion } from "@/components/YearAccordion";

function yearFromISODate(dateISO: string) {
  return Number(dateISO.slice(0, 4));
}

export default async function EventsHome() {
  const supabase = supabaseServer();

  const { data: events, error } = await supabase.from("events").select("*");

  if (error) {
    return <p className="text-sm text-red-600">Failed to load events: {error.message}</p>;
  }

  const rows = (events ?? []) as EventRow[];

  // Newest → oldest by start_date
  rows.sort((a, b) => {
    if (a.start_date === b.start_date) {
      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    }
    return b.start_date.localeCompare(a.start_date);
  });

  // Group by year
  const byYearMap = new Map<number, EventRow[]>();
  for (const e of rows) {
    const y = yearFromISODate(e.start_date);
    const arr = byYearMap.get(y) ?? [];
    arr.push(e);
    byYearMap.set(y, arr);
  }

  const years = Array.from(byYearMap.keys()).sort((a, b) => b - a);

  // Convert Map → plain object so it can be passed to client component safely
  const byYear: Record<number, EventRow[]> = {};
  for (const y of years) byYear[y] = byYearMap.get(y) ?? [];

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl border border-gray-200/70 bg-gradient-to-b from-gray-50 to-white p-8 shadow-soft">
        <h1 className="text-4xl font-extrabold tracking-tight">Events</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          A private highlight reel of staycations, trips, and cruises — organized by event → day → photos.
        </p>
      </div>

      <YearAccordion years={years} byYear={byYear} />
    </div>
  );
}