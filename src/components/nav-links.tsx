"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  History,
  KeyRound,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react";
import { cn } from "cn";
import type { IconName, MenuItem } from "@/lib/roles";

const ICONS: Record<IconName, typeof User> = {
  "layout-dashboard": LayoutDashboard,
  calendar: Calendar,
  users: Users,
  award: Award,
  "file-spreadsheet": FileSpreadsheet,
  "check-square": CheckSquare,
  history: History,
  user: User,
  "key-round": KeyRound,
};

/** Menu: dọc ở máy tính, thanh cuộn ngang ở điện thoại */
export function NavLinks({
  items,
  layout,
}: {
  items: MenuItem[];
  layout: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const home = items[0]?.href;

  return (
    <nav
      className={cn(
        layout === "vertical"
          ? "flex flex-col gap-1"
          : "flex gap-1 overflow-x-auto px-4 pb-2"
      )}
    >
      {items.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        const active =
          href === home ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[#0b4f9c] text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
