"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbox } from "@/components/Lightbox";

type Img = { id: string; caption: string | null; sort_index: number };

export function PhotoGrid({ images }: { images: Img[] }) {
  const router = useRouter();

  const sorted = useMemo(
    () => [...images].sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0)),
    [images]
  );

  const [open, setOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  return (
    <>
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

      <Lightbox
        open={open}
        initialIndex={initialIndex}
        images={sorted.map((x) => ({ id: x.id, caption: x.caption }))}
        onClose={() => setOpen(false)}
        onChanged={() => router.refresh()}
      />
    </>
  );
}