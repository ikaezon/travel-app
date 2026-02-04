import { useCallback, useEffect, useState, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  initialData: T;
}

interface UseAsyncDataResult<T> {
  data: T;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => void;
  setData: (next: T) => void;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  { initialData }: UseAsyncDataOptions<T>
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedRef = useRef(false);
  const runIdRef = useRef(0);

  const run = useCallback(async () => {
    const id = ++runIdRef.current;
    try {
      if (!hasLoadedRef.current) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      setError(null);
      const result = await fetcher();
      if (id !== runIdRef.current) return;
      setData(result);
      hasLoadedRef.current = true;
    } catch (err) {
      if (id !== runIdRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      if (id !== runIdRef.current) return;
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [fetcher]);

  useEffect(() => {
    run();
    return () => {
      runIdRef.current++;
    };
  }, [run]);

  return { data, isLoading, isRefetching, error, refetch: run, setData };
}
