import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LogoutPage() {
  const supabase = supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
