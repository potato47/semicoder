import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createCalendarReader, getShichen } from "../lib/chinese-calendar";
import { formatCountdown, formatDuration, getLocalTime, type TimeProgress } from "../lib/time";
import { useCurrentTime } from "../lib/use-current-time";
import { seo } from "../lib/seo";
import styles from "../styles/Home.module.css";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "此时此刻",
      "看看此时此刻：本地时间、公历农历、节气节日，以及年、月、周、日的时间进度。",
      "/",
    ),
  component: Home,
});

const progressLabels = ["今年", "本月", "本周", "今天", "当前小时", "当前分钟"];

function Progress({ item, label }: { item?: TimeProgress; label: string }) {
  const percent = item ? Math.floor(item.ratio * 10_000) / 100 : undefined;
  return (
    <div className={styles.progressItem}>
      <div className={styles.progressHeading}>
        <div>
          <h3>{label}</h3>
          <span>{item?.context ?? "等待本地时间"}</span>
        </div>
        <strong>
          {percent?.toFixed(2) ?? "—"}
          <small>%</small>
        </strong>
      </div>
      {item ? (
        <progress
          className={styles.track}
          aria-label={`${label}已过时间`}
          max={100}
          value={item.ratio * 100}
          aria-valuetext={`${percent?.toFixed(2)}%，已过 ${formatDuration(item.elapsed)}，剩余 ${formatDuration(item.remaining)}`}
        />
      ) : (
        <div className={styles.track} aria-hidden="true" />
      )}
      <div className={styles.progressFoot}>
        <span>已过 {item ? formatDuration(item.elapsed) : "—"}</span>
        <span>剩余 {item ? formatDuration(item.remaining) : "—"}</span>
      </div>
    </div>
  );
}

function Home() {
  const now = useCurrentTime();
  const [readCalendar] = useState(createCalendarReader);
  const local = now ? getLocalTime(now) : null;
  const calendar = now ? readCalendar(now) : null;
  const shichen = now ? getShichen(now) : null;
  const details = [
    ["当前季度", local ? `第 ${local.quarter} 季度` : "—"],
    ["年内日序", local ? `第 ${local.ordinal} 天` : "—"],
    ["全年天数", local ? `${local.totalDays} 天` : "—"],
    ["今年剩余", local ? `${local.remainingDays} 天` : "—"],
    ["ISO 周数", local ? `${local.week.year} · 第 ${local.week.week} 周` : "—"],
    ["年份类型", local ? (local.totalDays === 366 ? "闰年" : "平年") : "—"],
  ];
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="time-title">
        <h1 id="time-title" className={styles.visuallyHidden}>
          当前时间
        </h1>
        <time
          className={styles.clock}
          dateTime={local?.iso}
          aria-label={local ? `${local.hour}时${local.minute}分${local.second}秒` : "等待本地时间"}
        >
          <span>{local?.hour ?? "--"}</span>
          <b>:</b>
          <span>{local?.minute ?? "--"}</span>
          <b>:</b>
          <span className={styles.seconds}>{local?.second ?? "--"}</span>
        </time>
        <div className={styles.dateLine}>
          <span>{local?.date ?? "年 / 月 / 日"}</span>
          <span className={styles.weekday}>{local?.weekday ?? "星期 —"}</span>
        </div>
        <p className={styles.timezone}>
          <span>{local?.timeZone ?? "设备本地时区"}</span>
          <span>{local?.offset ?? "UTC —"}</span>
        </p>
        <noscript>
          <p className="notice">开启 JavaScript 后即可显示实时日期、农历与时间进度。</p>
        </noscript>
      </section>

      <section className={styles.section} aria-labelledby="calendar-title">
        <h2 id="calendar-title" className={styles.visuallyHidden}>
          中国历法
        </h2>
        {now && !calendar ? (
          <p className="notice">历法信息暂时不可用，本地时间仍正常显示。</p>
        ) : (
          <div className={styles.calendarGrid}>
            <div className={styles.calendarCell}>
              <span className={styles.label}>农历</span>
              <p className={styles.lunarDate}>{calendar?.lunarDate ?? "—月—日"}</p>
              <p className={styles.calendarNote}>
                <span>{calendar?.lunarYear ?? "农历年"}</span>
                <span>{calendar ? `${calendar.ganzhi}${calendar.zodiac}年` : "干支 · 生肖"}</span>
              </p>
            </div>
            <div className={styles.calendarCell}>
              <span className={styles.label}>此刻时辰</span>
              <p className={styles.lunarDate}>{shichen?.name ?? "—时"}</p>
              <p className={styles.calendarNote}>{shichen?.range ?? "--:--–--:--"}</p>
            </div>
            <div className={`${styles.calendarCell} ${styles.termCell}`}>
              <span className={styles.label}>节气</span>
              <p className={styles.termNames}>
                {calendar?.currentTerm.name ?? "—"}
                <span aria-hidden="true">→</span>
                <span>
                  <small>下一个</small>
                  {calendar?.nextTerm.name ?? "—"}
                </span>
              </p>
              <p className={styles.countdown}>
                还有{" "}
                {calendar && now
                  ? formatCountdown(calendar.nextTerm.at - now.getTime())
                  : "— 天 --:--:--"}
              </p>
              <p className={styles.termDate}>{calendar?.nextTerm.date ?? "等待节气交接时间"}</p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="progress-title">
        <h2 id="progress-title" className={styles.visuallyHidden}>
          时间进度
        </h2>
        <div className={styles.progressGrid}>
          {progressLabels.map((label, index) => (
            <Progress key={label} label={label} item={local?.progress[index]} />
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="details-title">
        <h2 id="details-title" className={styles.visuallyHidden}>
          时间坐标
        </h2>
        <dl className={styles.detailsGrid}>
          {details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.detailNote}>
          剩余天数不含今天 · ISO 周从周一开始，跨年周可能属于相邻年份
        </p>
        <dl className={styles.machineGrid}>
          <div>
            <dt>UTC 时间</dt>
            <dd>{local?.utc ?? "—"}</dd>
          </div>
          <div>
            <dt>ISO 8601</dt>
            <dd>{local?.iso ?? "—"}</dd>
          </div>
          <div>
            <dt>Unix 时间戳 · 秒</dt>
            <dd>{local?.unixSeconds ?? "—"}</dd>
          </div>
          <div>
            <dt>Unix 时间戳 · 毫秒</dt>
            <dd>{local?.unixMilliseconds ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="festivals-title">
        <h2 id="festivals-title" className={styles.visuallyHidden}>
          传统节日
        </h2>
        <div className={styles.festivalGrid}>
          <div className={styles.festivalToday}>
            <span className={styles.label}>今日节日</span>
            <h3>
              {calendar
                ? calendar.todayFestivals.map((item) => item.name).join(" · ") || "平常的一天"
                : "—"}
            </h3>
            <p>
              {calendar?.todayFestivals.length
                ? "就是今天"
                : calendar
                  ? "下一个值得记住的日子，正在走近。"
                  : now
                    ? "历法信息暂时不可用"
                    : "等待本地时间"}
            </p>
          </div>
          <div className={styles.nextFestival}>
            <div>
              <span className={styles.label}>下一个节日</span>
              <h3>{calendar?.nextFestival.name ?? "—"}</h3>
              <p>{calendar?.nextFestival.date ?? "—"}</p>
            </div>
            <p className={styles.festivalDays}>
              <span>还有</span>
              <strong>{calendar?.nextFestival.days ?? "—"}</strong>
              <span>天</span>
            </p>
          </div>
        </div>
        <p className={styles.detailNote}>
          春节 · 元宵 · 清明 · 端午 · 七夕 · 中元 · 中秋 · 重阳 · 腊八 · 除夕
        </p>
      </section>
    </div>
  );
}
