type TimeUnit = {
  unit: Intl.RelativeTimeFormatUnit;
  seconds: number;
};

export function getRelativeTimeString(dateString: string): string {
    // Parse the input date string
    const inputDate = new Date(dateString);

    // Validate the date
    if (isNaN(inputDate.getTime())) {
        return "Invalid date";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((inputDate.getTime() - now.getTime()) / 1000);

    // Define time units and their equivalent in seconds
    const timeUnits: TimeUnit[] = [
        { unit: "year", seconds: 31536000 },
        { unit: "month", seconds: 2592000 },
        { unit: "week", seconds: 604800 },
        { unit: "day", seconds: 86400 },
        { unit: "hour", seconds: 3600 },
        { unit: "minute", seconds: 60 },
        { unit: "second", seconds: 1 }
    ];

    // Find the appropriate unit
    for (const { unit, seconds } of timeUnits) {
        const diff = diffInSeconds / seconds;

        if (Math.abs(diff) >= 1 || unit === "second") {
            const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
            return rtf.format(Math.round(diff), unit);
        }
    }

    return "just now";
}