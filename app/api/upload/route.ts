import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { putObject } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const form = await req.formData();
  const dayId = String(form.get("dayId") ?? "");
  const files = form.getAll("files");

  if (!dayId || files.length === 0) return NextResponse.json({ error: "Missing dayId or files." }, { status: 400 });

  // Get current max sort_index for the day
  const { data: maxRow } = await supabase
    .from("images")
    .select("sort_index")
    .eq("day_id", dayId)
    .order("sort_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sort = (maxRow?.sort_index ?? 0) + 1;

  let count = 0;
  for (const f of files) {
    if (!(f instanceof File)) continue;

    const buf = Buffer.from(await f.arrayBuffer());
    const id = randomUUID();

    const origKey = `original/${id}.jpg`;
    const webKey = `web/${id}.jpg`;
    const thumbKey = `thumb/${id}.jpg`;

    // Create variants
    const origJpg = await sharp(buf).rotate().jpeg({ quality: 92 }).toBuffer();
    const webJpg = await sharp(buf).rotate().resize({ width: 1800, withoutEnlargement: true }).jpeg({ quality: 86 }).toBuffer();
    const thumbJpg = await sharp(buf).rotate().resize({ width: 600, withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer();

    await putObject(origKey, origJpg, "image/jpeg");
    await putObject(webKey, webJpg, "image/jpeg");
    await putObject(thumbKey, thumbJpg, "image/jpeg");

    const { error } = await supabase.from("images").insert({
      id,
      day_id: dayId,
      caption: null,
      sort_index: sort++,
      storage_key_original: origKey,
      storage_key_web: webKey,
      storage_key_thumb: thumbKey
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    count += 1;
  }

  return NextResponse.json({ ok: true, count });
}
