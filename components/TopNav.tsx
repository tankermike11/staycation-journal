"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui";

export default function TopNav() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setAuthed(!!data.session);
      setLoading(false);
    }

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuthed(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Optional: hide the nav while we determine auth state to avoid “flash”
  if (loading) return null;

  const linkClass = (href: string) =>
    `text-sm font-extrabold px-3 py-2 rounded-xl transition ${
      pathname?.startsWith(href)
        ? "bg-amber-100 text-amber-900"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="app-container">
        <div className="flex items-center justify-between py-3">
          <Link href={authed ? "/events" : "/login"} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-amber-200" />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">Staycation Journal</div>
              <div className="text-[11px] text-gray-600">Private highlights</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {authed ? (
              <>
                <Link href="/events" className={linkClass("/events")}>
                  Events
                </Link>
                <Link href="/admin" className={linkClass("/admin")}>
                  Admin
                </Link>
                <Button variant="secondary" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login" className={linkClass("/login")}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}