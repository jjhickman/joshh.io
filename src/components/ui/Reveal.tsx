import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

const callbacks = new WeakMap<Element, () => void>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        sharedObserver?.unobserve(entry.target);
        callbacks.delete(entry.target);
      }
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );
  return sharedObserver;
}

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3;
}

export function Reveal({ as: Component = "div", children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = getObserver();
    if (!observer) {
      setRevealed(true);
      return;
    }
    callbacks.set(element, () => setRevealed(true));
    setReady(true);
    observer.observe(element);
    return () => {
      observer.unobserve(element);
      callbacks.delete(element);
    };
  }, []);

  return (
    <Component
      className={`reveal reveal-delay-${delay} ${className}`}
      data-reveal-ready={ready || undefined}
      data-revealed={revealed || undefined}
      ref={ref}
    >
      {children}
    </Component>
  );
}
