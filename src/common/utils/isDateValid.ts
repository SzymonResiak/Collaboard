export function isDateValid(dateStr: any): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
