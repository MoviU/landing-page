import { createContext, useContext } from 'react';

// Split out from router.tsx so that file exports components only and Fast
// Refresh keeps working across edits.

export type RouterValue = {
  path: string;
  navigate: (to: string) => void;
};

export const RouterContext = createContext<RouterValue | null>(null);

// '/games/' and '/games' are the same page; '/' stays '/'.
export const normalize = (path: string) =>
  path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

export const currentPath = () =>
  typeof window === 'undefined' ? '/' : normalize(window.location.pathname);

export function useRouter(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) throw new Error('useRouter must be used inside <RouterProvider>');
  return value;
}
