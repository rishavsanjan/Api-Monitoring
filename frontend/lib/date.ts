export function timeAgo(timestampStr: string): string {
  // Parse: "2026-03-17 13:20:04.64888 +0530 IST" -> ISO-like "2026-03-17T13:20:04.64888+05:30"
  const match = timestampStr.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d+)\s+([+-]\d{4})\s+\w+$/);
  if (!match) throw new Error('Invalid timestamp format');
  
  const [, datePart, timePart, offset] = match;
  const isoStr = `${datePart}T${timePart}${offset.slice(0, 3)}:${offset.slice(3)}`;
  const pastDate = new Date(isoStr);
  
  if (isNaN(pastDate.getTime())) throw new Error('Failed to parse date');
  
  const now = Date.now();
  const diffMs = now - pastDate.getTime();
  
  if (diffMs < 0) return 'in the future';
  if (diffMs < 1000) return 'just now';
  
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} secs ago`;
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
  
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
}
