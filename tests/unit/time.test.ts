import { describe, expect, test } from "bun:test";
import { dayOfYear, formatCountdown, getLocalTime, isLeapYear, isoWeek } from "../../src/lib/time";

function inTimezone(instant: string, timezone: string): ReturnType<typeof getLocalTime> {
  const result = Bun.spawnSync(
    [
      process.execPath,
      "-e",
      `import { getLocalTime } from "./src/lib/time.ts"; console.log(JSON.stringify(getLocalTime(new Date(${JSON.stringify(instant)}))));`,
    ],
    { env: { ...process.env, TZ: timezone } },
  );
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return JSON.parse(result.stdout.toString());
}

describe("本地时间与进度", () => {
  test("跨秒、跨日、跨月、跨年时全部进度重新计算", () => {
    const before = getLocalTime(new Date(2025, 11, 31, 23, 59, 59));
    const after = getLocalTime(new Date(2026, 0, 1, 0, 0, 0));
    expect([before.hour, before.minute, before.second]).toEqual(["23", "59", "59"]);
    expect([after.year, after.month, after.day, after.hour, after.minute, after.second]).toEqual([
      2026,
      1,
      1,
      "00",
      "00",
      "00",
    ]);
    for (const id of ["year", "month", "day", "hour", "minute"]) {
      expect(before.progress.find((p) => p.id === id)!.ratio).toBeGreaterThan(0.98);
      expect(after.progress.find((p) => p.id === id)!.ratio).toBe(0);
    }
  });
  test("本周从周一开始，跨月周边界正确", () => {
    const monday = getLocalTime(new Date(2026, 2, 2));
    const sunday = getLocalTime(new Date(2026, 2, 1, 23, 59, 59));
    expect(monday.progress[2].ratio).toBe(0);
    expect(sunday.progress[2].ratio).toBeGreaterThan(0.999);
  });
  test("世纪闰年规则与二月长度", () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(dayOfYear(2024, 1, 29)).toBe(60);
    const leap = getLocalTime(new Date(2024, 1, 29));
    expect(leap.totalDays).toBe(366);
    expect(leap.remainingDays).toBe(306);
    expect(leap.progress[1].context).toContain("29 天");
    expect(getLocalTime(new Date(2025, 1, 28)).progress[1].context).toContain("28 天");
  });
  test("ISO 周所属年份独立于公历年", () => {
    expect(isoWeek(2021, 0, 1)).toEqual({ year: 2020, week: 53 });
    expect(isoWeek(2024, 11, 30)).toEqual({ year: 2025, week: 1 });
    expect(isoWeek(2026, 11, 31)).toEqual({ year: 2026, week: 53 });
  });
  test("同一瞬间在不同时区显示不同日期与偏移", () => {
    const instant = "2026-02-16T16:30:45Z";
    const shanghai = inTimezone(instant, "Asia/Shanghai");
    const la = inTimezone(instant, "America/Los_Angeles");
    const kathmandu = inTimezone(instant, "Asia/Kathmandu");
    expect([shanghai.day, shanghai.hour, shanghai.offset]).toEqual([17, "00", "UTC+08:00"]);
    expect([la.day, la.hour, la.offset]).toEqual([16, "08", "UTC−08:00"]);
    expect(kathmandu.offset).toBe("UTC+05:45");
    expect(shanghai.unixSeconds).toBe(la.unixSeconds);
    expect(shanghai.iso).toBe(la.iso);
  });
  test("夏令时开始的 23 小时日和 167 小时周", () => {
    const local = inTimezone("2026-03-08T12:00:00-04:00", "America/New_York");
    const day = local.progress[3];
    expect(day.elapsed).toBe(11 * 3600);
    expect(day.remaining).toBe(12 * 3600);
    expect(day.ratio).toBeCloseTo(11 / 23);
    const week = local.progress[2];
    expect(week.elapsed + week.remaining).toBe(167 * 3600);
    expect(local.ordinal).toBe(67);
  });
  test("夏令时结束的 25 小时日及重复小时按钟面分秒计算", () => {
    const first = inTimezone("2026-11-01T01:30:00-04:00", "America/New_York");
    const second = inTimezone("2026-11-01T01:30:00-05:00", "America/New_York");
    expect(first.progress[3].ratio).toBeCloseTo(1.5 / 25);
    expect(second.progress[3].ratio).toBeCloseTo(2.5 / 25);
    expect(first.progress[4].ratio).toBe(0.5);
    expect(second.progress[4].ratio).toBe(0.5);
    expect(first.progress[1].elapsed + first.progress[1].remaining).toBe(721 * 3600);
  });
  test("UTC、ISO 与 Unix 时间戳表示同一瞬间", () => {
    const local = getLocalTime(new Date("2026-10-05T13:20:30.123Z"));
    expect(local.utc).toBe("2026-10-05 13:20:30");
    expect(local.iso).toBe("2026-10-05T13:20:30.123Z");
    expect(local.unixMilliseconds).toBe(Date.parse(local.iso));
    expect(local.unixSeconds).toBe(Math.floor(local.unixMilliseconds / 1000));
  });
  test("倒计时不出现负值，并保留最后一秒", () => {
    expect(formatCountdown(86_461_000)).toBe("1 天 00:01:01");
    expect(formatCountdown(1)).toBe("0 天 00:00:01");
    expect(formatCountdown(-1000)).toBe("0 天 00:00:00");
  });
});
