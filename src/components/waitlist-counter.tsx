"use client";

import { useEffect, useState } from "react";

export default function WaitlistCounter({
  increment = 0,
}: {
  increment?: number;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
    if (!url) return;

    async function fetchCount() {
      try {
        const res = await fetch(url!);
        const data = await res.json();
        setCount(Math.max(0, data.count - 1));
      } catch {
        /* silently fail */
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const displayCount = count !== null ? count + increment : null;

  if (displayCount === null) return null;

  return (
    <div className="text-center text-sm text-neutral-400">
      <span className="font-semibold text-white">
        {displayCount.toLocaleString()}
      </span>{" "}
      on the waitlist
    </div>
  );
}
