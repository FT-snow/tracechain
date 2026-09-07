"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { cn } from "@/lib/utils";

const sidebarIn: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const headerIn: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const contentIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
};

const nav = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Trace Wallet", href: "/trace" },
  { label: "NFTs", href: "/nft" },
  { label: "Live Watch", href: "/watch" },
  { label: "Reports", href: "/reports" },
  { label: "Heat Map", href: "/heatmap" },
  { label: "Provenance", href: "/provenance" },
  { label: "Terminal", href: "/terminal" },
  { label: "Settings", href: "/settings" },
];

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const anim = reduceMotion ? {} : {
    initial: "hidden",
    animate: "visible",
  } as const;

  // hover-open rail: no click needed — pointer enters the collapsed bar,
  // it expands; leaving collapses it back after a short delay
  const hoverOpenTimer = useRef<number | null>(null);

  const expandOnHover = useCallback(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    if (hoverOpenTimer.current) {
      window.clearTimeout(hoverOpenTimer.current);
      hoverOpenTimer.current = null;
    }
    if (collapsed) {
      hoverOpenTimer.current = window.setTimeout(() => setCollapsed(false), 220);
    }
  }, [collapsed]);

  const collapseOnLeave = useCallback(() => {
    if (hoverOpenTimer.current) {
      window.clearTimeout(hoverOpenTimer.current);
      hoverOpenTimer.current = null;
    }
    if (!collapsed) {
      hoverOpenTimer.current = window.setTimeout(() => setCollapsed(true), 450);
    }
  }, [collapsed]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <span className="mono text-sm text-text-muted">
          {isLoading ? "checking session…" : "redirecting to sign in"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <motion.aside
        {...anim}
        variants={sidebarIn}
        onMouseEnter={expandOnHover}
        onMouseLeave={collapseOnLeave}
        className={cn(
          "hidden flex-col border-r border-border bg-surface transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link href="/dashboard" className="text-sm font-bold text-text-primary">
              TraceChain
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded text-text-muted hover:text-text-primary"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-3">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-surface-3 text-text-primary"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                )}
              >
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-60 border-r border-border bg-surface">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Link href="/dashboard" className="text-sm font-bold text-text-primary">
                TraceChain
              </Link>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4 text-text-muted" />
              </button>
            </div>
            <nav className="space-y-1 px-2 py-3">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-surface-3 text-text-primary"
                        : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                    )}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <motion.header
          {...anim}
          variants={headerIn}
          className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6"
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
            system operational
          </span>
          <button
            onClick={() => signOut()}
            className="mono text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            sign out
          </button>
        </motion.header>
        <motion.main
          {...anim}
          variants={contentIn}
          className="flex-1 overflow-auto p-4 md:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
