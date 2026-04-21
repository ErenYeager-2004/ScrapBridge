import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data-fetching hook.
 *
 * @param {() => Promise<any>} fetcherFn - Async function that returns the data promise.
 * @param {any[]} deps - Dependency array; re-fetches whenever these change.
 * @returns {{ data: any, loading: boolean, error: any, refetch: () => void }}
 */
export function useFetch(fetcherFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcherFn()
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// Default export alias so both import styles work:
//   import useFetch from '...'         ← used by new pages
//   import { useFetch } from '...'     ← used by existing pages
export default useFetch;
