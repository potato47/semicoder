const DAY = 86_400_000;
export const pad = (value: number) => String(value).padStart(2, "0");

export interface TimeProgress {
  id: string;
  label: string;
  context: string;
  ratio: number;
  elapsed: number;
  remaining: number;
}

export function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

// Calendar ordinals deliberately use UTC fields, not elapsed local 24-hour periods.
export function dayOfYear(year: number, month: number, day: number) {
  return Math.round((Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / DAY) + 1;
}

export function isoWeek(year: number, month: number, day: number) {
  const thursday = new Date(Date.UTC(year, month, day));
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const weekYear = thursday.getUTCFullYear();
  return {
    year: weekYear,
    week: Math.ceil(dayOfYear(weekYear, thursday.getUTCMonth(), thursday.getUTCDate()) / 7),
  };
}

export function formatDuration(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  const days = Math.floor(value / 86400);
  const hours = Math.floor((value % 86400) / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  if (days) return `${days} 天 ${hours} 时`;
  if (hours) return `${hours} 时 ${minutes} 分`;
  if (minutes) return `${minutes} 分 ${value % 60} 秒`;
  return `${value % 60} 秒`;
}

export function formatCountdown(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 86400)} 天 ${pad(Math.floor(seconds / 3600) % 24)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}

export function getLocalTime(now: Date) {
  const epoch = now.getTime();
  if (!Number.isFinite(epoch)) throw new RangeError("无效时间");
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const weekday = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const ordinal = dayOfYear(year, month, day);
  const totalDays = isLeapYear(year) ? 366 : 365;
  const week = isoWeek(year, month, day);
  const date = (y: number, m: number, d: number) => new Date(y, m, d).getTime();
  const progress = (
    id: string,
    label: string,
    context: string,
    start: number,
    end: number,
  ): TimeProgress => ({
    id,
    label,
    context,
    ratio: Math.min(1, Math.max(0, (epoch - start) / (end - start))),
    elapsed: (epoch - start) / 1000,
    remaining: (end - epoch) / 1000,
  });
  const monday = day - ((weekday + 6) % 7);
  const minuteStart = epoch - second * 1000 - now.getMilliseconds();
  const hourStart = minuteStart - minute * 60_000;
  const offset = -now.getTimezoneOffset();
  return {
    year,
    month: month + 1,
    day,
    hour: pad(hour),
    minute: pad(minute),
    second: pad(second),
    date: `${year} 年 ${month + 1} 月 ${day} 日`,
    weekday: `星期${"日一二三四五六"[weekday]}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "设备本地时区",
    offset: `UTC${offset >= 0 ? "+" : "−"}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`,
    ordinal,
    totalDays,
    remainingDays: totalDays - ordinal,
    quarter: Math.floor(month / 3) + 1,
    week,
    iso: now.toISOString(),
    utc: `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`,
    unixSeconds: Math.floor(epoch / 1000),
    unixMilliseconds: epoch,
    progress: [
      progress("year", "今年", `${year} 年`, date(year, 0, 1), date(year + 1, 0, 1)),
      progress(
        "month",
        "本月",
        `${month + 1} 月 · ${new Date(year, month + 1, 0).getDate()} 天`,
        date(year, month, 1),
        date(year, month + 1, 1),
      ),
      progress(
        "week",
        "本周",
        "周一 → 周日",
        date(year, month, monday),
        date(year, month, monday + 7),
      ),
      progress(
        "day",
        "今天",
        `${month + 1} 月 ${day} 日`,
        date(year, month, day),
        date(year, month, day + 1),
      ),
      progress(
        "hour",
        "当前小时",
        `${pad(hour)}:00 → ${pad((hour + 1) % 24)}:00`,
        hourStart,
        hourStart + 3_600_000,
      ),
      progress(
        "minute",
        "当前分钟",
        `${pad(hour)}:${pad(minute)}`,
        minuteStart,
        minuteStart + 60_000,
      ),
    ],
  };
}
