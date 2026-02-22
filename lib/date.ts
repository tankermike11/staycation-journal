export function formatDateUTC(dateISO: string, opts?: Intl.DateTimeFormatOptions) {
  // dateISO is "YYYY-MM-DD"
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    ...(opts ?? {})
  }).format(new Date(`${dateISO}T00:00:00Z`));
}

export function formatDateLongUTC(dateISO: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${dateISO}T00:00:00Z`));
}