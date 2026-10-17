"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface HoverLabelProps {
  children: ReactNode;
  className?: string;
}

export default function HoverLabel({
  children,
  className = "",
}: HoverLabelProps) {
  const trackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const label = trackRef.current;
    const control = label?.closest<HTMLElement>("button, a");
    if (!control || !label) return;

    const animateTo = (yPercent: number) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.to(label, {
        yPercent,
        duration: 0.24,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const onPointerEnter = () => animateTo(-50);
    const onPointerLeave = () => animateTo(0);
    const onFocus = () => animateTo(-50);
    const onBlur = () => animateTo(0);

    control.addEventListener("pointerenter", onPointerEnter);
    control.addEventListener("pointerleave", onPointerLeave);
    control.addEventListener("focus", onFocus, true);
    control.addEventListener("blur", onBlur, true);

    return () => {
      control.removeEventListener("pointerenter", onPointerEnter);
      control.removeEventListener("pointerleave", onPointerLeave);
      control.removeEventListener("focus", onFocus, true);
      control.removeEventListener("blur", onBlur, true);
      gsap.killTweensOf(label);
    };
  }, []);

  return (
    <span
      className={`inline-flex h-[1em] max-w-full overflow-hidden align-middle leading-[1em] ${className}`}
    >
      <span ref={trackRef} className="flex h-[2em] flex-col">
        <span className="block h-[1em] shrink-0">{children}</span>
        <span aria-hidden="true" className="block h-[1em] shrink-0">
          {children}
        </span>
      </span>
    </span>
  );
}
