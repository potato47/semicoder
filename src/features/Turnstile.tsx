import { useEffect, useRef } from "react";
interface TurnstileAPI {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}
let scriptPromise: Promise<void> | undefined;
function loadScript() {
  return (scriptPromise ??= new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = undefined;
      script.remove();
      reject(new Error("验证组件加载失败"));
    };
    document.head.appendChild(script);
  }));
}
export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let id: string | undefined,
      disposed = false;
    loadScript()
      .then(() => {
        if (disposed || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          action: "comment",
          theme: "auto",
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      })
      .catch(() => onToken(""));
    return () => {
      disposed = true;
      if (id) window.turnstile?.remove(id);
    };
  }, [siteKey, onToken]);
  return <div ref={ref} aria-label="评论安全验证" />;
}
