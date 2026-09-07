import { Settings } from "lucide-react";
import SidebarItem from "./SidebarItem";

interface SidebarFooterProps {
  collapsed: boolean;
}

export default function SidebarFooter({ collapsed }: SidebarFooterProps) {
  return (
    <div className="shrink-0 border-t border-border px-2 py-3">
      <SidebarItem
        item={{ label: "Settings", href: "/settings", icon: Settings }}
        collapsed={collapsed}
      />
    </div>
  );
}
