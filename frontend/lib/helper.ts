export function timeAgo(input: string | Date, locale = "en") {
  const date = input instanceof Date ? input : new Date(input);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);

  const units: { limit: number; unit: Intl.RelativeTimeFormatUnit; divisor: number }[] = [
    { limit: 60, unit: "second", divisor: 1 },
    { limit: 60 * 60, unit: "minute", divisor: 60 },
    { limit: 60 * 60 * 24, unit: "hour", divisor: 60 * 60 },
    { limit: 60 * 60 * 24 * 7, unit: "day", divisor: 60 * 60 * 24 },
    { limit: 60 * 60 * 24 * 30, unit: "week", divisor: 60 * 60 * 24 * 7 },
    { limit: 60 * 60 * 24 * 365, unit: "month", divisor: 60 * 60 * 24 * 30 },
    { limit: Infinity, unit: "year", divisor: 60 * 60 * 24 * 365 },
  ];

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const abs = Math.abs(diffInSeconds);

  const { unit, divisor } = units.find((u) => abs < u.limit)!;
  const value = Math.round(diffInSeconds / divisor);

  return rtf.format(value, unit);
}

