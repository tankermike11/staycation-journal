import React from "react";

function detectBadges(text: string): string[] {
  const t = text.toLowerCase();

  const out: string[] = [];

  const rules: Array<[RegExp, string]> = [
    [/epcot|food\s*&\s*wine/, "EPCOT"],
    [/magic\s*kingdom|\bmk\b/, "MAGIC KINGDOM"],
    [/hollywood\s*studios|\bdhs\b/, "HOLLYWOOD STUDIOS"],
    [/animal\s*kingdom|\bdak\b/, "ANIMAL KINGDOM"],
    [/disney\s*springs/, "DISNEY SPRINGS"],
    [/universal|islands of adventure|ioa|volcano bay/, "UNIVERSAL"],
    [/cruise|castaway cay|disney cruise|dcl/, "CRUISE"],
    [/london/, "LONDON"],
    [/san\s*francisco|\bsf\b/, "SAN FRANCISCO"],
    [/caribbean|bahamas|cozumel|nassau|st\.?\s*thomas|jamaica/, "CARIBBEAN"]
  ];

  for (const [re, label] of rules) {
    if (re.test(t) && !out.includes(label)) out.push(label);
  }

  return out.slice(0, 3);
}

export function DayBadges({
  title,
  locations
}: {
  title?: string | null;
  locations?: string | null;
}) {
  const text = `${title ?? ""} ${locations ?? ""}`.trim();
  if (!text) return null;

  const badges = detectBadges(text);
  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b}
          className="rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-[11px] font-extrabold tracking-wide text-gray-800 shadow-sm"
        >
          {b}
        </span>
      ))}
    </div>
  );
}