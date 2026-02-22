import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const imageId = String(body?.imageId ?? "");
  const caption = String(body?.caption ?? "").trim();

  if (!imageId) return NextResponse.json({ error: "Missing imageId." }, { status: 400 });

  const { error } = await supabase
    .from("images")
    .update({ caption: caption || null })
    .eq("id", imageId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}