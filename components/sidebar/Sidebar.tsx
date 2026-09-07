"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Eye, FileText, LayoutDashboard, Map, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarHeader from "./SidebarHeader";
import SidebarItem, { type SidebarItemData } from "./SidebarItem";
import SidebarFooter from "./SidebarFooter";

export const NAV_ITEMS: SidebarItemData[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Investigate", href: "/trace", icon: Search },
  { label: "Live Watch", href: "/watch", icon: Eye },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Heat Map", href: "/heatmap", icon: Map },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const reduceMotion = useReducedMotion() ?? false;

  const asideIn: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const anim = reduceMotion ? {} : { initial: "hidden", animate: "visible" } as const;

  return (
    <motion.aside
      {...anim}
      variants={asideIn}
      className={cn(
        "hidden shrink-0 flex-col border-r border-border transition-[width] duration-300 ease-out motion-reduce:transition-none md:flex",
        collapsed ? "w-20" : "w-60",
      )}
    >
      <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 px-2 py-3">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>
      <SidebarFooter collapsed={collapsed} />
    </motion.aside>
  );
}
