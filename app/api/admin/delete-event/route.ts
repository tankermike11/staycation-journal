import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteObject } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const eventId = String(body?.eventId ?? "");
  if (!eventId) return NextResponse.json({ error: "Missing eventId." }, { status: 400 });

  // Fetch all day IDs for the event
  const { data: days, error: dErr } = await supabase.from("days").select("id").eq("event_id", eventId);
  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });

  const dayIds = (days ?? []).map((d: any) => d.id);

  // Fetch all images for those days (plus event hero which has day_id null)
  const imagesToDelete: any[] = [];

  if (dayIds.length) {
    const { data: imgs, error: iErr } = await supabase
      .from("images")
      .select("id, storage_key_original, storage_key_web, storage_key_thumb")
      .in("day_id", dayIds);

    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });
    imagesToDelete.push(...(imgs ?? []));
  }

  // Also include hero image referenced on the event row
  const { data: event, error: eErr } = await supabase.from("events").select("hero_image_id").eq("id", eventId).single();
  if (eErr || !event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  if (event.hero_image_id) {
    const { data: hero, error: hErr } = await supabase
      .from("images")
      .select("id, storage_key_original, storage_key_web, storage_key_thumb")
      .eq("id", event.hero_image_id)
      .single();

    if (!hErr && hero) imagesToDelete.push(hero);
  }

  // Delete from R2
  for (const img of imagesToDelete) {
    try {
      await deleteObject(img.storage_key_original);
      await deleteObject(img.storage_key_web);
      await deleteObject(img.storage_key_thumb);
    } catch (e: any) {
      return NextResponse.json({ error: `Failed deleting from R2 for image ${img.id}: ${e?.message ?? e}` }, { status: 500 });
    }
  }

  // Delete DB rows: images first (hero + day images), then event (days cascade)
  if (imagesToDelete.length) {
    const ids = imagesToDelete.map((x) => x.id);
    const { error: delImgErr } = await supabase.from("images").delete().in("id", ids);
    if (delImgErr) return NextResponse.json({ error: delImgErr.message }, { status: 500 });
  }

  const { error: delEventErr } = await supabase.from("events").delete().eq("id", eventId);
  if (delEventErr) return NextResponse.json({ error: delEventErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}