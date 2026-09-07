"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, Radar } from "lucide-react";

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
      <Link
        href="/dashboard"
        aria-label={collapsed ? "TraceChain home" : undefined}
        className="flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9882B9]"
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-[#9882B9]/40 bg-[#1C1428]"
        >
          <Radar className="h-4 w-4 text-[#9882B9]" />
        </span>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight text-text-primary">
            TRACECHAIN
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9882B9]"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
