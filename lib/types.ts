export type EventRow = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  summary: string | null;
  tags: string[] | null;
  hero_image_id: string | null;
  created_at: string;
};

export type DayRow = {
  id: string;
  event_id: string;
  date: string;
  title: string | null;
  locations_text: string | null;
  notes: string | null;
  sort_index: number;
};

export type ImageRow = {
  id: string;
  day_id: string;
  caption: string | null;
  sort_index: number;
  storage_key_original: string;
  storage_key_web: string;
  storage_key_thumb: string;
  created_at: string;
};
