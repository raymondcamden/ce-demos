"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function focusWithoutRing(target: HTMLElement) {
  // Headings are not in the tab sequence. tabindex -1 accepts programmatic
  // focus; outline-none keeps that focus from drawing a ring.
  if (!target.hasAttribute("tabindex")) {
    target.tabIndex = -1;
    target.classList.add("outline-none");
  }
  target.focus();
}

export function RouteFocus() {
  const pathname = usePathname();
  // Seeded on first render so the mount effect does not move focus.
  // Updated when the heading is focused, so a strict-mode replay can retry.
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    const main = document.querySelector("main");
    if (!(main instanceof HTMLElement)) return;

    const heading = () => {
      const found = main.querySelector("h1");
      return found instanceof HTMLElement ? found : null;
    };

    const moveToHeading = (target: HTMLElement) => {
      const active = document.activeElement;
      const untouched =
        active == null ||
        active === document.body ||
        active === document.documentElement ||
        active === main ||
        active === target;
      if (untouched) focusWithoutRing(target);
      previousPathname.current = pathname;
    };

    const immediate = heading();
    if (immediate) {
      moveToHeading(immediate);
      return;
    }

    // Route loading skeletons render inside main before the page heading.
    // A one-shot query focuses main and then misses the heading.
    let fallback = 0;
    const observer = new MutationObserver(() => {
      const next = heading();
      if (!next) return;
      observer.disconnect();
      window.clearTimeout(fallback);
      moveToHeading(next);
    });
    observer.observe(main, { childList: true, subtree: true });

    fallback = window.setTimeout(() => {
      if (previousPathname.current === pathname || heading()) return;
      focusWithoutRing(main);
    }, 2000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [pathname]);

  return null;
}
