"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative h-10 w-10 flex items-center justify-center rounded-xl glass glass-hover border-border/40 dark:border-border cursor-pointer overflow-hidden group transition-all active:scale-90"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
