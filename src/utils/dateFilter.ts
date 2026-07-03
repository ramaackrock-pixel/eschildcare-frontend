export function isWithinTimeRange(dateString: string | undefined, timeRange: string): boolean {
  if (!dateString) return true;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return true;

  const now = new Date();
  
  // Set times to midnight to ensure accurate day differences
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (timeRange === 'Daily') {
    // Today or Tomorrow/future
    return diffDays <= 0 && diffDays >= -1; 
  } else if (timeRange === 'Weekly') {
    return diffDays <= 7 && diffDays >= -7;
  } else if (timeRange === 'Monthly') {
    return diffDays <= 30 && diffDays >= -30;
  }
  
  return true;
}
