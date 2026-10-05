import { describe, expect, spyOn, test } from "bun:test";
import { Solar } from "lunar-typescript";
import {
  beijingDate,
  createCalendarReader,
  getChineseCalendar,
  getShichen,
} from "../../src/lib/chinese-calendar";

describe("北京时间中国历法", () => {
  test("春节零点换农历年、干支和生肖，不按立春换年", () => {
    const before = getChineseCalendar(new Date("2026-02-16T15:59:59Z"));
    const after = getChineseCalendar(new Date("2026-02-16T16:00:00Z"));
    expect([before.lunarDate, before.ganzhi, before.zodiac]).toEqual(["腊月廿九", "乙巳", "蛇"]);
    expect([after.lunarDate, after.ganzhi, after.zodiac]).toEqual(["正月初一", "丙午", "马"]);
    expect(before.nextFestival).toEqual({ name: "春节", date: "2026-02-17", days: 1 });
    expect(after.todayFestivals.map((item) => item.name)).toEqual(["春节"]);
    expect(after.nextFestival.name).toBe("元宵");
  });
  test("闰月标记保留，闰月不重复普通月节日", () => {
    expect(getChineseCalendar(new Date("2025-07-25T04:00:00Z")).lunarDate).toBe("闰六月初一");
    const leap = getChineseCalendar(new Date("2009-06-27T04:00:00Z"));
    expect(leap.lunarDate).toBe("闰五月初五");
    expect(leap.todayFestivals).toEqual([]);
    expect(getChineseCalendar(new Date("2009-05-28T04:00:00Z")).todayFestivals[0]?.name).toBe(
      "端午",
    );
  });
  test("除夕兼容腊月二十九和三十", () => {
    for (const [date, lunarDate] of [
      ["2024-02-09", "腊月三十"],
      ["2025-01-28", "腊月廿九"],
    ]) {
      const calendar = getChineseCalendar(new Date(`${date}T04:00:00Z`));
      expect(calendar.lunarDate).toBe(lunarDate);
      expect(calendar.todayFestivals[0]?.name).toBe("除夕");
      expect(calendar.nextFestival.days).toBe(1);
    }
  });
  test("清明按节气日期确定，其他传统节日按农历确定", () => {
    for (const [date, name] of [
      ["2026-03-03", "元宵"],
      ["2026-04-05", "清明"],
      ["2026-06-19", "端午"],
      ["2026-08-19", "七夕"],
      ["2026-08-27", "中元"],
      ["2026-09-25", "中秋"],
      ["2026-10-18", "重阳"],
      ["2026-01-26", "腊八"],
    ]) {
      expect(
        getChineseCalendar(new Date(`${date}T04:00:00Z`)).todayFestivals.map((item) => item.name),
      ).toContain(name);
    }
  });
  test("节气在交接瞬间切换，而不是当天零点", () => {
    const read = createCalendarReader();
    const before = read(new Date("2026-10-08T06:29:16Z"))!;
    expect(before.currentTerm.name).toBe("秋分");
    expect(before.nextTerm).toMatchObject({ name: "寒露", date: "2026-10-08 14:29:17" });
    const at = read(new Date("2026-10-08T06:29:17Z"))!;
    expect(at.currentTerm.name).toBe("寒露");
    expect(at.nextTerm.name).toBe("霜降");
    expect(at).not.toBe(before);
    expect(read(new Date("2026-10-08T06:29:18Z"))).toBe(at);
    expect(read(new Date("2026-10-08T06:29:16Z"))!.currentTerm.name).toBe("秋分");
  });
  test("缓存跨北京时间午夜更新，长时间离开后直接校准", () => {
    const read = createCalendarReader();
    const original = read(new Date("2026-02-16T15:59:58Z"));
    expect(read(new Date("2026-02-16T15:59:59Z"))).toBe(original);
    expect(read(new Date("2026-02-16T16:00:00Z"))!.lunarDate).toBe("正月初一");
    expect(read(new Date("2027-02-06T04:00:00Z"))!.todayFestivals[0]?.name).toBe("春节");
  });
  test("时辰在奇数小时切换，子时跨午夜", () => {
    expect(getShichen(new Date("2026-10-05T14:59:59Z"))).toEqual({
      name: "亥时",
      range: "21:00–23:00",
    });
    expect(getShichen(new Date("2026-10-05T15:00:00Z"))).toEqual({
      name: "子时",
      range: "23:00–01:00",
    });
    expect(getShichen(new Date("2026-10-05T16:59:59Z")).name).toBe("子时");
    expect(getShichen(new Date("2026-10-05T17:00:00Z")).name).toBe("丑时");
  });
  test("访客本地尚未到春节时，北京历法已到春节", () => {
    const instant = new Date("2026-02-16T08:30:00-08:00");
    expect(beijingDate(instant).key).toBe("2026-02-17");
    expect(getChineseCalendar(instant).lunarDate).toBe("正月初一");
  });
  test("农历转换失败只返回历法不可用，当天不重复抛错", () => {
    const read = createCalendarReader();
    const original = Solar.fromYmdHms;
    const mock = spyOn(Solar, "fromYmdHms").mockImplementation(() => {
      throw new Error("calendar failure");
    });
    try {
      expect(read(new Date("2026-10-05T04:00:00Z"))).toBeNull();
      mock.mockImplementation(original);
      expect(read(new Date("2026-10-05T04:00:01Z"))).toBeNull();
      expect(read(new Date("2026-10-06T04:00:00Z"))?.dateKey).toBe("2026-10-06");
    } finally {
      mock.mockRestore();
    }
  });
});
