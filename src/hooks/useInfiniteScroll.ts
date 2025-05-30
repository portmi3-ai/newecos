import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseInfiniteScrollProps<T> {
  initialData?: T[];
  pageSize?: number;
  fetchData: (page: number, pageSize: number) => Promise<T[]>;
  dependencyKey?: any;
}

interface UseInfiniteScrollResult<T> {
  data: T[];
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
  loadMore: () => void;
}

function useInfiniteScroll<T>({
  initialData = [],
  pageSize = 10,
  fetchData,
  dependencyKey,
}: UseInfiniteScrollProps<T>): UseInfiniteScrollResult<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '300px',
  });
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newData = await fetchData(page, pageSize);
      
      if (newData.length === 0 || newData.length < pageSize) {
        setHasMore(false);
      }
      
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, pageSize, fetchData]);
  
  // Reset when dependency changes
  useEffect(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [dependencyKey, initialData]);
  
  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);
  
  return { data, hasMore, loading, error, loadMore };
}

export default useInfiniteScroll;