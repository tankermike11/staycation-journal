import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getSession();
  redirect(data.session ? "/events" : "/login");
}