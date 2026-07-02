"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal — the app works fine without offline caching, it just
        // won't load with zero connectivity until this succeeds once.
      });
    }
  }, []);

  return null;
}
