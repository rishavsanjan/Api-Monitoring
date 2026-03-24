export function timeAgo(timestampStr: string): string {
  // Parse: "2026-03-17 13:20:04.64888 +0530 IST" -> ISO-like "2026-03-17T13:20:04.64888+05:30"
  const match = timestampStr.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d+)\s+([+-]\d{4})\s+\w+$/);
  if (!match) return ('Invalid Format');
  
  const [, datePart, timePart, offset] = match;
  const isoStr = `${datePart}T${timePart}${offset.slice(0, 3)}:${offset.slice(3)}`;
  const pastDate = new Date(isoStr);
  
  if (isNaN(pastDate.getTime())) return ('Invalid Format');
  
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


export function formatTimestamp(input: string): string {
   const date = new Date(input);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${month} ${day} ${year} ${hours}:${minutes}:${seconds}`;
}
