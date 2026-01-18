"use client";

import { useEffect, useRef } from "react";

export function useOvershoot(options?: {
  duration?: number;
  spring?: number;
  damping?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Apply overshoot animation on mount
    element.style.transform = "scale(0.8) translateY(20px)";
    element.style.opacity = "0";
    element.style.transition = `
      transform ${options?.duration || 600}ms cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity ${options?.duration || 600}ms ease-out
    `;

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
      }
    };
  }, [options?.duration]);

  return ref;
}

export function useOvershootStagger(delay: number = 100) {
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    const items = Array.from(itemsRef.current.values());

    items.forEach((element, index) => {
      if (!element) return;

      element.style.transform = "scale(0.8) translateY(20px)";
      element.style.opacity = "0";
      element.style.transition = `
        transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 600ms ease-out
      `;
      element.style.transitionDelay = `${index * delay}ms`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          element.style.transform = "scale(1) translateY(0)";
          element.style.opacity = "1";
        });
      });
    });

    return () => {
      items.forEach((element) => {
        if (element) {
          element.style.transition = "";
          element.style.transform = "";
          element.style.opacity = "";
          element.style.transitionDelay = "";
        }
      });
    };
  }, [delay]);

  return itemsRef;
}
