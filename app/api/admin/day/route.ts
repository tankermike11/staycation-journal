import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const url = new URL(req.url);
  const dayId = url.searchParams.get("dayId");
  if (!dayId) return NextResponse.json({ error: "Missing dayId." }, { status: 400 });

  const { data: day, error: dErr } = await supabase.from("days").select("*").eq("id", dayId).single();
  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 404 });

  const { data: images, error: iErr } = await supabase
    .from("images")
    .select("id, caption, sort_index")
    .eq("day_id", dayId)
    .order("sort_index", { ascending: true });

  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

  return NextResponse.json({ day, images });
}
