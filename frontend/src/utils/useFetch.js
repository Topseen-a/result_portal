import { useEffect, useState, useCallback } from "react";

// Runs `fetcher()` on mount and whenever `deps` change, tracking loading/error/data.
// Pass `skip: true` to avoid firing (e.g. while waiting on a required param).
export function useFetch(fetcher, deps = [], { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);

  const reload = useCallback(() => {
    if (skip) return;
    setLoading(true);
    setError(null);
    fetcher()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps]);

  return { data, error, loading, reload, setData };
}

export const cardPalette = [
  { bg: "var(--color-card-purple-bg)", text: "var(--color-card-purple-text)" },
  { bg: "var(--color-card-orange-bg)", text: "var(--color-card-orange-text)" },
  { bg: "var(--color-card-blue-bg)", text: "var(--color-card-blue-text)" },
  { bg: "var(--color-card-green-bg)", text: "var(--color-card-green-text)" },
];
