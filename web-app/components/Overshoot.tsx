"use client";

import { CSSProperties, ReactNode, useEffect, useRef } from "react";

interface OvershootProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  spring?: "gentle" | "normal" | "bouncy";
}

const springPresets = {
  gentle: "cubic-bezier(0.34, 1.3, 0.64, 1)",
  normal: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

export function Overshoot({
  children,
  delay = 0,
  duration = 600,
  className = "",
  style = {},
  spring = "normal",
}: OvershootProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Initial state
    element.style.transform = "scale(0.8) translateY(20px)";
    element.style.opacity = "0";
    element.style.transition = `
      transform ${duration}ms ${springPresets[spring]},
      opacity ${duration}ms ease-out
    `;
    element.style.transitionDelay = `${delay}ms`;

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.transform = "scale(1) translateY(0)";
        element.style.opacity = "1";
      });
    });

    return () => {
      if (element) {
        element.style.transition = "";
        element.style.transform = "";
        element.style.opacity = "";
        element.style.transitionDelay = "";
      }
    };
  }, [delay, duration, spring]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

interface OvershootGroupProps {
  children: ReactNode[];
  staggerDelay?: number;
  duration?: number;
  className?: string;
  spring?: "gentle" | "normal" | "bouncy";
}

export function OvershootGroup({
  children,
  staggerDelay = 100,
  duration = 600,
  className = "",
  spring = "normal",
}: OvershootGroupProps) {
  return (
    <>
      {Array.isArray(children) &&
        children.map((child, index) => (
          <Overshoot
            key={index}
            delay={index * staggerDelay}
            duration={duration}
            spring={spring}
            className={className}
          >
            {child}
          </Overshoot>
        ))}
    </>
  );
}
