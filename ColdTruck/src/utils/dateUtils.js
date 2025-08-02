// Utility functions for date formatting

export function formatShortDate(dateStr) { // FORMAT_FECHA
  if (!dateStr) return '';
  const date = new Date(dateStr);
  try {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
      .format(date)
      .replace(/\./g, '')
      .toLowerCase();
  } catch (e) {
    const weekdays = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  }
}