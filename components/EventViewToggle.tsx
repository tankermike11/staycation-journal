"use client";

import { useEffect, useState } from "react";

type Mode = "cards" | "timeline";

export function EventViewToggle() {
  const key = "sj_view_mode";
  const [mode, setMode] = useState<Mode>("cards");

  useEffect(() => {
    const saved = (localStorage.getItem(key) as Mode | null) ?? "cards";
    setMode(saved);
    document.documentElement.dataset.view = saved;
  }, []);

  function set(m: Mode) {
    setMode(m);
    localStorage.setItem(key, m);
    document.documentElement.dataset.view = m;
  }

  return (
    <div className="sticky top-0 z-10 -mx-2 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-4xl flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-700">View</div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set("cards")}
            className={[
              "rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition",
              mode === "cards"
                ? "border-gray-300 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
            ].join(" ")}
          >
            Cards
          </button>

          <button
            type="button"
            onClick={() => set("timeline")}
            className={[
              "rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition",
              mode === "timeline"
                ? "border-gray-300 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
            ].join(" ")}
          >
            Timeline
          </button>
        </div>
      </div>
    </div>
  );
}