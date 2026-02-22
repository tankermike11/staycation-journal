"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Lightbox } from "@/components/Lightbox";

type ImgRow = {
  id: string;
  caption: string | null;
  sort_index: number;
};

type DayCardProps = {
  title: string;
  subtitle?: string | null; // e.g. location
  notes?: string | null;
  images: ImgRow[];
};

export function DayCard({ title, subtitle, notes, images }: DayCardProps) {
  const router = useRouter();

  const sorted = useMemo(
    () => [...images].sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0)),
    [images]
  );

  const [open, setOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  return (
    <Card className="p-5 rounded-3xl">
      <div className="grid gap-2">
        <div className="text-lg font-extrabold tracking-tight">{title}</div>
        {subtitle ? <div className="text-xs font-semibold text-gray-500">{subtitle}</div> : null}
        {notes ? <div className="text-sm text-gray-600">{notes}</div> : null}
      </div>

      <div className="mt-4">
        {sorted.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100"
                onClick={() => {
                  setInitialIndex(i);
                  setOpen(true);
                }}
                aria-label="Open photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/img/${img.id}?size=thumb`}
                  alt={img.caption ?? ""}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No photos yet.</div>
        )}
      </div>

      <Lightbox
        open={open}
        initialIndex={initialIndex}
        images={sorted.map((x) => ({ id: x.id, caption: x.caption }))}
        onClose={() => setOpen(false)}
        onChanged={() => router.refresh()}
      />
    </Card>
  );
}