import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json();
  const { dayId, title, locations_text, notes } = body ?? {};
  if (!dayId) return NextResponse.json({ error: "Missing dayId." }, { status: 400 });

  const { error } = await supabase
    .from("days")
    .update({
      title: String(title ?? "").trim() || null,
      locations_text: String(locations_text ?? "").trim() || null,
      notes: String(notes ?? "").trim() || null
    })
    .eq("id", dayId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
