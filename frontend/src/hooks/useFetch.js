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

  const handleFetch = useCallback((ignoreFlag = { current: false }) => {
    fetcherFn()
      .then((res) => {
        if (!ignoreFlag.current) {
          setData(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignoreFlag.current) {
          setError(err);
        }
      })
      .finally(() => {
        if (!ignoreFlag.current) {
          setLoading(false);
        }
      });
  }, [fetcherFn]);

  useEffect(() => {
    const ignoreFlag = { current: false };
    handleFetch(ignoreFlag);

    return () => {
      ignoreFlag.current = true;
    };
  }, [handleFetch]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    handleFetch();
  }, [handleFetch]);

  return { data, loading, error, refetch };
}


export default useFetch;
