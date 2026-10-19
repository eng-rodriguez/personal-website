/*
 * Theme choice (ADR 0004). The choice lives in the data-theme attribute on
 * <html> (absent means System) and, for Light and Dark, in localStorage.
 * This module has no React import and no window access at import time, so the
 * root layout can import it on the server. No other module reads or writes
 * localStorage or data-theme.
 */
export type ThemeChoice = "system" | "light" | "dark";

export const themeChoices = [
  "system",
  "light",
  "dark",
] as const satisfies readonly ThemeChoice[];

export const themeStorageKey = "site-theme";
export const themeAttribute = "data-theme";
export const scriptReadyAttribute = "data-js";

/** Allowlist: exactly "light" or "dark" is explicit, anything else is System. */
export function parseThemeChoice(value: unknown): ThemeChoice {
  return value === "light" || value === "dark" ? value : "system";
}

/** Reads the in-session choice from <html>. Never touches storage. */
export function readThemeChoice(): ThemeChoice {
  return parseThemeChoice(
    document.documentElement.getAttribute(themeAttribute),
  );
}

const subscribers = new Set<() => void>();

function applyAttribute(choice: ThemeChoice): void {
  if (choice === "system") {
    document.documentElement.removeAttribute(themeAttribute);
  } else {
    document.documentElement.setAttribute(themeAttribute, choice);
  }
}

/** Attribute first, storage second; a storage failure keeps the session choice. */
export function setThemeChoice(choice: ThemeChoice): void {
  applyAttribute(choice);
  try {
    if (choice === "system") {
      localStorage.removeItem(themeStorageKey);
    } else {
      localStorage.setItem(themeStorageKey, choice);
    }
  } catch {
    // Blocked or full storage: the choice applies for this session only.
  }
  subscribers.forEach((onChange) => onChange());
}

function onStorage(event: StorageEvent): void {
  // A null key means localStorage.clear().
  if (event.key !== null && event.key !== themeStorageKey) return;
  applyAttribute(parseThemeChoice(event.newValue));
  subscribers.forEach((onChange) => onChange());
}

export function subscribeThemeChoice(onChange: () => void): () => void {
  subscribers.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    subscribers.delete(onChange);
    if (subscribers.size === 0) {
      window.removeEventListener("storage", onStorage);
    }
  };
}

/** Constant pre-paint script for the root layout <head>. */
export const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem(${JSON.stringify(themeStorageKey)});if(t==="light"||t==="dark")d.setAttribute(${JSON.stringify(themeAttribute)},t)}catch(e){}d.setAttribute(${JSON.stringify(scriptReadyAttribute)},"")})()`;
