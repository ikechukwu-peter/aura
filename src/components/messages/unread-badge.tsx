"use client";

import { useEffect, useState } from "react";

type UnreadBadgeProps = {
  className: string;
};

export default function UnreadBadge({ className }: UnreadBadgeProps) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const res = await fetch("/api/messages/unread-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (active) setCount(typeof data.count === "number" ? data.count : 0);
      } catch {
        // ignore
      }
    };
    run();
    const interval = setInterval(run, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (!count || count <= 0) return null;
  return (
    <span className={className}>
      {count}
    </span>
  );
}
