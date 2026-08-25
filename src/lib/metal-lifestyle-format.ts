/** Weebly-style date: M/D/YYYY */
export function formatMetalLifestyleDate(isoDate: string): string {
  const d = new Date(isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}
