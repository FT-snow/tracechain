"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarTooltip from "./SidebarTooltip";

export interface SidebarItemData {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarItemProps {
  item: SidebarItemData;
  collapsed: boolean;
}

export default function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const active = pathname === item.href;
  const Icon = item.icon;

  return (
    <div className="group relative">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={cn(
          "relative flex items-center gap-3 rounded-[10px] py-2 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9882B9]",
          collapsed
            ? "mx-auto h-10 w-10 justify-center"
            : "px-3",
          active
            ? "bg-[#221932] text-text-primary"
            : "text-text-secondary hover:bg-[#221932] hover:text-text-primary",
        )}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#9882B9]"
          />
        )}
        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
              className="whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
      {collapsed && <SidebarTooltip label={item.label} />}
    </div>
  );
}
