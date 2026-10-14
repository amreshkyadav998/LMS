"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import type { User } from "@/types";

export function useCurrentUser() {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR<{ user: User }>("/auth/me", fetcher, {
    revalidateOnFocus: false,
  });

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    await mutate(undefined, { revalidate: false });
    router.replace("/login");
    router.refresh();
  }, [mutate, router]);

  return { user: data?.user, isLoading, logout };
}
