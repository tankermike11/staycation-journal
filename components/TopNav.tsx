"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    "text-sm font-semibold " + (pathname?.startsWith(href) ? "text-gray-900" : "text-gray-500 hover:text-gray-900");
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/events" className="text-sm font-extrabold tracking-tight">
          {process.env.NEXT_PUBLIC_APP_NAME ?? "Staycation Journal"}
        </Link>
        <nav className="flex items-center gap-4">
          <Link className={linkClass("/events")} href="/events">Events</Link>
          <Link className={linkClass("/admin")} href="/admin">Admin</Link>
          <Link className={linkClass("/logout")} href="/logout">Logout</Link>
        </nav>
      </div>
    </header>
  );
}
