import { createAuthClient } from "better-auth/react";
import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSessionInfo } from "../server/functions";
export const authClient = createAuthClient();
const subscribe = () => () => {};
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
export function unwrap<T>(
  value: { ok: true; data: T } | { ok: false; error: string; code: string },
): T {
  if (!value.ok) throw new Error(value.error);
  return value.data;
}
export function useSessionInfo() {
  const mounted = useMounted();
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => unwrap(await getSessionInfo()),
    enabled: mounted,
    retry: false,
    staleTime: 30000,
  });
}
export async function signIn() {
  await authClient.signIn.social({ provider: "github", callbackURL: window.location.href });
}
