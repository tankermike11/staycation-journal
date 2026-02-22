import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getObjectStream } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { imageId: string } }) {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const url = new URL(req.url);
  const size = (url.searchParams.get("size") ?? "web") as "thumb" | "web" | "orig";

  const { data: img, error } = await supabase
    .from("images")
    .select("storage_key_original, storage_key_web, storage_key_thumb")
    .eq("id", params.imageId)
    .single();

  if (error || !img) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const key =
    size === "orig" ? img.storage_key_original : size === "thumb" ? img.storage_key_thumb : img.storage_key_web;

  const obj = await getObjectStream(key);
  const bodyStream = obj.Body as any;

  const headers = new Headers();
  headers.set("content-type", "image/jpeg");
  // Cache only in browser memory; keep conservative for private content.
  headers.set("cache-control", "private, max-age=0, must-revalidate");

  return new NextResponse(bodyStream, { headers });
}
