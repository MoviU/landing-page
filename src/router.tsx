import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  RouterContext,
  currentPath,
  normalize,
  useRouter,
} from './routerContext';

// A tiny History API router. The site is a static SPA served with an
// index.html fallback (see public/.htaccess), so real paths survive a refresh
// and can be linked to directly — no routing library needed for a few pages.

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath);

  // Browser back/forward.
  useEffect(() => {
    const onPopState = () => setPath(currentPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const next = normalize(to);
    if (next === currentPath()) return;
    window.history.pushState(null, '', next);
    setPath(next);
    window.scrollTo(0, 0);
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

// Plain left-clicks are handled in-page; modified clicks (new tab, middle
// click) fall through to the browser's own behavior.
export function Link({ href, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
