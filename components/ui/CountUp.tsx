"use client";

import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

export interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  prefix?: string;
  suffix?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

function getDecimalPlaces(num: number): number {
  const str = num.toString();
  if (str.includes(".")) {
    const decimals = str.split(".")[1];
    if (Number.parseInt(decimals, 10) !== 0) {
      return decimals.length;
    }
  }
  return 0;
}

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  prefix = "",
  suffix = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const startedRef = useRef(false);

  const finite = Number.isFinite(to) && Number.isFinite(from);

  const motionValue = useMotionValue(direction === "down" ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, {
    damping,
    stiffness,
  });

  const isInView = useInView(ref, { once: true, margin: "0px" });

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number): string => {
      const formattedNumber = new Intl.NumberFormat("en-US", {
        useGrouping: Boolean(separator),
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals,
      }).format(latest);
      const body = separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
      return `${prefix}${body}${suffix}`;
    },
    [maxDecimals, separator, prefix, suffix],
  );

  const composeInitial = useCallback(
    (): string => (finite ? formatValue(direction === "down" ? to : from) : ""),
    [finite, formatValue, direction, from, to],
  );

  const composeFinal = useCallback(
    (): string => (finite ? formatValue(direction === "down" ? from : to) : ""),
    [finite, formatValue, direction, from, to],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      el.textContent = composeFinal();
      return;
    }
    el.textContent = composeInitial();
  }, [reduceMotion, composeInitial, composeFinal]);

  useEffect(() => {
    if (!isInView || !startWhen || reduceMotion || !finite) return;

    if (typeof onStart === "function") onStart();

    const timeoutId = setTimeout(() => {
      motionValue.set(direction === "down" ? from : to);
      startedRef.current = true;
    }, delay * 1000);

    const durationTimeoutId = setTimeout(() => {
      if (typeof onEnd === "function") onEnd();
    }, delay * 1000 + duration * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(durationTimeoutId);
    };
  }, [
    isInView,
    startWhen,
    reduceMotion,
    finite,
    motionValue,
    direction,
    from,
    to,
    delay,
    duration,
    onStart,
    onEnd,
  ]);

  useEffect(() => {
    if (!startedRef.current) return;
    if (!finite) return;
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = composeFinal();
      return;
    }
    motionValue.set(direction === "down" ? from : to);
  }, [to, from, direction, finite, reduceMotion, motionValue, composeFinal]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest: number) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest);
      }
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  return (
    <span
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: composeInitial() }}
    />
  );
}
