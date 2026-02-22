import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseServer } from "@/lib/supabase/server";
import { putObject } from "@/lib/r2";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function parseTags(raw: string | null): string[] | null {
  if (!raw) return null;
  const t = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return t.length ? t : null;
}

/**
 * Generate inclusive list of day ISO strings (YYYY-MM-DD) from start to end.
 * Uses UTC math to avoid timezone "previous day" bugs.
 */
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

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const start_date = String(form.get("start_date") ?? "");
  const end_date = String(form.get("end_date") ?? "");
  const summary = String(form.get("summary") ?? "").trim() || null;
  const tags = parseTags(String(form.get("tags") ?? "").trim() || null);
  const hero = form.get("hero");

  if (!title || !start_date || !end_date || !(hero instanceof File)) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Create an image UUID that we'll store in `images` and reference as `events.hero_image_id`
  const heroImageId = randomUUID();
  const heroBuf = Buffer.from(await hero.arrayBuffer());

  // R2 keys
  const origKey = `original/${heroImageId}.jpg`;
  const webKey = `web/${heroImageId}.jpg`;
  const thumbKey = `thumb/${heroImageId}.jpg`;

  // Create variants (rotate handles iPhone orientation)
  const origJpg = await sharp(heroBuf).rotate().jpeg({ quality: 92 }).toBuffer();
  const webJpg = await sharp(heroBuf)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .jpeg({ quality: 86 })
    .toBuffer();
  const thumbJpg = await sharp(heroBuf)
    .rotate()
    .resize({ width: 600, withoutEnlargement: true })
    .jpeg({ quality: 78 })
    .toBuffer();

  // Upload to R2
  await putObject(origKey, origJpg, "image/jpeg");
  await putObject(webKey, webJpg, "image/jpeg");
  await putObject(thumbKey, thumbJpg, "image/jpeg");

  // Create the event
  const { data: event, error: evErr } = await supabase
    .from("events")
    .insert({
      title,
      start_date,
      end_date,
      summary,
      tags,
      hero_image_id: heroImageId
    })
    .select("id")
    .single();

  if (evErr || !event) {
    return NextResponse.json({ error: evErr?.message ?? "Failed to create event." }, { status: 500 });
  }

  // Insert hero image row (day_id is NULL; used purely as the event hero)
  const { error: imgErr } = await supabase.from("images").insert({
    id: heroImageId,
    day_id: null,
    caption: "Event hero",
    sort_index: 0,
    storage_key_original: origKey,
    storage_key_web: webKey,
    storage_key_thumb: thumbKey
  });

  if (imgErr) {
    return NextResponse.json({ error: imgErr.message }, { status: 500 });
  }

  const dayISOs = datesBetweenUTC(start_date, end_date);

  const days = dayISOs.map((iso, idx) => ({
    event_id: event.id,
    date: iso,
    title: null,
    locations_text: null,
    notes: null,
    sort_index: idx + 1
  }));

  const { error: dayErr } = await supabase.from("days").insert(days);
  if (dayErr) {
    return NextResponse.json({ error: dayErr.message }, { status: 500 });
  }

  return NextResponse.json({ eventId: event.id });
}