import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}): [
  React.RefObject<Element>,
  boolean,
  IntersectionObserverEntry | undefined,
] {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<Element>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
    setIsIntersecting(entry.isIntersecting);
  };

  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return [elementRef, isIntersecting, entry];
}

// Hook for lazy loading
export function useLazyLoad(src: string, options?: UseIntersectionObserverOptions) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
    ...options,
  });
  
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isIntersecting, shouldLoad]);

  return {
    ref,
    shouldLoad,
    src: shouldLoad ? src : undefined,
  };
}

// Hook for infinite scrolling
export function useInfiniteScroll(
  callback: () => void,
  options?: UseIntersectionObserverOptions,
) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 1.0,
    rootMargin: '100px',
    ...options,
  });

  useEffect(() => {
    if (isIntersecting) {
      callback();
    }
  }, [isIntersecting, callback]);

  return ref;
}

// Hook for viewport visibility tracking
export function useViewportVisibility(options?: UseIntersectionObserverOptions) {
  const [ref, isIntersecting, entry] = useIntersectionObserver({
    threshold: [0, 0.25, 0.5, 0.75, 1],
    ...options,
  });

  const visibilityPercentage = entry?.intersectionRatio || 0;

  return {
    ref,
    isVisible: isIntersecting,
    visibilityPercentage: Math.round(visibilityPercentage * 100),
    entry,
  };
}
