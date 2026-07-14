import { useEffect, useMemo, useState } from "react";

/**
 * Client-side pagination helper. Slices `items` into pages and keeps the
 * current page in range when the underlying list shrinks (e.g. after filtering).
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return { page, setPage, totalPages, paged, pageSize, total };
}
