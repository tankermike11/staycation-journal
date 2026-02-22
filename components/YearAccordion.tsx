"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/EventCard";
import type { EventRow } from "@/lib/types";
import { Button, Card } from "@/components/ui";

export function YearAccordion({
  years,
  byYear
}: {
  years: number[]; // already sorted newest → oldest
  byYear: Record<number, EventRow[]>;
}) {
  const defaultOpenYear = useMemo(() => years[0] ?? null, [years]);
  const [openYears, setOpenYears] = useState<Set<number>>(
    defaultOpenYear ? new Set([defaultOpenYear]) : new Set()
  );

  function toggleYear(y: number) {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(y)) next.delete(y);
      else next.add(y);
      return next;
    });
  }

  function expandAll() {
    setOpenYears(new Set(years));
  }

  function collapseAll() {
    setOpenYears(new Set(defaultOpenYear ? [defaultOpenYear] : []));
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Click a year to expand/collapse.
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" type="button" onClick={expandAll}>
            Expand all
          </Button>
          <Button variant="secondary" type="button" onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {years.map((year) => {
          const isOpen = openYears.has(year);
          const eventsForYear = byYear[year] ?? [];

          return (
            <Card key={year} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleYear(year)}
                className="flex w-full items-center justify-between gap-4 border-b border-gray-200/70 px-5 py-4 text-left hover:bg-gray-50"
                aria-expanded={isOpen}
              >
                <div className="flex items-baseline gap-3">
                  <div className="text-xl font-extrabold tracking-tight">
                    {year}
                  </div>
                  <div className="text-sm text-gray-500">
                    {eventsForYear.length} event{eventsForYear.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="text-sm font-semibold text-gray-600">
                  {isOpen ? "Hide" : "Show"}
                </div>
              </button>

              {isOpen ? (
                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {eventsForYear.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}