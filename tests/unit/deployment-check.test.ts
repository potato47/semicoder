import { expect, test } from "bun:test";
import { verifyDeployment } from "../../scripts/deployment-check";

test("冒烟首次成功时立即完成", async () => {
  let calls = 0;
  const waits: number[] = [];
  await verifyDeployment(
    async () => {
      calls++;
    },
    async (delay) => {
      waits.push(delay);
    },
  );
  expect(calls).toBe(1);
  expect(waits).toEqual([]);
});

test("部署短暂返回旧页面时重跑完整检查，恢复后通过", async () => {
  let calls = 0;
  const waits: number[] = [];
  await verifyDeployment(
    async () => {
      calls++;
      if (calls < 3) throw new Error("/about 应返回 404，实际 200");
    },
    async (delay) => {
      waits.push(delay);
    },
  );
  expect(calls).toBe(3);
  expect(waits).toEqual([10_000, 20_000]);
});

test("持续失败仍阻断发布，保留最后错误且不无限重试", async () => {
  let calls = 0;
  const waits: number[] = [];
  const failure = new Error("/about 应返回 404，实际 200");
  const result = verifyDeployment(
    async () => {
      calls++;
      throw failure;
    },
    async (delay) => {
      waits.push(delay);
    },
  );
  const error = await result.catch((cause: unknown) => cause);
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe("部署后冒烟检查连续 4 次失败");
  expect((error as Error).cause).toBe(failure);
  expect(calls).toBe(4);
  expect(waits).toEqual([10_000, 20_000, 30_000]);
});
