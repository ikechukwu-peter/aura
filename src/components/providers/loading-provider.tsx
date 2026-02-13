"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, speed: 500, minimum: 0.3 });

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && 
          anchor.href && 
          anchor.href.startsWith(window.location.origin) && 
          !anchor.target && 
          !e.ctrlKey && 
          !e.metaKey && 
          !e.shiftKey && 
          !e.altKey) {
        // Only start if it's a different path
        const url = new URL(anchor.href);
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          NProgress.start();
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    NProgress.done();

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      NProgress.start();
    };
  }, [pathname, searchParams]);

  return <>{children}</>;
}
