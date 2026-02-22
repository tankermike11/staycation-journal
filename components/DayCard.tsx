"use client";

import { useState } from "react";
import type { DayRow, ImageRow } from "@/lib/types";
import { Card } from "./ui";
import { Lightbox } from "./Lightbox";
import { formatDateLongUTC } from "@/lib/date";


export function DayCard({ day, images }: { day: DayRow; images: ImageRow[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ImageRow | null>(null);

  function openImg(img: ImageRow) {
    setActive(img);
    setOpen(true);
  }

  const fullSrc = active ? `/api/img/${active.id}?size=web` : null;
  const downloadHref = active ? `/api/img/${active.id}?size=orig` : null;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-gray-500">{formatDateLongUTC(day.date)}</div>
          <h3 className="mt-1 text-lg font-extrabold tracking-tight">{day.title ?? "Day"}</h3>
        </div>
      </div>

      {(day.locations_text || day.notes) ? (
        <div className="mt-3 grid gap-2 text-sm text-gray-700">
          {day.locations_text ? (
            <div><span className="font-semibold">Locations:</span> {day.locations_text}</div>
          ) : null}
          {day.notes ? (
            <div className="text-gray-600">{day.notes}</div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img) => {
          const thumb = `/api/img/${img.id}?size=thumb`;
          return (
            <button
              key={img.id}
              type="button"
              className="group relative overflow-hidden rounded-xl bg-gray-100"
              onClick={() => openImg(img)}
              title={img.caption ?? "View photo"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt={img.caption ?? ""}
                className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                loading="lazy"
              />
              {img.caption ? (
                <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-2 py-1 text-left text-xs font-semibold text-white">
                  {img.caption}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <Lightbox open={open} src={fullSrc} downloadHref={downloadHref} onClose={() => setOpen(false)} />
    </Card>
  );
}
