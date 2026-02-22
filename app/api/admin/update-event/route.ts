import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function parseTags(raw: string): string[] | null {
  const t = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return t.length ? t : null;
}

function datesBetweenUTC(startISO: string, endISO: string): string[] {
  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${endISO}T00:00:00Z`);

  const out: string[] = [];
  const cur = new Date(start);

  while (cur.getTime() <= end.getTime()) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const eventId = String(body?.eventId ?? "");
  const title = String(body?.title ?? "").trim();
  const start_date = String(body?.start_date ?? "");
  const end_date = String(body?.end_date ?? "");
  const summary = String(body?.summary ?? "").trim() || null;
  const tags = parseTags(String(body?.tags ?? ""));

  if (!eventId || !title || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data: existing, error: exErr } = await supabase
    .from("events")
    .select("start_date, end_date")
    .eq("id", eventId)
    .single();

  if (exErr || !existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const rangeChanged = existing.start_date !== start_date || existing.end_date !== end_date;

  const { error: upErr } = await supabase
    .from("events")
    .update({ title, start_date, end_date, summary, tags })
    .eq("id", eventId);

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  if (rangeChanged) {
    // Regenerate days:
    // - delete existing days (cascades images for those days, but DOES NOT delete R2 objects)
    // We avoid orphaned R2 by only regenerating days if you haven’t uploaded photos yet,
    // or you accept that changing date ranges after uploading requires manual cleanup.
    //
    // V1 behavior: block if there are any images attached to this event’s days.
    const { data: dayIds } = await supabase.from("days").select("id").eq("event_id", eventId);

    const ids = (dayIds ?? []).map((d: any) => d.id);
    if (ids.length) {
      const { count } = await supabase
        .from("images")
        .select("id", { count: "exact", head: true })
        .in("day_id", ids);

      if ((count ?? 0) > 0) {
        return NextResponse.json({
          error:
            "Date range change blocked: this event already has uploaded photos. Delete photos first (or delete/recreate the event)."
        }, { status: 400 });
      }
    }

    const { error: delDaysErr } = await supabase.from("days").delete().eq("event_id", eventId);
    if (delDaysErr) return NextResponse.json({ error: delDaysErr.message }, { status: 500 });

    const dayISOs = datesBetweenUTC(start_date, end_date);
    const days = dayISOs.map((iso, idx) => ({
      event_id: eventId,
      date: iso,
      title: null,
      locations_text: null,
      notes: null,
      sort_index: idx + 1
    }));

    const { error: insErr } = await supabase.from("days").insert(days);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}