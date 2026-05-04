const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function dateKey(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function todayKey() {
  return dateKey(new Date());
}

export function currentTimeKey() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function parseDateKey(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function formatFullDate(value: string) {
  const date = parseDateKey(value);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}요일`;
}

export function formatShortDate(value: string) {
  const date = parseDateKey(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function monthTitle(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function buildCalendarDays(visibleDate: Date) {
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return {
      key: dateKey(current),
      day: current.getDate(),
      isCurrentMonth: current.getMonth() === month,
    };
  });
}

export function minutesBetween(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

export function formatHours(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}시간 ${minutes}분` : `${hours}시간`;
}
