"use client";

import { useEffect, useState } from "react";

// theme toggle: light/dark/system cycle with the circular view-transition,
// same as the other two endothe.dev apps.
const modes = ["light", "dark", "system"] as const;

export function ThemeButton() {
  const [mounted, setMounted] = useState(false);
  const [pref, setPref] = useState<string>("system");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setPref(stored);
  }, []);

  const next = modes[(modes.indexOf(pref as "light") + 1) % modes.length];

  function switchTheme() {
    localStorage.setItem("theme", next);
    const resolved =
      next === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : next;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    setPref(next);
  }

  function onClick(e: React.MouseEvent) {
    if (!document.startViewTransition) {
      switchTheme();
      return;
    }
    const x = e.clientX;
    const y = e.clientY;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const t = document.startViewTransition(switchTheme);
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 600, easing: "cubic-bezier(.76,.32,.29,.99)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  if (!mounted) return <div className="size-4" />;

  return (
    <button
      aria-label={`switch to ${next} mode`}
      onClick={onClick}
      className="rounded-none border border-border px-3 py-1 text-xs text-muted-foreground hover:text-primary"
    >
      {pref === "light" ? "light" : pref === "dark" ? "dark" : "system"}
    </button>
  );
}