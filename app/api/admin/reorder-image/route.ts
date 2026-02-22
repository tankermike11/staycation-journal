import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { imageId, direction } = await req.json();
  if (!imageId || (direction !== "up" && direction !== "down")) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { data: img, error: iErr } = await supabase.from("images").select("id, day_id, sort_index").eq("id", imageId).single();
  if (iErr || !img) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  const { data: siblings, error: sErr } = await supabase
    .from("images")
    .select("id, sort_index")
    .eq("day_id", img.day_id)
    .order("sort_index", { ascending: true });

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const idx = siblings.findIndex((x: any) => x.id === img.id);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return NextResponse.json({ ok: true });

  const a = siblings[idx];
  const b = siblings[swapWith];

  const { error: uErr1 } = await supabase.from("images").update({ sort_index: b.sort_index }).eq("id", a.id);
  const { error: uErr2 } = await supabase.from("images").update({ sort_index: a.sort_index }).eq("id", b.id);

  if (uErr1 || uErr2) return NextResponse.json({ error: (uErr1 ?? uErr2)!.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
