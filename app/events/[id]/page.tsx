import { supabaseServer } from "@/lib/supabase/server";
import { formatDateUTC, formatDateLongUTC } from "@/lib/date";
import { EventHeroParallax } from "@/components/EventHeroParallax";
import { PhotoGrid } from "@/components/PhotoGrid";
import { EventViewToggle } from "@/components/EventViewToggle";
import { Card } from "@/components/ui";
import { InlineDayUploader } from "@/components/InlineDayUploader";
import { DayBadges } from "@/components/DayBadges";


type DayRow = {
  id: string;
  date: string;
  title: string | null;
  locations_text: string | null;
  notes: string | null;
  sort_index: number;
};

type ImgRow = {
  id: string;
  day_id: string | null;
  caption: string | null;
  sort_index: number;
};

function groupImagesByDay(images: ImgRow[]) {
  const map = new Map<string, ImgRow[]>();
  for (const img of images) {
    if (!img.day_id) continue;
    const arr = map.get(img.day_id) ?? [];
    arr.push(img);
    map.set(img.day_id, arr);
  }
  return map;
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const eventId = params.id;

  const { data: event, error: eErr } = await supabase
    .from("events")
    .select("id, title, start_date, end_date, summary, hero_image_id")
    .eq("id", eventId)
    .single();

  if (eErr || !event) {
    return <p className="text-sm text-red-600">Event not found.</p>;
  }

  const { data: days } = await supabase
    .from("days")
    .select("id, date, title, locations_text, notes, sort_index")
    .eq("event_id", eventId)
    .order("sort_index", { ascending: true });

  const dayIds = (days ?? []).map((d: any) => d.id);

  let images: ImgRow[] = [];
  if (dayIds.length) {
    const { data: imgs } = await supabase
      .from("images")
      .select("id, day_id, caption, sort_index")
      .in("day_id", dayIds);
    images = (imgs ?? []) as any;
  }

  const byDay = groupImagesByDay(images);

  const subtitle =
    event.start_date === event.end_date
      ? formatDateUTC(event.start_date)
      : `${formatDateUTC(event.start_date)} → ${formatDateUTC(event.end_date)}`;

  return (
    <div className="grid gap-6">
      <EventHeroParallax heroImageId={event.hero_image_id} title={event.title} subtitle={subtitle} />

      <EventViewToggle />

      <CardsView days={(days ?? []) as any} byDay={byDay} />
      <TimelineView days={(days ?? []) as any} byDay={byDay} />
    </div>
  );
}

function CardsView({ days, byDay }: { days: DayRow[]; byDay: Map<string, ImgRow[]> }) {
  return (
    <div className="grid gap-5 [html[data-view='timeline']_&]:hidden">
      {days.map((d) => {
        const imgs = byDay.get(d.id) ?? [];
        return (
          <Card key={d.id} className="p-5 rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-lg font-extrabold tracking-tight">{formatDateLongUTC(d.date)}</div>

                <div className="mt-2">
                  <DayBadges title={d.title} locations={d.locations_text} />
                </div>

                {d.locations_text ? (
                  <div className="mt-2 text-xs font-semibold text-gray-500 line-clamp-2">{d.locations_text}</div>
                ) : null}
              </div>

              <div className="shrink-0">
                <InlineDayUploader dayId={d.id} compact />
              </div>
            </div>

            {d.title ? <div className="mt-2 text-sm text-gray-800 font-semibold">{d.title}</div> : null}
            {d.notes ? <div className="mt-2 text-sm text-gray-600">{d.notes}</div> : null}

            <div className="mt-4">
              {imgs.length ? <PhotoGrid images={imgs} /> : <div className="text-sm text-gray-500">No photos yet.</div>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function TimelineView({ days, byDay }: { days: DayRow[]; byDay: Map<string, ImgRow[]> }) {
  return (
    <div className="hidden [html[data-view='timeline']_&]:block">
      <div className="mx-auto max-w-4xl grid gap-6">
        {days.map((d) => {
          const imgs = byDay.get(d.id) ?? [];
          return (
            <div key={d.id} className="relative pl-8">
              <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-200" />
              <div className="absolute left-[6px] top-2 h-3 w-3 rounded-full bg-gray-900" />

              <div className="grid gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-extrabold tracking-tight">{formatDateLongUTC(d.date)}</div>
                    <div className="mt-2">
                      <DayBadges title={d.title} locations={d.locations_text} />
                    </div>
                  </div>

                  <div className="shrink-0">
                    <InlineDayUploader dayId={d.id} compact />
                  </div>
                </div>

                {d.title ? <div className="text-sm font-semibold text-gray-800">{d.title}</div> : null}
                {d.locations_text ? <div className="text-sm text-gray-600">{d.locations_text}</div> : null}
                {d.notes ? <div className="text-sm text-gray-600">{d.notes}</div> : null}

                <div className="mt-2">
                  {imgs.length ? <PhotoGrid images={imgs} /> : <div className="text-sm text-gray-500">No photos yet.</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}