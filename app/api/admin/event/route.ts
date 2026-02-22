import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "Missing eventId." }, { status: 400 });

  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, start_date, end_date, summary, tags")
    .eq("id", eventId)
    .single();

  if (error || !event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  return NextResponse.json({ event });
}