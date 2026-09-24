import React, { createContext, useContext, useEffect, useState } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onHash = () => setPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function Link({ to, children, className, onClick }: { to: string; children: React.ReactNode; className?: string; onClick?: () => void }) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => { e.preventDefault(); onClick?.(); navigate(to); }}
    >
      {children}
    </a>
  );
}
