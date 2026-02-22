import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteObject } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const imageId = String(body?.imageId ?? "");
  if (!imageId) return NextResponse.json({ error: "Missing imageId." }, { status: 400 });

  // Fetch keys first
  const { data: img, error: fetchErr } = await supabase
    .from("images")
    .select("storage_key_original, storage_key_web, storage_key_thumb")
    .eq("id", imageId)
    .single();

  if (fetchErr || !img) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  // Delete from DB first or last? Either is OK.
  // We'll delete R2 first, then DB. If R2 delete fails, we don't orphan DB.
  try {
    await deleteObject(img.storage_key_original);
    await deleteObject(img.storage_key_web);
    await deleteObject(img.storage_key_thumb);
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to delete from R2: ${e?.message ?? e}` }, { status: 500 });
  }

  const { error: delErr } = await supabase.from("images").delete().eq("id", imageId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}