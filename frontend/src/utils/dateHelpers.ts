/**
 * Get the start of the current year (January 1st)
 */
export function getYearToDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1); // January 1st of current year
}

/**
 * Get a date N days ago from today
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Calculate number of days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Format date for chart labels based on time range
 */
export function formatChartDate(date: Date, range: string): string {
  const options: Intl.DateTimeFormatOptions = {};

  switch (range) {
    case '1D':
      // Show hours for 1-day view
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    case '1W':
    case '1M':
      // Show month and day for week/month view
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '3M':
    case '1Y':
    case 'YTD':
      // Show month and day for longer periods
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'All':
      // Show month and year for all-time view
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
