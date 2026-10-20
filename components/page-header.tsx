"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

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

  useLayoutEffect(() => {
    const focusHeadingIfBody = () => {
      if (document.activeElement === document.body) {
        headingRef.current?.focus();
      }
    };

    // Sidebar links stay focused because the shell does not unmount. Only
    // recover when focus has fallen to body. Next may not have dropped the
    // previous in-content node during this layout pass, so a body result is
    // confirmed on the next frame and a node that disappears in that gap is
    // checked again. A control that still holds focus is left alone.
    const active = document.activeElement;
    if (active !== document.body) {
      const frame = requestAnimationFrame(() => {
        if (active?.isConnected) return;
        focusHeadingIfBody();
      });
      return () => cancelAnimationFrame(frame);
    }

    const frame = requestAnimationFrame(focusHeadingIfBody);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-[0.16em] text-indigo uppercase">{eyebrow}</p>
        ) : null}
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
