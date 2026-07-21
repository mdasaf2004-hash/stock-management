"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Users,
  ArrowLeftRight,
  Settings,
  ClipboardList,
  BarChart,
  Activity,
  UserCog,
  Clock,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/warehouses", label: "Warehouses", icon: Warehouse },
  { href: "/materials", label: "Materials", icon: Package },
  { href: "/stock", label: "Stock", icon: BarChart3 },
  { href: "/stock-movements", label: "Movements", icon: ArrowLeftRight },
  { href: "/orders", label: "Sales Orders", icon: ShoppingCart },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
  { href: "/shipments", label: "Shipments", icon: Truck },
  { href: "/wholesalers", label: "Suppliers", icon: Users },
  { href: "/employees", label: "Employees", icon: UserCog },
  { href: "/work-hours", label: "Work Hours", icon: Clock },
  { href: "/reports", label: "Reports", icon: BarChart },
  { href: "/activity-logs", label: "Activity Logs", icon: Activity },
];

const COLLAPSED_WIDTH = 68;
const EXPANDED_WIDTH = 240;

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const handleMouseEnter = useCallback(() => setExpanded(true), []);
  const handleMouseLeave = useCallback(() => setExpanded(false), []);

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "hidden md:flex md:flex-col border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0",
      )}
      style={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
    >
      <div className="flex h-14 items-center border-b border-border px-3 overflow-hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-lg whitespace-nowrap"
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Package className="h-4 w-4" />
          </div>
          <span
            className={cn(
              "transition-opacity duration-300",
              expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            StockPro
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                expanded ? "gap-3" : "justify-center",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-300",
                  expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <Link
          href="/dashboard"
          title="Settings"
          className={cn(
            "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground",
            expanded ? "gap-3" : "justify-center"
          )}
        >
          <Settings className="h-4.5 w-4.5 shrink-0" />
          <span
            className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}
