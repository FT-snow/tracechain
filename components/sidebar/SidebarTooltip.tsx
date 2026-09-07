interface SidebarTooltipProps {
  label: string;
}

export default function SidebarTooltip({ label }: SidebarTooltipProps) {
  return (
    <span
      aria-hidden="true"
      role="presentation"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-sm border border-[#896ABD]/25 bg-[#17111F] px-2.5 py-1.5 text-xs text-[#EDEAF6] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
    >
      {label}
    </span>
  );
}
