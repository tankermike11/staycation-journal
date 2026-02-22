"use client";

import { useEffect, useMemo, useState } from "react";

export function EventHeroParallax({
  heroImageId,
  title,
  subtitle
}: {
  heroImageId: string | null;
  title: string;
  subtitle: string;
}) {
  const [y, setY] = useState(0);

  useEffect(() => {
    const onScroll = () => setY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const translate = useMemo(() => Math.min(40, y * 0.15), [y]);

  return (
    <div className="relative h-[52vh] overflow-hidden rounded-3xl border border-gray-200 bg-gray-100">
      {heroImageId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/img/${heroImageId}?size=web`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `translateY(${translate}px)` }}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 pb-[calc(env(safe-area-inset-bottom)+24px)] text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-white/85">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}