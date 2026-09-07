interface SidebarTooltipProps {
  label: string;
}

export default function SidebarTooltip({ label }: SidebarTooltipProps) {
  return (
    <span
      aria-hidden="true"
      role="presentation"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#9882B9]/25 bg-[#1C1428] px-2.5 py-1.5 text-xs text-text-primary opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
    >
      {label}
    </span>
  );
}
