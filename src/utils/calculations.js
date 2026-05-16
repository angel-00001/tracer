// Status definitions — single source of truth for the whole app
export const STATUS_CONFIG = {
  present: {
    label: 'Present',
    emoji: '✅',
    color: 'text-green-700',
    bg: 'bg-green-100',
    hoverBg: 'hover:bg-green-200',
    countsAsPresent: true,
    countsInTotal: true,
  },
  absent: {
    label: 'Absent',
    emoji: '❌',
    color: 'text-red-700',
    bg: 'bg-red-100',
    hoverBg: 'hover:bg-red-200',
    countsAsPresent: false,
    countsInTotal: true,
  },
  extra_class: {
    label: 'Extra Class',
    emoji: '➕',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    hoverBg: 'hover:bg-blue-200',
    countsAsPresent: true,
    countsInTotal: true,
  },
  holiday: {
    label: 'Holiday',
    emoji: '🏖️',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    hoverBg: 'hover:bg-amber-200',
    countsAsPresent: false,
    countsInTotal: false, // neutral — doesn't affect %
  },
  cancelled: {
    label: 'Cancelled',
    emoji: '🚫',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    hoverBg: 'hover:bg-gray-200',
    countsAsPresent: false,
    countsInTotal: false, // neutral — doesn't affect %
  },
};

/**
 * Calculate attendance stats for a course.
 * - present + extra_class → count as "present"
 * - holiday + cancelled   → excluded from total (neutral)
 */
export const calculateAttendanceStats = (attendance, courseCode) => {
  const courseAttendance = attendance.filter(a => a.course_code === courseCode);

  const counted = courseAttendance.filter(a => {
    const cfg = STATUS_CONFIG[a.status];
    return cfg?.countsInTotal ?? true;
  });

  const present = counted.filter(a => STATUS_CONFIG[a.status]?.countsAsPresent).length;
  const total = counted.length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

  return { present, total, percentage };
};

export const getTodayAttendanceStatus = (attendance, courseCode, date) => {
  return attendance.find(
    a => a.course_code === courseCode && a.date === date
  )?.status;
};

export const isAttendanceLow = (percentage, required) => {
  return parseFloat(percentage) < required;
};

export const isWeekend = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day).getDay();
  return d === 0 || d === 6;
};

// Returns how many more classes can be skipped (>= 0) or how many must be attended to recover (< 0 means deficit).
export const calculateSkipInfo = (present, total, required) => {
  if (total === 0) return null;
  const r = required / 100;
  const canSkip = Math.floor(present / r - total);
  if (canSkip >= 0) return { type: 'skip', count: canSkip };
  const needToAttend = Math.ceil((r * total - present) / (1 - r));
  return { type: 'recover', count: needToAttend };
};

export const getWeekdaysInRange = (startDate, endDate, includeWeekends = false) => {
  const days = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    if (includeWeekends || !isWeekend(dateStr)) {
      days.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateString === today) return 'Today';
  if (dateString === yesterdayStr) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};