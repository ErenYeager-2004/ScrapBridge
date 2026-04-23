import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data-fetching hook.
 *
 * @param {() => Promise<any>} fetcherFn - Stable async function that returns the data promise.
 *   Wrap in useCallback at the call-site if it depends on changing values.
 * @returns {{ data: any, loading: boolean, error: any, refetch: () => void }}
 */
export function useFetch(fetcherFn) {
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
  }, [fetcherFn]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}


export default useFetch;
