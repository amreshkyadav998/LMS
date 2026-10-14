"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Paginated } from "@/types";

const PAGE_SIZE = 10;

/**
 * Paginated, searchable list backed by SWR. The search term is debounced and
 * resets the page; `filters` are appended to the query string.
 */
export function usePaginatedList<T, R extends Paginated<T> = Paginated<T>>(
  endpoint: string,
  filters: Record<string, string | undefined> = {},
) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (debouncedSearch) params.set("search", debouncedSearch);
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const { data, error, isLoading, mutate } = useSWR<R>(`${endpoint}?${params}`, fetcher, {
    keepPreviousData: true,
  });

  return { data, error, isLoading, mutate, page, setPage, search, setSearch };
}
