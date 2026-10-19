"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  readThemeChoice,
  setThemeChoice,
  subscribeThemeChoice,
  themeChoices,
  type ThemeChoice,
} from "@/lib/theme";

const labels: Record<ThemeChoice, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle() {
  // null means "unknown": the server and the hydration pass render it, so the
  // markup matches. React re-renders with the real choice right after.
  const choice = useSyncExternalStore(
    subscribeThemeChoice,
    readThemeChoice,
    () => null,
  );

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      data-theme-toggle=""
      className={cn(
        "inline-flex rounded-md border border-input",
        choice === null && "invisible",
      )}
    >
      {themeChoices.map((value) => (
        <label
          key={value}
          className="inline-flex min-h-10 cursor-pointer items-center px-3 text-sm text-muted-foreground first:rounded-s-md last:rounded-e-md has-checked:bg-primary has-checked:font-semibold has-checked:text-primary-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring forced-colors:has-checked:underline forced-colors:has-checked:decoration-2 forced-colors:has-checked:underline-offset-4"
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={choice === value}
            onChange={() => setThemeChoice(value)}
            className="sr-only"
          />
          {labels[value]}
        </label>
      ))}
    </div>
  );
}
