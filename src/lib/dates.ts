const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Formats a validated content date (YYYY-MM-DD) as en-US, for example "Oct 25, 2026". */
export function formatContentDate(isoDate: string): string {
  const match = isoDatePattern.exec(isoDate);
  if (match === null) {
    throw new RangeError(`Not a YYYY-MM-DD date: ${JSON.stringify(isoDate)}`);
  }
  // UTC midnight formatted in UTC, so the day never shifts with the time zone.
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() + 1 !== Number(match[2]) ||
    date.getUTCDate() !== Number(match[3])
  ) {
    throw new RangeError(`Not a real date: ${JSON.stringify(isoDate)}`);
  }
  return formatter.format(date);
}
