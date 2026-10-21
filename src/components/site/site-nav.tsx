"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isActive, mainContentId, primaryNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SiteNav({ actions }: { actions?: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [renderedPath, setRenderedPath] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // Removes the one-shot listeners that restore focus after an outside press.
  const pendingRestoreRef = useRef<(() => void) | null>(null);
  // Removes the touch listeners that wait for a tap to finish.
  const pendingTouchRef = useRef<(() => void) | null>(null);

  if (pathname !== renderedPath) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  // When the path changes while focus is inside the nav and the collapsed
  // mobile menu has just hidden it (Back or Forward), focus would drop to
  // body, so move it to main. At md and wider the nav stays visible and focus
  // follows normal Next.js behavior.
  useLayoutEffect(() => {
    const navEl = navRef.current;
    if (
      navEl?.contains(document.activeElement) &&
      navEl.checkVisibility?.() === false
    ) {
      document.getElementById(mainContentId)?.focus({ preventScroll: true });
    }
  }, [renderedPath]);

  useEffect(() => {
    const ref = pendingRestoreRef;
    return () => {
      ref.current?.();
      ref.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    pendingRestoreRef.current?.();
    pendingRestoreRef.current = null;
    return () => {
      pendingTouchRef.current?.();
      pendingTouchRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        pendingRestoreRef.current?.();
        pendingRestoreRef.current = null;
        pendingTouchRef.current?.();
        pendingTouchRef.current = null;
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function isInside(target: Node) {
      const toggle = toggleRef.current;
      const header = toggle?.closest("header") ?? null;
      if (header) return header.contains(target);
      return (
        (toggle?.parentElement?.contains(target) ?? false) ||
        (navRef.current?.contains(target) ?? false)
      );
    }

    function restoreFocusIfLost() {
      const active = document.activeElement;
      if (
        !active ||
        active === document.body ||
        (navRef.current?.contains(active) ?? false)
      ) {
        toggleRef.current?.focus({ preventScroll: true });
      }
    }

    function closeFromOutside() {
      const focusWasInNav =
        navRef.current?.contains(document.activeElement) ?? false;
      setOpen(false);
      if (!focusWasInNav) return;
      // Wait for the press to settle: the browser moves focus after pointerdown.
      const done = () => {
        remove();
        pendingRestoreRef.current = null;
        restoreFocusIfLost();
      };
      const remove = () => {
        document.removeEventListener("click", done, true);
        document.removeEventListener("pointercancel", done, true);
      };
      document.addEventListener("click", done, true);
      document.addEventListener("pointercancel", done, true);
      pendingRestoreRef.current = remove;
    }

    function onPointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node) || isInside(event.target)) return;
      if (event.pointerType !== "touch") {
        closeFromOutside();
        return;
      }
      // Touch closes on tap only, so a scroll gesture leaves the menu open.
      pendingTouchRef.current?.();
      const id = event.pointerId;
      const remove = () => {
        document.removeEventListener("pointerup", onUp, true);
        document.removeEventListener("pointercancel", onCancel, true);
        pendingTouchRef.current = null;
      };
      function onUp(upEvent: PointerEvent) {
        if (upEvent.pointerId !== id) return;
        remove();
        closeFromOutside();
      }
      function onCancel(cancelEvent: PointerEvent) {
        if (cancelEvent.pointerId === id) remove();
      }
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("pointercancel", onCancel, true);
      pendingTouchRef.current = remove;
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(min-width: 48rem)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  return (
    <>
      <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
        {actions}
        <button
          type="button"
          ref={toggleRef}
          data-menu-toggle=""
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-10 items-center rounded-md border border-input px-3 text-sm font-medium print:hidden md:hidden"
        >
          Menu
        </button>
      </div>
      <nav
        ref={navRef}
        id="primary-navigation"
        data-primary-nav=""
        aria-label="Primary"
        className={cn(
          open ? "block" : "hidden",
          "basis-full md:block md:basis-auto",
        )}
      >
        <ul className="flex flex-col gap-1 py-2 md:flex-row md:flex-wrap md:gap-x-1 md:py-0">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={(event) => {
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey ||
                      event.button !== 0
                    )
                      return;
                    if (!open) return;
                    setOpen(false);
                    document
                      .getElementById(mainContentId)
                      ?.focus({ preventScroll: true });
                  }}
                  className={cn(
                    "inline-flex min-h-10 items-center px-2 text-sm transition-colors motion-reduce:transition-none",
                    active
                      ? "font-semibold text-foreground underline decoration-2 underline-offset-4"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
