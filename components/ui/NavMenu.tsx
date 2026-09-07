"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuId = "investigate" | "operations" | "evidence" | "access";

interface MenuLeaf {
  label: string;
  href: string;
  meta: string;
}

interface MenuGroup {
  id: MenuId;
  index: string;
  label: string;
  leaves: MenuLeaf[];
}

const MENUS: MenuGroup[] = [
  {
    id: "investigate",
    index: "01",
    label: "Investigate",
    leaves: [{ label: "Start a trace", href: "/trace", meta: "/trace" }],
  },
  {
    id: "operations",
    index: "02",
    label: "Operations",
    leaves: [
      { label: "Live Watch", href: "/watch", meta: "/watch" },
      { label: "Correlations", href: "/correlations", meta: "/correlations" },
      { label: "Activity map", href: "/heatmap", meta: "/heatmap" },
    ],
  },
  {
    id: "evidence",
    index: "03",
    label: "Evidence",
    leaves: [{ label: "Investigation reports", href: "/reports", meta: "/reports" }],
  },
  {
    id: "access",
    index: "04",
    label: "Access",
    leaves: [
      { label: "Officer sign in", href: "/login", meta: "/login" },
      { label: "Open workspace", href: "/dashboard", meta: "/dashboard" },
    ],
  },
];

const SETTINGS = { index: "05", label: "Settings", href: "/settings" };

interface NavMenuProps {
  collapsed: boolean;
}

export default function NavMenu({ collapsed }: NavMenuProps) {
  const [open, setOpen] = useState<{ id: MenuId; pinned: boolean } | null>(null);
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (open === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleOpen = useCallback((id: MenuId) => setOpen({ id, pinned: false }), []);
  const handleClose = useCallback(() => setOpen(null), []);
  const handleToggle = useCallback(
    (id: MenuId) =>
      setOpen((current) => (current?.id === id ? null : { id, pinned: true })),
    [],
  );
  const handlePointerLeave = useCallback(
    () => setOpen((current) => (current && current.pinned ? current : null)),
    [],
  );
  const handleBlur = useCallback((event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(null);
    }
  }, []);

  return (
    <nav
      ref={containerRef}
      aria-label="Dashboard navigation"
      className="space-y-1"
      onBlur={handleBlur}
    >
      {MENUS.map((group) => (
        <NavMenuGroup
          key={group.id}
          group={group}
          collapsed={collapsed}
          isOpen={open?.id === group.id}
          activeHref={pathname}
          reduceMotion={reduceMotion}
          onOpen={handleOpen}
          onClose={handleClose}
          onLeave={handlePointerLeave}
          onToggle={handleToggle}
        />
      ))}
      <Link
        href={SETTINGS.href}
        aria-current={pathname === SETTINGS.href ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-sm px-3 py-2 text-[15px] transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#896ABD]",
          pathname === SETTINGS.href
            ? "bg-[#22182E] text-text-primary"
            : "text-text-secondary hover:bg-[#22182E] hover:text-text-primary",
        )}
      >
        <span className="mono w-5 shrink-0 text-xs text-[#8E86A8]" aria-hidden="true">
          {SETTINGS.index}
        </span>
        {!collapsed ? (
          <span className="flex-1">{SETTINGS.label}</span>
        ) : (
          <span className="sr-only">{SETTINGS.label}</span>
        )}
      </Link>
    </nav>
  );
}

interface NavMenuGroupProps {
  group: MenuGroup;
  collapsed: boolean;
  isOpen: boolean;
  activeHref: string;
  reduceMotion: boolean;
  onOpen: (id: MenuId) => void;
  onClose: () => void;
  onLeave: () => void;
  onToggle: (id: MenuId) => void;
}

const NavMenuGroup = memo(function NavMenuGroup({
  group,
  collapsed,
  isOpen,
  activeHref,
  reduceMotion,
  onOpen,
  onClose,
  onLeave,
  onToggle,
}: NavMenuGroupProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const suppressFocusRef = useRef(false);
  const panelId = `${group.id}-menu`;
  const containsActive = group.leaves.some((leaf) => leaf.href === activeHref);

  const panelVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 7 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : 4,
      transition: { duration: reduceMotion ? 0 : 0.12, ease: "easeIn" },
    },
  };

  const handleFocus = useCallback(() => {
    if (suppressFocusRef.current) {
      suppressFocusRef.current = false;
      return;
    }
    onOpen(group.id);
  }, [onOpen, group.id]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape" && isOpen) {
        suppressFocusRef.current = true;
        onClose();
        buttonRef.current?.focus();
      }
    },
    [isOpen, onClose],
  );

  return (
    <div
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onOpen(group.id);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onLeave();
      }}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(group.id)}
        onFocus={handleFocus}
        className={cn(
          "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#896ABD]",
          isOpen || containsActive
            ? "bg-[#22182E] text-text-primary"
            : "text-text-secondary hover:bg-[#22182E] hover:text-text-primary",
        )}
      >
        <span className="mono w-5 shrink-0 text-xs text-[#8E86A8]" aria-hidden="true">
          {group.index}
        </span>
        {collapsed ? (
          <span className="sr-only">{group.label}</span>
        ) : (
          <span className="flex-1 truncate">{group.label}</span>
        )}
        {!collapsed && (
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-[#8E86A8] transition-transform duration-150 motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute z-50",
              collapsed ? "left-full top-0 pl-2" : "left-0 top-full w-60 pt-1.5",
            )}
          >
            <div className="w-60 rounded-sm border border-[#896ABD]/25 bg-[#17111F] pb-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
              {!collapsed && (
                <div className="border-b border-[#22182E] px-3 py-2">
                  <span className="mono text-xs uppercase tracking-[0.18em] text-[#8E86A8]">
                    {group.index} · {group.label}
                  </span>
                </div>
              )}
              <ul className="pt-1.5">
                {group.leaves.map((leaf) => {
                  const active = leaf.href === activeHref;
                  return (
                    <li key={leaf.href}>
                      <Link
                        href={leaf.href}
                        aria-current={active ? "page" : undefined}
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-sm px-3 py-2.5 transition-colors",
                          "outline-none focus-visible:bg-[#22182E] focus-visible:ring-1 focus-visible:ring-[#896ABD]",
                          active ? "bg-[#22182E]" : "hover:bg-[#22182E] hover:text-[#EDEAF6]",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[15px]",
                            active ? "text-[#EDEAF6]" : "text-[#C9C3DC]",
                          )}
                        >
                          {leaf.label}
                        </span>
                        <span
                          className={cn(
                            "mono text-xs",
                            active ? "text-[#C084FC]" : "text-[#8E86A8]",
                          )}
                        >
                          {leaf.meta}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
