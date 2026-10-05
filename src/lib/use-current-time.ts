import { useEffect, useState } from "react";

export function useCurrentTime() {
  // Keep prerendered HTML and the first hydration render identical.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function update() {
      clearTimeout(timer);
      timer = undefined;
      if (document.hidden) return;
      const timestamp = Date.now();
      setNow(new Date(Math.floor(timestamp / 1000) * 1000));
      timer = setTimeout(update, 1000 - (timestamp % 1000));
    }
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return now;
}
