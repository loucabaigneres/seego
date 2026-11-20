const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Formats an ISO date coming from the API (no superjson: dates cross the wire as strings). */
export function formatDateTime(value: string | Date) {
  return dateTimeFormat.format(new Date(value));
}
