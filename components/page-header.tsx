"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Path of the last header mount. A mount on a new path is a client navigation.
// A mount on the same path (full page load, StrictMode re-run) leaves focus on
// body so the first Tab still starts at the skip link.
let lastPathname: string | null = null;

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    const navigated = lastPathname !== null && lastPathname !== pathname;
    lastPathname = pathname;
    if (!navigated) return;

    // Next can leave the previous page's focused node connected during this layout pass, so re-check on the next frame.
    const active = document.activeElement;
    const frame = requestAnimationFrame(() => {
      if (active === document.body) {
        if (document.activeElement === document.body) heading.focus();
        return;
      }
      if (active instanceof Element && active.isConnected) return;
      if (document.activeElement === document.body) heading.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-[0.16em] text-indigo uppercase">{eyebrow}</p>
        ) : null}
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
