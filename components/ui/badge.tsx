import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const badgeVariants = {
  default: "border-transparent bg-text-primary text-bg",
  secondary: "border-transparent bg-surface-3 text-text-primary",
  destructive: "border-transparent bg-risk-hi text-bg",
  outline: "border-border text-text-primary",
  ghost: "border-transparent bg-transparent text-text-secondary",
} as const;

export function Badge({
  className,
  variant = "default",
  ...props
}: ComponentProps<"span"> & { variant?: keyof typeof badgeVariants }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-[6px] border px-2 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
