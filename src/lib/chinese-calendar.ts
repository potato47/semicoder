import { Lunar, Solar } from "lunar-typescript";
import { pad } from "./time";

const BEIJING_OFFSET = 8 * 3_600_000;
const DAY = 86_400_000;
const FESTIVALS = [
  [1, 1, "春节"],
  [1, 15, "元宵"],
  [5, 5, "端午"],
  [7, 7, "七夕"],
  [7, 15, "中元"],
  [8, 15, "中秋"],
  [9, 9, "重阳"],
  [12, 8, "腊八"],
] as const;

export function beijingDate(now: Date) {
  const shifted = new Date(now.getTime() + BEIJING_OFFSET);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    key: shifted.toISOString().slice(0, 10),
  };
}

export function getShichen(now: Date) {
  const { hour } = beijingDate(now);
  const index = Math.floor((hour + 1) / 2) % 12;
  const start = (index * 2 + 23) % 24;
  return {
    name: `${"子丑寅卯辰巳午未申酉戌亥"[index]}时`,
    range: `${pad(start)}:00–${pad((start + 2) % 24)}:00`,
  };
}

function solarEpoch(solar: Solar) {
  // The library's Solar fields for Chinese solar terms are Beijing civil time.
  return (
    Date.UTC(
      solar.getYear(),
      solar.getMonth() - 1,
      solar.getDay(),
      solar.getHour(),
      solar.getMinute(),
      solar.getSecond(),
    ) - BEIJING_OFFSET
  );
}

function festival(name: string, solar: Solar, today: number) {
  const ordinal = Date.UTC(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  return { name, date: solar.toYmd(), days: Math.round((ordinal - today) / DAY) };
}

export function getChineseCalendar(now: Date) {
  const beijing = beijingDate(now);
  const solar = Solar.fromYmdHms(
    beijing.year,
    beijing.month,
    beijing.day,
    beijing.hour,
    beijing.minute,
    beijing.second,
  );
  const lunar = solar.getLunar();
  const previous = lunar.getPrevJieQi();
  const next = lunar.getNextJieQi();
  const today = Date.UTC(beijing.year, beijing.month - 1, beijing.day);
  const festivals = [lunar.getYear(), lunar.getYear() + 1].flatMap((year) => [
    ...FESTIVALS.map(([month, day, name]) =>
      festival(name, Lunar.fromYmd(year, month, day).getSolar(), today),
    ),
    // New Year's Eve can be the 29th or 30th of the twelfth lunar month.
    festival(
      "除夕",
      Lunar.fromYmd(year + 1, 1, 1)
        .getSolar()
        .next(-1),
      today,
    ),
  ]);
  for (const year of [beijing.year, beijing.year + 1]) {
    const qingming = Solar.fromYmd(year, 4, 1).getLunar().getJieQiTable()["清明"];
    if (!qingming) throw new Error("缺少清明日期");
    festivals.push(festival("清明", qingming, today));
  }
  festivals.sort((a, b) => a.days - b.days);
  const nextFestival = festivals.find((item) => item.days > 0);
  if (!nextFestival) throw new Error("缺少下一个传统节日");
  return {
    dateKey: beijing.key,
    dateLabel: `${beijing.year} 年 ${beijing.month} 月 ${beijing.day} 日`,
    lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    lunarYear: `${lunar.getYearInChinese()}年`,
    ganzhi: lunar.getYearInGanZhi(),
    zodiac: lunar.getYearShengXiao(),
    currentTerm: { name: previous.getName(), at: solarEpoch(previous.getSolar()) },
    nextTerm: {
      name: next.getName(),
      at: solarEpoch(next.getSolar()),
      date: next.getSolar().toYmdHms(),
    },
    todayFestivals: festivals.filter((item) => item.days === 0),
    nextFestival,
  };
}

// Owned by the mounted homepage, with no shared mutable server state.
export function createCalendarReader() {
  let cached: ReturnType<typeof getChineseCalendar> | null = null;
  let failedDay: string | null = null;
  return (now: Date) => {
    const key = beijingDate(now).key;
    if (key === failedDay) return null;
    if (
      cached?.dateKey === key &&
      now.getTime() >= cached.currentTerm.at &&
      now.getTime() < cached.nextTerm.at
    )
      return cached;
    try {
      cached = getChineseCalendar(now);
      failedDay = null;
      return cached;
    } catch {
      cached = null;
      failedDay = key;
      return null;
    }
  };
}
