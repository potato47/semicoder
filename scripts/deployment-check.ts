import { setTimeout } from "node:timers/promises";

// A newly deployed site can briefly serve the previous version at an edge location.
// Retry the complete smoke check; never repeat migrations or the deployment itself.
export async function verifyDeployment(
  check: () => Promise<void>,
  wait: (milliseconds: number) => Promise<unknown> = setTimeout,
) {
  const attempts = 4;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await check();
      return;
    } catch (cause) {
      if (attempt === attempts) throw new Error(`部署后冒烟检查连续 ${attempts} 次失败`, { cause });
      const delay = attempt * 10_000;
      console.warn(`部署后冒烟检查失败（${attempt}/${attempts}），${delay / 1000} 秒后重新检查`);
      await wait(delay);
    }
  }
}
