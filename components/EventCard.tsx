import Link from "next/link";
import { Card } from "./ui";
import type { EventRow } from "@/lib/types";
import { formatDateUTC } from "@/lib/date";

function fmtRange(start: string, end: string) {
  const s = formatDateUTC(start);
  const e = formatDateUTC(end);
  return s === e ? s : `${s} → ${e}`;
}

export function EventCard({ event }: { event: EventRow }) {
  const hero = event.hero_image_id ? `/api/img/${event.hero_image_id}?size=thumb` : null;
  const dateLabel = fmtRange(event.start_date, event.end_date);

  return (
    <Link href={`/events/${event.id}`} className="tap-clear block">
      <Card className="group overflow-hidden card-soft-hover">
        <div className="aspect-[16/10] w-full bg-gray-100">
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              Add a hero image
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Title */}
          <div className="grid gap-2">
            <h3 className="text-base font-extrabold tracking-tight leading-snug break-words">
              {event.title}
            </h3>

            {/* LEFT-aligned pill */}
            <span className="inline-flex w-fit whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900 shadow-sm">
              {dateLabel}
            </span>
          </div>

          {event.summary ? (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {event.summary}
            </p>
          ) : null}

          {event.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {event.tags.slice(0, 4).map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}