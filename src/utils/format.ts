const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseDay(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatDay(value: string) {
  const date = parseDay(value);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function formatRange(checkIn: string, checkOut: string) {
  const start = parseDay(checkIn);
  const end = parseDay(checkOut);
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`;
  }

  return `${formatDay(checkIn)} – ${formatDay(checkOut)}`;
}

export function formatLongDate(date = new Date()) {
  return `${WEEKDAYS[date.getDay()]}, ${LONG_MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return formatDay(iso.slice(0, 10));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((part) => /[a-z]/i.test(part[0] ?? ''))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function plural(value: number, singular: string, pluralForm = `${singular}s`) {
  return `${value} ${value === 1 ? singular : pluralForm}`;
}
