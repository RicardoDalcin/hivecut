import { useEffect, useRef, useState } from 'react';

export function useSize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const hasInstalled = useRef(false);

  useEffect(() => {
    if (hasInstalled.current || !containerRef.current) {
      return;
    }

    hasInstalled.current = true;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  return size;
}
