"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, Variants } from "framer-motion";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { cn } from "@/lib/utils";
import Sidebar, { NAV_ITEMS } from "@/components/sidebar/Sidebar";

const headerIn: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const contentIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
};

const MOBILE_NAV = [{ label: "Home", href: "/" }, ...NAV_ITEMS];

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleToggleSidebar = useCallback(() => setCollapsed((c) => !c), []);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      router.replace("/");
    }
  }, [signOut, router]);

  const anim = reduceMotion ? {} : {
    initial: "hidden",
    animate: "visible",
  } as const;

  useEffect(() => {
    if (signingOut) return;
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [signingOut, isLoading, isAuthenticated, router]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const sync = () => {
      if (mq.matches) setCollapsed(true);
    };
    mq.addEventListener("change", sync);
    sync();
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg">
        <span role="status" className="mono text-sm text-text-secondary">
          {signingOut ? "signing out…" : isLoading ? "checking session…" : "redirecting to sign in…"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-[#1C1428] focus:px-3 focus:py-2 focus:text-[15px] focus:text-text-primary"
      >
        Skip to content
      </a>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} />

      {/* Mobile sidebar */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="absolute inset-0 bg-black/60"
              aria-hidden="true"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-60 overscroll-contain border-r border-border bg-bg"
            >
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <Link href="/dashboard" translate="no" className="text-base font-bold text-text-primary">
                  TraceChain
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                  autoFocus
                  className="flex h-8 w-8 items-center justify-center rounded text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9882B9]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <nav aria-label="Mobile navigation" className="space-y-1 px-2 py-3">
                {MOBILE_NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-sm px-3 py-2 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9882B9]",
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <motion.header
          {...anim}
          variants={headerIn}
          className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg px-4 md:px-6"
        >
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="flex h-9 w-9 items-center justify-center rounded border border-border text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9882B9] md:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="mono text-xs uppercase tracking-[0.16em] text-text-secondary">
            system operational
          </span>
          <button
            onClick={handleSignOut}
            className="mono text-xs text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9882B9]"
          >
            sign out
          </button>
        </motion.header>
        <motion.main
          id="main-content"
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
